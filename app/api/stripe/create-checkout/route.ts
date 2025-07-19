import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Starting Stripe checkout creation...")

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Get the authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      console.error("❌ No authorization header found")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Set the auth token
    const token = authHeader.replace("Bearer ", "")
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: "",
    })

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("❌ Authentication failed:", authError)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    console.log("✅ User authenticated:", user.email)

    // Parse request body
    const { planId } = await request.json()

    if (!planId) {
      console.error("❌ No planId provided")
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 })
    }

    console.log("📋 Creating checkout for plan:", planId)

    // Define plan configurations
    const planConfigs = {
      "pro-monthly": {
        priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
        name: "Pro Monthly",
      },
      "pro-quarterly": {
        priceId: process.env.STRIPE_PRO_QUARTERLY_PRICE_ID!,
        name: "Pro Quarterly",
      },
      "premium-monthly": {
        priceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
        name: "Premium Monthly",
      },
      "premium-quarterly": {
        priceId: process.env.STRIPE_PREMIUM_QUARTERLY_PRICE_ID!,
        name: "Premium Quarterly",
      },
    }

    const planConfig = planConfigs[planId as keyof typeof planConfigs]

    if (!planConfig) {
      console.error("❌ Invalid plan ID:", planId)
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 })
    }

    if (!planConfig.priceId) {
      console.error("❌ Missing price ID for plan:", planId)
      return NextResponse.json({ error: "Plan configuration error" }, { status: 500 })
    }

    console.log("💳 Creating Stripe checkout session...")

    // Create Stripe checkout session (REGULAR CHECKOUT, NOT CONNECT)
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/wizard?upgrade=cancelled`,
      metadata: {
        userId: user.id,
        planId: planId,
        userEmail: user.email || "",
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: planId,
        },
      },
    })

    console.log("✅ Stripe checkout session created:", session.id)

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
    })
  } catch (error) {
    console.error("❌ Stripe checkout creation failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
