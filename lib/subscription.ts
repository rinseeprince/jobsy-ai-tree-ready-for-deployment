import { supabase, isSupabaseReady } from "./supabase"

export type SubscriptionTier = "free" | "pro" | "premium"
export type BillingCycle = "monthly" | "quarterly"

export interface SubscriptionPlan {
  id: string
  name: string
  tier: SubscriptionTier
  billingCycle: BillingCycle
  price: number
  currency: string
  stripePriceId?: string
  features: {
    cvGenerations: number | "unlimited"
    cvOptimizations: number | "unlimited"
    coverLetters: number | "unlimited"
    applicationWizard: number | "unlimited"
    aiModel: "gpt-3.5" | "gpt-4"
    support: "email" | "priority"
    applicationTracking: boolean
    careerCoaching: boolean
    salaryNegotiation: boolean
    jobMarketInsights: boolean
  }
  popular?: boolean
  savings?: string
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  stripe_subscription_id?: string
  status: "active" | "canceled" | "past_due" | "unpaid" | "trialing"
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface UsageRecord {
  id: string
  user_id: string
  feature: "cv_generations" | "cv_optimizations" | "cover_letters" | "application_wizard"
  usage_date: string
  created_at: string
}

export interface CurrentUsage {
  cvGenerations: number
  cvOptimizations: number
  coverLetters: number
  applicationWizard: number
  resetDate: string
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  // Free Tier
  {
    id: "free",
    name: "Job Seeker",
    tier: "free",
    billingCycle: "monthly",
    price: 0,
    currency: "USD",
    features: {
      cvGenerations: 3,
      cvOptimizations: 0,
      coverLetters: 3,
      applicationWizard: 1,
      aiModel: "gpt-3.5",
      support: "email",
      applicationTracking: false,
      careerCoaching: false,
      salaryNegotiation: false,
      jobMarketInsights: false,
    },
  },
  // Pro Monthly
  {
    id: "pro-monthly",
    name: "Pro",
    tier: "pro",
    billingCycle: "monthly",
    price: 19,
    currency: "USD",
    stripePriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    features: {
      cvGenerations: "unlimited",
      cvOptimizations: 20,
      coverLetters: 20,
      applicationWizard: 10,
      aiModel: "gpt-4",
      support: "priority",
      applicationTracking: true,
      careerCoaching: false,
      salaryNegotiation: false,
      jobMarketInsights: false,
    },
    popular: true,
  },
  // Pro Quarterly
  {
    id: "pro-quarterly",
    name: "Pro",
    tier: "pro",
    billingCycle: "quarterly",
    price: 45,
    currency: "USD",
    stripePriceId: process.env.STRIPE_PRO_QUARTERLY_PRICE_ID,
    features: {
      cvGenerations: "unlimited",
      cvOptimizations: 20,
      coverLetters: 20,
      applicationWizard: 10,
      aiModel: "gpt-4",
      support: "priority",
      applicationTracking: true,
      careerCoaching: false,
      salaryNegotiation: false,
      jobMarketInsights: false,
    },
    popular: true,
    savings: "Save 21%",
  },
  // Premium Monthly
  {
    id: "premium-monthly",
    name: "Premium",
    tier: "premium",
    billingCycle: "monthly",
    price: 39,
    currency: "USD",
    stripePriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    features: {
      cvGenerations: "unlimited",
      cvOptimizations: "unlimited",
      coverLetters: "unlimited",
      applicationWizard: "unlimited",
      aiModel: "gpt-4",
      support: "priority",
      applicationTracking: true,
      careerCoaching: true,
      salaryNegotiation: true,
      jobMarketInsights: true,
    },
  },
  // Premium Quarterly
  {
    id: "premium-quarterly",
    name: "Premium",
    tier: "premium",
    billingCycle: "quarterly",
    price: 99,
    currency: "USD",
    stripePriceId: process.env.STRIPE_PREMIUM_QUARTERLY_PRICE_ID,
    features: {
      cvGenerations: "unlimited",
      cvOptimizations: "unlimited",
      coverLetters: "unlimited",
      applicationWizard: "unlimited",
      aiModel: "gpt-4",
      support: "priority",
      applicationTracking: true,
      careerCoaching: true,
      salaryNegotiation: true,
      jobMarketInsights: true,
    },
    savings: "Save 15%",
  },
]

export class SubscriptionService {
  static async getUserSubscription(): Promise<UserSubscription | null> {
    if (!isSupabaseReady || !supabase) {
      console.warn("⚠️ Supabase not configured, returning null subscription")
      return null
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return null
      }

      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user subscription:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in getUserSubscription:", error)
      return null
    }
  }

  static async getUserTier(): Promise<SubscriptionTier> {
    const subscription = await this.getUserSubscription()
    if (!subscription) {
      return "free"
    }

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.plan_id)
    return plan?.tier || "free"
  }

  static async getCurrentUsage(): Promise<CurrentUsage> {
    if (!isSupabaseReady || !supabase) {
      console.warn("⚠️ Supabase not configured, returning zero usage")
      return {
        cvGenerations: 0,
        cvOptimizations: 0,
        coverLetters: 0,
        applicationWizard: 0,
        resetDate: new Date().toISOString(),
      }
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return {
          cvGenerations: 0,
          cvOptimizations: 0,
          coverLetters: 0,
          applicationWizard: 0,
          resetDate: new Date().toISOString(),
        }
      }

      // Get current month's usage
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

      const { data, error } = await supabase
        .from("usage_records")
        .select("feature")
        .eq("user_id", user.id)
        .gte("usage_date", startOfMonth)
        .lte("usage_date", endOfMonth)

      if (error) {
        // Only log the error if it's not a "table doesn't exist" error
        if (error.code !== '42P01' && error.code !== 'PGRST116') {
          console.warn("⚠️ Error fetching usage records (this is normal if tables don't exist yet):", error.message || error)
        }
        return {
          cvGenerations: 0,
          cvOptimizations: 0,
          coverLetters: 0,
          applicationWizard: 0,
          resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
        }
      }

      const usage = {
        cvGenerations: data.filter(r => r.feature === "cv_generations").length,
        cvOptimizations: data.filter(r => r.feature === "cv_optimizations").length,
        coverLetters: data.filter(r => r.feature === "cover_letters").length,
        applicationWizard: data.filter(r => r.feature === "application_wizard").length,
        resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
      }

      return usage
    } catch (error) {
      console.error("Error in getCurrentUsage:", error)
      return {
        cvGenerations: 0,
        cvOptimizations: 0,
        coverLetters: 0,
        applicationWizard: 0,
        resetDate: new Date().toISOString(),
      }
    }
  }

  static async incrementUsage(feature: UsageRecord["feature"]): Promise<void> {
    if (!isSupabaseReady || !supabase) {
      console.warn("⚠️ Supabase not configured, skipping usage increment")
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return
      }

      const { error } = await supabase
        .from("usage_records")
        .insert({
          user_id: user.id,
          feature,
          usage_date: new Date().toISOString().split("T")[0],
        })

      if (error) {
        // Only log the error if it's not a "table doesn't exist" error
        if (error.code !== '42P01' && error.code !== 'PGRST116') {
          console.warn("⚠️ Error incrementing usage (this is normal if tables don't exist yet):", error.message || error)
        }
      }
    } catch (error) {
      console.error("Error in incrementUsage:", error)
    }
  }

  static async checkUsageLimit(feature: UsageRecord["feature"]): Promise<{
    allowed: boolean
    current: number
    limit: number | "unlimited"
    tier: SubscriptionTier
  }> {
    const tier = await this.getUserTier()
    const plan = SUBSCRIPTION_PLANS.find(p => p.tier === tier)
    const usage = await this.getCurrentUsage()

    if (!plan) {
      return {
        allowed: false,
        current: 0,
        limit: 0,
        tier: "free",
      }
    }

    const limit = plan.features[feature === "cv_generations" ? "cvGenerations" : 
                               feature === "cv_optimizations" ? "cvOptimizations" :
                               feature === "cover_letters" ? "coverLetters" : "applicationWizard"]

    const current = feature === "cv_generations" ? usage.cvGenerations :
                   feature === "cv_optimizations" ? usage.cvOptimizations :
                   feature === "cover_letters" ? usage.coverLetters : usage.applicationWizard

    const allowed = limit === "unlimited" || current < limit

    return {
      allowed,
      current,
      limit,
      tier,
    }
  }

  static async createSubscription(planId: string, stripeSubscriptionId?: string): Promise<UserSubscription | null> {
    if (!isSupabaseReady || !supabase) {
      console.warn("⚠️ Supabase not configured, cannot create subscription")
      return null
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("User not authenticated")
      }

      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
      if (!plan) {
        throw new Error("Invalid plan ID")
      }

      // Cancel any existing active subscription
      await supabase
        .from("user_subscriptions")
        .update({ status: "canceled" })
        .eq("user_id", user.id)
        .eq("status", "active")

      // Create new subscription
      const now = new Date()
      const periodEnd = plan.billingCycle === "monthly" 
        ? new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
        : new Date(now.getFullYear(), now.getMonth() + 3, now.getDate())

      const { data, error } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: user.id,
          plan_id: planId,
          stripe_subscription_id: stripeSubscriptionId,
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating subscription:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in createSubscription:", error)
      return null
    }
  }

  static async updateSubscription(
    subscriptionId: string,
    updates: Partial<Pick<UserSubscription, "status" | "current_period_end" | "cancel_at_period_end">>
  ): Promise<void> {
    if (!isSupabaseReady || !supabase) {
      console.warn("⚠️ Supabase not configured, cannot update subscription")
      return
    }

    try {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscriptionId)

      if (error) {
        console.error("Error updating subscription:", error)
      }
    } catch (error) {
      console.error("Error in updateSubscription:", error)
    }
  }

  static getPlanById(planId: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(p => p.id === planId)
  }

  static getPlansByTier(tier: SubscriptionTier): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS.filter(p => p.tier === tier)
  }

  static getPlansByBillingCycle(billingCycle: BillingCycle): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS.filter(p => p.billingCycle === billingCycle)
  }

  /**
   * Get subscription information for the current user
   */
  static async getSubscriptionInfo(): Promise<{
    isActive: boolean
    planId: string | null
    status: string | null
    currentPeriodEnd: string | null
  }> {
    const subscription = await this.getUserSubscription()
    
    if (!subscription) {
      return {
        isActive: false,
        planId: null,
        status: null,
        currentPeriodEnd: null,
      }
    }

    return {
      isActive: subscription.status === "active",
      planId: subscription.plan_id,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
    }
  }

  /**
   * Reset usage for a specific feature
   */
  static async resetUsage(feature: UsageRecord["feature"]): Promise<void> {
    if (!isSupabaseReady || !supabase) {
      console.warn("⚠️ Supabase not configured, cannot reset usage")
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return
      }

      // Delete all usage records for this feature for the current user
      const { error } = await supabase
        .from("usage_records")
        .delete()
        .eq("user_id", user.id)
        .eq("feature", feature)

      if (error) {
        console.error("Error resetting usage:", error)
      }
    } catch (error) {
      console.error("Error in resetUsage:", error)
    }
  }
} 