import { SubscriptionService, SUBSCRIPTION_PLANS, type SubscriptionTier } from "./subscription"

export type Feature = "cv_generations" | "cv_optimizations" | "cover_letters" | "application_wizard"

export interface PaywallInfo {
  feature: Feature
  current: number
  limit: number | "unlimited"
  tier: SubscriptionTier
  allowed: boolean
  upgradePlans: Array<{
    id: string
    name: string
    tier: SubscriptionTier
    price: number
    billingCycle: "monthly" | "quarterly"
    savings?: string
  }>
}

export interface FeatureAccess {
  allowed: boolean
  current: number
  limit: number
  tier: "free" | "premium"
  feature: string
}

export interface SubscriptionInfo {
  isActive: boolean
  planId: string | null
  status: string | null
  currentPeriodEnd: string | null
}

export class PaywallService {
  // Feature limits for free tier
  private static readonly FREE_LIMITS = {
    cv_generations: 3,
    cv_optimizations: 2,
    cover_letters: 2,
    application_wizard: 1,
  }

  // Premium tier has unlimited access (represented by high number)
  private static readonly PREMIUM_LIMITS = {
    cv_generations: 999999,
    cv_optimizations: 999999,
    cover_letters: 999999,
    application_wizard: 999999,
  }

  /**
   * Check if user has access to a specific feature
   */
  static async checkFeatureAccess(feature: Feature): Promise<PaywallInfo> {
    try {
      const usageCheck = await SubscriptionService.checkUsageLimit(feature)
      const tier = await SubscriptionService.getUserTier()

      // Get upgrade plans (exclude current tier and free tier)
      const upgradePlans = SUBSCRIPTION_PLANS.filter((plan) => plan.tier !== tier && plan.tier !== "free")
        .map((plan) => ({
          id: plan.id,
          name: plan.name,
          tier: plan.tier,
          price: plan.price,
          billingCycle: plan.billingCycle,
          savings: plan.savings,
        }))
        .sort((a, b) => a.price - b.price)

      return {
        feature,
        current: usageCheck.current,
        limit: usageCheck.limit,
        tier: usageCheck.tier,
        allowed: usageCheck.allowed,
        upgradePlans,
      }
    } catch (error) {
      console.error("Error in checkFeatureAccess:", error)
      // Return a fallback paywall info for free tier
      return {
        feature,
        current: 0,
        limit: 0,
        tier: "free",
        allowed: false,
        upgradePlans: SUBSCRIPTION_PLANS.filter((plan) => plan.tier !== "free")
          .map((plan) => ({
            id: plan.id,
            name: plan.name,
            tier: plan.tier,
            price: plan.price,
            billingCycle: plan.billingCycle,
            savings: plan.savings,
          }))
          .sort((a, b) => a.price - b.price),
      }
    }
  }

  /**
   * Record feature usage for a user
   */
  static async recordUsage(feature: Feature): Promise<void> {
    await SubscriptionService.incrementUsage(feature)
  }

  /**
   * Check if user has access to a specific feature and record usage if allowed
   */
  static async checkAndRecordUsage(feature: Feature): Promise<{
    allowed: boolean
    paywallInfo?: PaywallInfo
  }> {
    const paywallInfo = await this.checkFeatureAccess(feature)

    if (paywallInfo.allowed) {
      await this.recordUsage(feature)
      return { allowed: true }
    }

    return {
      allowed: false,
      paywallInfo,
    }
  }

  /**
   * Get display name for a feature
   */
  static getFeatureDisplayName(feature: Feature): string {
    switch (feature) {
      case "cv_generations":
        return "CV Generations"
      case "cv_optimizations":
        return "CV Optimizations"
      case "cover_letters":
        return "Cover Letters"
      case "application_wizard":
        return "Application Wizard"
      default:
        return feature
    }
  }

  /**
   * Get description for a feature
   */
  static getFeatureDescription(feature: Feature): string {
    switch (feature) {
      case "cv_generations":
        return "Generate new CVs with AI assistance"
      case "cv_optimizations":
        return "Get AI-powered CV analysis and improvement suggestions"
      case "cover_letters":
        return "Create personalized cover letters for job applications"
      case "application_wizard":
        return "Use our step-by-step application builder"
      default:
        return "Feature usage"
    }
  }

  /**
   * Get display name for a subscription tier
   */
  static getTierDisplayName(tier: SubscriptionTier): string {
    switch (tier) {
      case "free":
        return "Free"
      case "pro":
        return "Pro"
      case "premium":
        return "Premium"
      default:
        return tier
    }
  }

  /**
   * Format limit for display
   */
  static formatLimit(limit: number | "unlimited"): string {
    if (limit === "unlimited") {
      return "Unlimited"
    }
    return limit.toString()
  }

  /**
   * Get upgrade message for a feature based on current tier
   */
  static getUpgradeMessage(feature: Feature, currentTier: SubscriptionTier): string {
    const featureName = this.getFeatureDisplayName(feature)

    switch (currentTier) {
      case "free":
        return `Upgrade to Pro or Premium for unlimited ${featureName.toLowerCase()}`
      case "pro":
        return `Upgrade to Premium for unlimited ${featureName.toLowerCase()}`
      case "premium":
        return "You already have unlimited access to all features"
      default:
        return `Upgrade your plan for more ${featureName.toLowerCase()}`
    }
  }

  /**
   * Get usage progress for a feature
   */
  static getUsageProgress(
    current: number,
    limit: number | "unlimited",
  ): {
    percentage: number
    remaining: number | "unlimited"
  } {
    if (limit === "unlimited") {
      return {
        percentage: 0,
        remaining: "unlimited",
      }
    }

    const percentage = Math.min((current / limit) * 100, 100)
    const remaining = Math.max(limit - current, 0)

    return {
      percentage,
      remaining,
    }
  }



  /**
   * Create a checkout session for a subscription plan
   */
  static async createCheckoutSession(planId: string): Promise<{
    success: boolean
    sessionUrl?: string
    error?: string
  }> {
    console.log("🔍 PaywallService.createCheckoutSession called with planId:", planId)

    try {
      console.log("📞 Making API call to /api/stripe/create-checkout")

      // Import supabase client dynamically to avoid SSR issues
      const { supabase } = await import("@/lib/supabase")

      if (!supabase) {
        throw new Error("Supabase client not available")
      }

      // Get the current session from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error("❌ Error getting session:", sessionError)
        return {
          success: false,
          error: "Authentication error. Please log in and try again.",
        }
      }

      if (!session?.access_token) {
        console.error("❌ No valid session found")
        return {
          success: false,
          error: "You must be logged in to upgrade. Please log in and try again.",
        }
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      }

      console.log("✅ Added auth token to request")

      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers,
        body: JSON.stringify({ planId }),
      })

      console.log("📡 API response status:", response.status, response.statusText)

      const data = await response.json()
      console.log("📄 API response data:", data)

      if (!response.ok) {
        console.error("❌ API response not ok:", data)
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      if (data.success && data.sessionUrl) {
        console.log("✅ Checkout session created successfully")
        return {
          success: true,
          sessionUrl: data.sessionUrl,
        }
      } else {
        console.error("❌ API returned success=false:", data)
        return {
          success: false,
          error: data.error || "Failed to create checkout session",
        }
      }
    } catch (error) {
      console.error("❌ Error creating checkout session:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create checkout session",
      }
    }
  }

  /**
   * Get features included in a subscription plan
   */
  static getPlanFeatures(planId: string): {
    features: string[]
    aiModel: string
    support: string
  } {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)

    if (!plan) {
      return {
        features: [],
        aiModel: "GPT-3.5",
        support: "Email",
      }
    }

    const features: string[] = []

    // Add feature limits
    if (plan.features.cvGenerations === "unlimited") {
      features.push("Unlimited CV generations")
    } else {
      features.push(`${plan.features.cvGenerations} CV generations per month`)
    }

    if (plan.features.cvOptimizations === "unlimited") {
      features.push("Unlimited CV optimizations")
    } else if (plan.features.cvOptimizations > 0) {
      features.push(`${plan.features.cvOptimizations} CV optimizations per month`)
    }

    if (plan.features.coverLetters === "unlimited") {
      features.push("Unlimited cover letters")
    } else {
      features.push(`${plan.features.coverLetters} cover letters per month`)
    }

    if (plan.features.applicationWizard === "unlimited") {
      features.push("Unlimited application wizard uses")
    } else {
      features.push(`${plan.features.applicationWizard} application wizard uses per month`)
    }

    // Add premium features
    if (plan.features.applicationTracking) {
      features.push("Application tracking dashboard")
    }

    if (plan.features.careerCoaching) {
      features.push("1-on-1 career coaching session (monthly)")
    }

    if (plan.features.salaryNegotiation) {
      features.push("Salary negotiation guides")
    }

    if (plan.features.jobMarketInsights) {
      features.push("Job market insights")
    }

    return {
      features,
      aiModel: plan.features.aiModel === "gpt-4" ? "GPT-4" : "GPT-3.5",
      support: plan.features.support === "priority" ? "Priority support" : "Email support",
    }
  }
}
