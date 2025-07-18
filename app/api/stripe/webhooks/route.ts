import { NextRequest, NextResponse } from "next/server"
import { supabase, isSupabaseReady } from "@/lib/supabase"
import { SubscriptionService } from "@/lib/subscription"

// Initialize Stripe with graceful fallback
let stripe: any = null
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
  }
} catch (error) {
  console.warn("⚠️ Stripe not configured or failed to initialize")
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("🔍 Stripe webhook received")

    // Check if Stripe is configured
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      console.warn("⚠️ Stripe not configured, webhook ignored")
      return NextResponse.json({ received: true })
    }

    // Check if webhook secret is configured
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn("⚠️ Stripe webhook secret not configured")
      return NextResponse.json({ received: true })
    }

    // Check if database is configured
    if (!isSupabaseReady || !supabase) {
      console.warn("⚠️ Database not configured, webhook ignored")
      return NextResponse.json({ received: true })
    }

    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      console.error("❌ No Stripe signature found")
      return NextResponse.json(
        { error: "No signature" },
        { status: 400 }
      )
    }

    let event: any
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err)
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    console.log("✅ Webhook event received:", {
      type: event.type,
      id: event.id,
    })

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object)
        break

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object)
        break

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object)
        break

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object)
        break

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object)
        break

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object)
        break

      default:
        console.log("ℹ️ Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("❌ Error processing webhook:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  console.log("💰 Checkout session completed:", session.id)

  const planId = session.metadata?.plan_id
  const userId = session.metadata?.user_id

  if (!planId || !userId) {
    console.error("❌ Missing plan_id or user_id in session metadata")
    return
  }

  // Create subscription in database
  const subscription = await SubscriptionService.createSubscription(
    planId,
    session.subscription
  )

  if (subscription) {
    console.log("✅ Subscription created in database:", subscription.id)
  } else {
    console.error("❌ Failed to create subscription in database")
  }
}

async function handleSubscriptionCreated(subscription: any) {
  console.log("📅 Subscription created:", subscription.id)

  const planId = subscription.metadata?.plan_id
  const userId = subscription.metadata?.user_id

  if (!planId || !userId) {
    console.error("❌ Missing plan_id or user_id in subscription metadata")
    return
  }

  // Update subscription status if it doesn't exist
  const existingSubscription = await SubscriptionService.getUserSubscription()
  if (!existingSubscription) {
    await SubscriptionService.createSubscription(planId, subscription.id)
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log("📝 Subscription updated:", subscription.id)

  const planId = subscription.metadata?.plan_id
  const userId = subscription.metadata?.user_id

  if (!planId || !userId) {
    console.error("❌ Missing plan_id or user_id in subscription metadata")
    return
  }

  // Find and update the subscription
  if (!isSupabaseReady || !supabase) {
    console.warn("⚠️ Database not configured, cannot update subscription")
    return
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error("❌ User not found")
    return
  }

  const { data: existingSubscription } = await supabase
    .from("user_subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .eq("stripe_subscription_id", subscription.id)
    .single()

  if (existingSubscription) {
    await SubscriptionService.updateSubscription(existingSubscription.id, {
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  console.log("🗑️ Subscription deleted:", subscription.id)

  // Find and cancel the subscription
  if (!isSupabaseReady || !supabase) {
    console.warn("⚠️ Database not configured, cannot cancel subscription")
    return
  }

  const { data: existingSubscription } = await supabase
    .from("user_subscriptions")
    .select("id")
    .eq("stripe_subscription_id", subscription.id)
    .single()

  if (existingSubscription) {
    await SubscriptionService.updateSubscription(existingSubscription.id, {
      status: "canceled",
    })
  }
}

async function handleInvoicePaymentSucceeded(invoice: any) {
  console.log("💳 Invoice payment succeeded:", invoice.id)

  if (invoice.subscription) {
    // Update subscription status to active
    if (!isSupabaseReady || !supabase) {
      console.warn("⚠️ Database not configured, cannot update subscription")
      return
    }

    const { data: existingSubscription } = await supabase
      .from("user_subscriptions")
      .select("id")
      .eq("stripe_subscription_id", invoice.subscription)
      .single()

    if (existingSubscription) {
      await SubscriptionService.updateSubscription(existingSubscription.id, {
        status: "active",
      })
    }
  }
}

async function handleInvoicePaymentFailed(invoice: any) {
  console.log("❌ Invoice payment failed:", invoice.id)

  if (invoice.subscription) {
    // Update subscription status to past_due
    if (!isSupabaseReady || !supabase) {
      console.warn("⚠️ Database not configured, cannot update subscription")
      return
    }

    const { data: existingSubscription } = await supabase
      .from("user_subscriptions")
      .select("id")
      .eq("stripe_subscription_id", invoice.subscription)
      .single()

    if (existingSubscription) {
      await SubscriptionService.updateSubscription(existingSubscription.id, {
        status: "past_due",
      })
    }
  }
} 