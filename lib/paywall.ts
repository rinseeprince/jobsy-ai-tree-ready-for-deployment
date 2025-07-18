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

export class PaywallService {
  static async checkFeatureAccess(feature: Feature): Promise<PaywallInfo> {
    try {
      const usageCheck = await SubscriptionService.checkUsageLimit(feature)
      const tier = await SubscriptionService.getUserTier()

      // Get upgrade plans (exclude current tier and free tier)
      const upgradePlans = SUBSCRIPTION_PLANS
        .filter(plan => plan.tier !== tier && plan.tier !== "free")
        .map(plan => ({
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
        upgradePlans: SUBSCRIPTION_PLANS
          .filter(plan => plan.tier !== "free")
          .map(plan => ({
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

  static async recordUsage(feature: Feature): Promise<void> {
    await SubscriptionService.incrementUsage(feature)
  }

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

  static formatLimit(limit: number | "unlimited"): string {
    if (limit === "unlimited") {
      return "Unlimited"
    }
    return limit.toString()
  }

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

  static getUsageProgress(current: number, limit: number | "unlimited"): {
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

  static isStripeConfigured(): boolean {
    return !!(
      process.env.STRIPE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET
    )
  }

  static getStripeConfigurationStatus(): {
    configured: boolean
    missingKeys: string[]
  } {
    const requiredKeys = [
      "STRIPE_SECRET_KEY",
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      "STRIPE_WEBHOOK_SECRET",
    ]

    const missingKeys = requiredKeys.filter(key => !process.env[key])

    return {
      configured: missingKeys.length === 0,
      missingKeys,
    }
  }

  static async createCheckoutSession(planId: string): Promise<{
    success: boolean
    sessionUrl?: string
    error?: string
  }> {
    if (!this.isStripeConfigured()) {
      return {
        success: false,
        error: "Stripe is not configured. Please contact support.",
      }
    }

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "Failed to create checkout session",
        }
      }

      return {
        success: true,
        sessionUrl: data.sessionUrl,
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      return {
        success: false,
        error: "Failed to create checkout session",
      }
    }
  }

  static getPlanFeatures(planId: string): {
    features: string[]
    aiModel: string
    support: string
  } {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
    
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