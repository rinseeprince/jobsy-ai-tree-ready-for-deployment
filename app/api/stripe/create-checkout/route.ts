import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Initialize Stripe with proper import
let stripe: any = null
try {
  if (process.env.STRIPE_SECRET_KEY) {
    const Stripe = require("stripe")
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16", // Use a recent API version
    })
    console.log("✅ Stripe client initialized successfully")
  } else {
    console.warn("⚠️ STRIPE_SECRET_KEY not found")
  }
} catch (error) {
  console.error("❌ Failed to initialize Stripe client:", error)
}

const SUBSCRIPTION_PLANS = [
  {
    id: "pro-monthly",
    name: "Pro",
    tier: "pro",
    price: 19,
    billingCycle: "monthly",
    stripePriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "price_1234567890",
  },
  {
    id: "pro-quarterly",
    name: "Pro",
    tier: "pro",
    price: 45,
    billingCycle: "quarterly",
    stripePriceId: process.env.STRIPE_PRO_QUARTERLY_PRICE_ID || "price_1234567891",
  },
  {
    id: "premium-monthly",
    name: "Premium",
    tier: "premium",
    price: 39,
    billingCycle: "monthly",
    stripePriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || "price_1234567892",
  },
  {
    id: "premium-quarterly",
    name: "Premium",
    tier: "premium",
    price: 99,
    billingCycle: "quarterly",
    stripePriceId: process.env.STRIPE_PREMIUM_QUARTERLY_PRICE_ID || "price_1234567893",
  },
]

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("🔍 Stripe checkout API called")

    // Check Stripe configuration at the server level
    const requiredEnvVars = {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    }

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key)

    if (missingVars.length > 0) {
      console.error("❌ Missing Stripe environment variables:", missingVars)
      return NextResponse.json(
        {
          success: false,
          error: "Stripe configuration error. Please contact support.",
          details: `Missing environment variables: ${missingVars.join(", ")}`,
        },
        { status: 500 }
      )
    }

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("❌ Supabase not configured")
      return NextResponse.json(
        {
          success: false,
          error: "Database not configured. Please contact support.",
        },
        { status: 500 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Get authorization header from request
    const authHeader = request.headers.get("authorization")
    console.log("Auth header present:", !!authHeader)
    console.log("Auth header value:", authHeader ? authHeader.substring(0, 20) + "..." : "None")

    if (!authHeader) {
      console.error("❌ No authorization header found")
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required. Please log in and try again.",
        },
        { status: 401 },
      )
    }

    // Extract the token from the Authorization header
    const token = authHeader.replace("Bearer ", "")
    console.log("Token extracted, length:", token.length)
    console.log("Token starts with:", token.substring(0, 20) + "...")

    // Create a new Supabase client with the auth token
    const supabaseWithAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    // Check if user is authenticated
    console.log("🔍 Attempting to get user with auth token...")
    const {
      data: { user },
      error: authError,
    } = await supabaseWithAuth.auth.getUser()

    console.log("User:", user ? user.id : "None", "Auth error:", authError?.message)
    if (authError) {
      console.error("❌ Authentication error details:", {
        message: authError.message,
        status: authError.status,
        name: authError.name,
      })
    }

    if (!user) {
      console.error("❌ User not authenticated")
      return NextResponse.json(
        {
          success: false,
          error: "User not authenticated. Please log in and try again.",
        },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { planId } = body

    console.log("Plan ID requested:", planId)

    if (!planId) {
      return NextResponse.json(
        {
          success: false,
          error: "Plan ID is required",
        },
        { status: 400 },
      )
    }

    // Find the plan
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)
    if (!plan) {
      console.error("❌ Invalid plan ID:", planId)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid plan ID",
        },
        { status: 400 },
      )
    }

    console.log("Plan found:", plan.name, plan.price)
    console.log("Stripe price ID:", plan.stripePriceId)

    // Check if using fallback price IDs
    if (plan.stripePriceId.startsWith("price_123456789")) {
      console.warn("⚠️ Using fallback Stripe price ID. Please set proper environment variables.")
      return NextResponse.json(
        {
          success: false,
          error: "Payment configuration incomplete. Please contact support.",
          details: "Stripe price IDs not configured",
        },
        { status: 500 }
      )
    }

    console.log("✅ Stripe is configured")
    console.log("🔍 Stripe client type:", typeof stripe)
    console.log("🔍 Stripe client has customers property:", !!stripe?.customers)

    // Get user profile for Stripe customer
    const { data: profile, error: profileError } = await supabaseWithAuth
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single()

    console.log("Profile query result:", profile ? "Found" : "Not found", profileError?.message)

    const customerEmail = profile?.email || user.email
    const customerName = profile?.full_name || user.user_metadata?.full_name || "User"

    console.log("Customer info:", { email: customerEmail, name: customerName })

    // Create or get Stripe customer
    let customerId: string
    try {
      console.log("🔍 Checking if Stripe client is available:", !!stripe)
      if (!stripe) {
        throw new Error("Stripe client not initialized")
      }

      console.log("🔍 Searching for existing Stripe customers with email:", customerEmail)
      
      // Add more detailed error handling for the Stripe API call
      let existingCustomers
      try {
        existingCustomers = await stripe.customers.list({
          email: customerEmail,
          limit: 1,
        })
        console.log("🔍 Stripe API response received:", !!existingCustomers)
        console.log("🔍 Response structure:", Object.keys(existingCustomers || {}))
      } catch (listError) {
        console.error("❌ Error calling stripe.customers.list:", listError)
        throw listError
      }

      if (!existingCustomers || !existingCustomers.data) {
        console.error("❌ Unexpected response structure from Stripe:", existingCustomers)
        throw new Error("Invalid response from Stripe API")
      }

      console.log("🔍 Found existing customers:", existingCustomers.data.length)

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id
        console.log("✅ Found existing Stripe customer:", customerId)
      } else {
        console.log("🔍 Creating new Stripe customer with:", {
          email: customerEmail,
          name: customerName,
          metadata: { supabase_user_id: user.id }
        })
        
        let customer
        try {
          customer = await stripe.customers.create({
            email: customerEmail,
            name: customerName,
            metadata: {
              supabase_user_id: user.id,
            },
          })
          console.log("🔍 Customer creation response received:", !!customer)
          console.log("🔍 Customer response structure:", Object.keys(customer || {}))
        } catch (createError) {
          console.error("❌ Error calling stripe.customers.create:", createError)
          throw createError
        }

        if (!customer || !customer.id) {
          console.error("❌ Unexpected customer creation response:", customer)
          throw new Error("Invalid customer creation response from Stripe API")
        }

        customerId = customer.id
        console.log("✅ Created new Stripe customer:", customerId)
      }
    } catch (stripeError) {
      console.error("❌ Stripe customer error:", stripeError)
      console.error("❌ Error details:", {
        message: stripeError instanceof Error ? stripeError.message : "Unknown error",
        type: (stripeError as any)?.type || "Unknown",
        code: (stripeError as any)?.code || "Unknown",
        statusCode: (stripeError as any)?.statusCode || "Unknown",
      })
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create customer. Please try again.",
          details: stripeError instanceof Error ? stripeError.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    // Create checkout session
    try {
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
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/wizard?canceled=true`,
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
        url: session.url,
      })

      return NextResponse.json({
        success: true,
        sessionUrl: session.url,
        sessionId: session.id,
      })
    } catch (stripeError) {
      console.error("❌ Stripe session creation error:", stripeError)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create checkout session. Please try again.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Error in Stripe checkout:", error)

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
