import { type NextRequest, NextResponse } from "next/server"
import { supabase, isSupabaseReady } from "@/lib/supabase"
import { PaywallService } from "@/lib/paywall"

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("🔍 Debug paywall endpoint called")

    if (!isSupabaseReady || !supabase) {
      return NextResponse.json({
        success: false,
        error: "Supabase not configured",
        isSupabaseReady,
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      })
    }

    // Get user from Supabase auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("User:", user ? user.id : "None", "Auth error:", authError?.message)

    // Check if subscription tables exist by trying to query them
    let tablesExist = false
    let tablesError = null

    try {
      const { data: subscriptionTest, error: subError } = await supabase
        .from("user_subscriptions")
        .select("id")
        .limit(1)

      const { data: usageTest, error: usageError } = await supabase.from("usage_records").select("id").limit(1)

      tablesExist = !subError && !usageError
      tablesError = subError?.message || usageError?.message
    } catch (error) {
      tablesError = error instanceof Error ? error.message : "Unknown error"
    }

    // Try to check feature access (this might fail if tables don't exist)
    let paywallInfo = null
    let paywallError = null
    try {
      paywallInfo = await PaywallService.checkFeatureAccess("cv_optimizations")
    } catch (error) {
      paywallError = error instanceof Error ? error.message : "Unknown error"
      console.error("Error checking feature access:", error)
    }

    // Test Stripe configuration (server-side check)
    let stripeTestResult = null
    try {
      // Check Stripe configuration at the server level (same as in create-checkout route)
      const requiredEnvVars = {
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      }

      const missingVars = Object.entries(requiredEnvVars)
        .filter(([key, value]) => !value)
        .map(([key]) => key)

      stripeTestResult = {
        configured: missingVars.length === 0,
        missingKeys: missingVars,
      }
    } catch (error) {
      stripeTestResult = {
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      user: user
        ? {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
          }
        : null,
      authError: authError?.message,
      database: {
        isSupabaseReady,
        tablesExist,
        tablesError,
      },
      paywall: {
        paywallInfo,
        paywallError,
      },
      stripe: stripeTestResult,
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
        hasStripePublishable: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        hasStripeWebhook: !!process.env.STRIPE_WEBHOOK_SECRET,
        nodeEnv: process.env.NODE_ENV,
      },
    })
  } catch (error) {
    console.error("Debug paywall error:", error)
    return NextResponse.json({
      success: false,
      error: "Debug failed",
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}
