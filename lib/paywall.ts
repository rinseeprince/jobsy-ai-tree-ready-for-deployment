import { SubscriptionService, SUBSCRIPTION_PLANS, type SubscriptionTier } from "./subscription"
import { RolesService, type UserRole, type UserRoleData } from "./roles"

export type Feature = "cv_generations" | "cv_optimizations" | "cover_letters" | "application_wizard"

export interface PaywallInfo {
  feature: Feature
  current: number
  limit: number | "unlimited"
  tier: SubscriptionTier
  role: UserRole
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
   * Check if user has access to a specific feature - UPDATED with role-based priority
   */
  static async checkFeatureAccess(feature: Feature): Promise<PaywallInfo> {
    try {
      // FIRST PRIORITY: Get user role (this includes manual role assignments)
      const userRole = await RolesService.getCurrentUserRole()

      // Super users and admins get unlimited access
      if (userRole && (userRole.role === "admin" || userRole.role === "super_user")) {
        // Check if role is still active and not expired
        const isActive = userRole.is_active && (!userRole.expires_at || new Date(userRole.expires_at) > new Date())

        if (isActive) {
          console.log(`✅ Role-based unlimited access granted: ${userRole.role}`)
          return {
            feature,
            current: 0,
            limit: "unlimited",
            tier: "premium", // Treat as premium for UI purposes
            role: userRole.role,
            allowed: true,
            upgradePlans: [],
          }
        } else {
          console.log(`⚠️ Role expired or inactive: ${userRole.role}`)
          // Continue to subscription check if role is expired/inactive
        }
      }

      // SECOND PRIORITY: For regular users, check subscription and usage
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
        role: userRole?.role || "free",
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
        role: "free",
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
   * Record feature usage for a user - UPDATED to skip for role-based users
   */
  static async recordUsage(feature: Feature): Promise<void> {
    // Check if user has unlimited access first
    const userRole = await RolesService.getCurrentUserRole()

    // Don't record usage for super users and admins with active roles
    if (userRole && (userRole.role === "admin" || userRole.role === "super_user")) {
      const isActive = userRole.is_active && (!userRole.expires_at || new Date(userRole.expires_at) > new Date())

      if (isActive) {
        console.log(`✅ Skipping usage recording for ${userRole.role}`)
        return
      }
    }

    // Record usage for regular users
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
   * Check if user has access to a specific feature (alias for checkFeatureAccess)
   */
  static async checkAccess(feature: Feature): Promise<PaywallInfo> {
    return this.checkFeatureAccess(feature)
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
   * Get upgrade message for a feature based on current tier and role
   */
  static getUpgradeMessage(feature: Feature, currentTier: SubscriptionTier, userRole: UserRole): string {
    const featureName = this.getFeatureDisplayName(feature)

    // Super users and admins don't need upgrades
    if (userRole === "admin" || userRole === "super_user") {
      return `You have unlimited access to ${featureName.toLowerCase()}`
    }

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
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

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
        Authorization: `Bearer ${session.access_token}`,
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

  /**
   * Check if user needs upgrade for a specific feature
   */
  static async needsUpgrade(feature: Feature): Promise<boolean> {
    const paywallInfo = await this.checkFeatureAccess(feature)
    return !paywallInfo.allowed
  }

  /**
   * Get current subscription status
   */
  static async getSubscriptionStatus(): Promise<SubscriptionInfo> {
    try {
      const subscriptionInfo = await SubscriptionService.getSubscriptionInfo()
      return {
        isActive: subscriptionInfo.isActive,
        planId: subscriptionInfo.planId,
        status: subscriptionInfo.status,
        currentPeriodEnd: subscriptionInfo.currentPeriodEnd,
      }
    } catch (error) {
      console.error("Error getting subscription status:", error)
      return {
        isActive: false,
        planId: null,
        status: null,
        currentPeriodEnd: null,
      }
    }
  }

  /**
   * Get comprehensive user access summary
   */
  static async getUserAccessSummary(): Promise<{
    role: UserRole
    tier: SubscriptionTier
    hasUnlimitedAccess: boolean
    features: Record<
      Feature,
      {
        allowed: boolean
        current: number
        limit: number | "unlimited"
      }
    >
  }> {
    try {
      const userRole = await RolesService.getCurrentUserRole()
      const tier = await SubscriptionService.getUserTier()

      // Check if user has role-based unlimited access
      const hasRoleBasedAccess =
        userRole &&
        (userRole.role === "admin" || userRole.role === "super_user") &&
        userRole.is_active &&
        (!userRole.expires_at || new Date(userRole.expires_at) > new Date())

      const features: Record<Feature, { allowed: boolean; current: number; limit: number | "unlimited" }> = {} as any

      // Get access info for each feature
      for (const feature of [
        "cv_generations",
        "cv_optimizations",
        "cover_letters",
        "application_wizard",
      ] as Feature[]) {
        const paywallInfo = await this.checkFeatureAccess(feature)
        features[feature] = {
          allowed: paywallInfo.allowed,
          current: paywallInfo.current,
          limit: paywallInfo.limit,
        }
      }

      return {
        role: userRole?.role || "free",
        tier,
        hasUnlimitedAccess: !!hasRoleBasedAccess || tier === "premium",
        features,
      }
    } catch (error) {
      console.error("Error getting user access summary:", error)
      return {
        role: "free",
        tier: "free",
        hasUnlimitedAccess: false,
        features: {
          cv_generations: { allowed: false, current: 0, limit: 0 },
          cv_optimizations: { allowed: false, current: 0, limit: 0 },
          cover_letters: { allowed: false, current: 0, limit: 0 },
          application_wizard: { allowed: false, current: 0, limit: 0 },
        },
      }
    }
  }

  /**
   * Reset usage for a specific user (admin function)
   */
  static async resetUserUsage(userId: string, feature?: Feature): Promise<boolean> {
    try {
      // Only admins can reset usage
      const userRole = await RolesService.getCurrentUserRole()
      if (!userRole || userRole.role !== "admin") {
        console.error("❌ Only admins can reset user usage")
        return false
      }

      if (feature) {
        await SubscriptionService.resetUsage(feature)
      } else {
        // Reset all features
        for (const f of ["cv_generations", "cv_optimizations", "cover_letters", "application_wizard"] as Feature[]) {
          await SubscriptionService.resetUsage(f)
        }
      }

      console.log(`✅ Usage reset for ${feature || "all features"}`)
      return true
    } catch (error) {
      console.error("❌ Error resetting user usage:", error)
      return false
    }
  }

  /**
   * Get usage statistics for admin dashboard
   */
  static async getUsageStatistics(): Promise<{
    totalUsers: number
    activeSubscriptions: number
    featureUsage: Record<Feature, number>
    roleDistribution: Record<UserRole, number>
  }> {
    try {
      // Only admins can view usage statistics
      const userRole = await RolesService.getCurrentUserRole()
      if (!userRole || userRole.role !== "admin") {
        throw new Error("Only admins can view usage statistics")
      }

      // This would typically query your database for statistics
      // For now, return placeholder data
      return {
        totalUsers: 0,
        activeSubscriptions: 0,
        featureUsage: {
          cv_generations: 0,
          cv_optimizations: 0,
          cover_letters: 0,
          application_wizard: 0,
        },
        roleDistribution: {
          free: 0,
          pro: 0,
          premium: 0,
          admin: 0,
          super_user: 0,
        },
      }
    } catch (error) {
      console.error("Error getting usage statistics:", error)
      throw error
    }
  }
}
