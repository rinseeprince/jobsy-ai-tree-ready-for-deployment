import { NextRequest, NextResponse } from "next/server"
import { supabase, isSupabaseReady } from "@/lib/supabase"
import { SUBSCRIPTION_PLANS, SubscriptionService } from "@/lib/subscription"

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
    console.log("🔍 Stripe checkout API called")

    // Check if user is authenticated
    if (!isSupabaseReady || !supabase) {
      return NextResponse.json(
        {
          success: false,
          error: "Database not configured. Please contact support.",
        },
        { status: 500 }
      )
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not authenticated",
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { planId } = body

    if (!planId) {
      return NextResponse.json(
        {
          success: false,
          error: "Plan ID is required",
        },
        { status: 400 }
      )
    }

    // Find the plan
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid plan ID",
        },
        { status: 400 }
      )
    }

    // If it's the free plan, create subscription directly without Stripe
    if (plan.tier === "free") {
      const subscription = await SubscriptionService.createSubscription(planId)
      if (subscription) {
        return NextResponse.json({
          success: true,
          message: "Free subscription activated successfully",
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to activate free subscription",
          },
          { status: 500 }
        )
      }
    }

    // Check if Stripe is configured
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      console.warn("⚠️ Stripe not configured, returning error")
      return NextResponse.json(
        {
          success: false,
          error: "Payment processing is not configured. Please contact support.",
        },
        { status: 503 }
      )
    }

    // Check if plan has Stripe price ID
    if (!plan.stripePriceId) {
      return NextResponse.json(
        {
          success: false,
          error: "Plan is not configured for payment processing",
        },
        { status: 400 }
      )
    }

    // Get user profile for Stripe customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single()

    const customerEmail = profile?.email || user.email
    const customerName = profile?.full_name || user.user_metadata?.full_name

    // Create or get Stripe customer
    let customerId: string
    const { data: existingCustomers } = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id
    } else {
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?canceled=true`,
      metadata: {
        plan_id: planId,
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          plan_id: planId,
          user_id: user.id,
        },
      },
    })

    console.log("✅ Stripe checkout session created:", {
      sessionId: session.id,
      planId,
      customerId,
    })

    return NextResponse.json({
      success: true,
      sessionUrl: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error("❌ Error in Stripe checkout:", error)
    
    // Handle Stripe-specific errors
    if (error instanceof Error && error.message.includes("stripe")) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment processing error. Please try again or contact support.",
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create checkout session",
      },
      { status: 500 }
    )
  }
} 