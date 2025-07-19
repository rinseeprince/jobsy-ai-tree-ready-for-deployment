"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Zap, Crown, ArrowRight, Loader2 } from "lucide-react"
import { PaywallService, type PaywallInfo } from "@/lib/paywall"
import { SUBSCRIPTION_PLANS } from "@/lib/subscription"

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  paywallInfo: PaywallInfo
}

export function PaywallModal({ isOpen, onClose, paywallInfo }: PaywallModalProps) {
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Don't render if paywallInfo is not available
  if (!paywallInfo) {
    return null
  }

  const handleUpgrade = async (planId: string) => {
    console.log("🚀 Starting upgrade process for plan:", planId)
    setIsUpgrading(planId)
    setError(null)

    try {
      console.log("📞 Calling PaywallService.createCheckoutSession...")
      const result = await PaywallService.createCheckoutSession(planId)

      console.log("✅ Checkout session result:", result)

      if (result.success && result.sessionUrl) {
        console.log("🔗 Redirecting to Stripe checkout:", result.sessionUrl)
        // Redirect to Stripe checkout
        window.location.href = result.sessionUrl
      } else {
        console.error("❌ Checkout session failed:", result.error)
        
        // Handle specific authentication errors
        if (result.error?.includes("logged in") || result.error?.includes("authenticated")) {
          setError("Please log in to upgrade your plan. You'll be redirected to the login page.")
          // Optionally redirect to login after a short delay
          setTimeout(() => {
            window.location.href = "/?login=required"
          }, 3000)
        } else {
          setError(result.error || "Failed to create checkout session")
        }
      }
    } catch (err) {
      console.error("❌ Upgrade error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsUpgrading(null)
    }
  }

  const getRecommendedPlans = () => {
    // Get the first 2 upgrade plans (Pro and Premium)
    return paywallInfo?.upgradePlans?.slice(0, 2) || []
  }

  const getPlanIcon = (tier: string) => {
    switch (tier) {
      case "pro":
        return <Zap className="w-6 h-6" />
      case "premium":
        return <Crown className="w-6 h-6" />
      default:
        return <Zap className="w-6 h-6" />
    }
  }

  const getPlanColor = (tier: string) => {
    switch (tier) {
      case "pro":
        return "bg-gradient-to-r from-blue-600 to-teal-600"
      case "premium":
        return "bg-gradient-to-r from-purple-600 to-pink-600"
      default:
        return "bg-gradient-to-r from-blue-600 to-teal-600"
    }
  }

  const getFeatureDisplayName = (feature: string) => {
    return PaywallService.getFeatureDisplayName(feature as any)
  }

  const getFeatureDescription = (feature: string) => {
    return PaywallService.getFeatureDescription(feature as any)
  }

  const formatLimit = (limit: number | "unlimited") => {
    return PaywallService.formatLimit(limit)
  }

  const recommendedPlans = getRecommendedPlans()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Upgrade to unlock {getFeatureDisplayName(paywallInfo.feature)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Usage Info */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-orange-900">
                    {getFeatureDisplayName(paywallInfo.feature)} Limit Reached
                  </h3>
                  <p className="text-sm text-orange-700">
                    You've used {paywallInfo.current} of {formatLimit(paywallInfo.limit)}{" "}
                    {getFeatureDisplayName(paywallInfo.feature).toLowerCase()} this month
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-900">
                    {paywallInfo.current}/{formatLimit(paywallInfo.limit)}
                  </div>
                  <div className="text-xs text-orange-600">
                    Current Plan: {PaywallService.getTierDisplayName(paywallInfo.tier)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Description */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">{getFeatureDescription(paywallInfo.feature)}</p>
            <p className="text-sm text-gray-500">
              Choose a plan below to continue using this feature and unlock additional benefits.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <X className="w-4 h-4" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Upgrade Plans */}
          <div className="grid md:grid-cols-2 gap-6">
            {recommendedPlans.map((plan) => {
              const fullPlan = SUBSCRIPTION_PLANS.find((p) => p.id === plan.id)
              const isPopular = plan.tier === "pro"

              return (
                <Card
                  key={plan.id}
                  className={`relative border-2 transition-all duration-300 hover:shadow-lg ${
                    isPopular ? "border-blue-500 shadow-md scale-105" : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  )}
                  {plan.savings && (
                    <Badge className="absolute -top-3 -right-3 bg-green-500 text-white px-2 py-1 text-xs">
                      {plan.savings}
                    </Badge>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center ${getPlanColor(plan.tier)} text-white`}
                    >
                      {getPlanIcon(plan.tier)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600">/{plan.billingCycle === "monthly" ? "month" : "quarter"}</span>
                    </div>
                    <Button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isUpgrading === plan.id}
                      size="lg"
                      className={`w-full ${getPlanColor(plan.tier)} hover:opacity-90 text-white`}
                    >
                      {isUpgrading === plan.id ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Upgrade to {plan.name}
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </Button>
                  </CardHeader>

                  <CardContent>
                    <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                    {fullPlan && (
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">
                            {fullPlan.features.cvGenerations === "unlimited"
                              ? "Unlimited CV generations"
                              : `${fullPlan.features.cvGenerations} CV generations per month`}
                          </span>
                        </li>
                        {fullPlan.features.cvOptimizations !== 0 && (
                          <li className="flex items-start">
                            <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">
                              {fullPlan.features.cvOptimizations === "unlimited"
                                ? "Unlimited CV optimizations"
                                : `${fullPlan.features.cvOptimizations} CV optimizations per month`}
                            </span>
                          </li>
                        )}
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">
                            {fullPlan.features.coverLetters === "unlimited"
                              ? "Unlimited cover letters"
                              : `${fullPlan.features.coverLetters} cover letters per month`}
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">
                            {fullPlan.features.applicationWizard === "unlimited"
                              ? "Unlimited application wizard uses"
                              : `${fullPlan.features.applicationWizard} application wizard uses per month`}
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">
                            {fullPlan.features.aiModel === "gpt-4" ? "GPT-4 AI" : "GPT-3.5 AI"}
                          </span>
                        </li>
                        <li className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">
                            {fullPlan.features.support === "priority" ? "Priority support" : "Email support"}
                          </span>
                        </li>
                        {fullPlan.features.applicationTracking && (
                          <li className="flex items-start">
                            <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">Application tracking dashboard</span>
                          </li>
                        )}
                        {fullPlan.features.careerCoaching && (
                          <li className="flex items-start">
                            <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">1-on-1 career coaching session (monthly)</span>
                          </li>
                        )}
                        {fullPlan.features.salaryNegotiation && (
                          <li className="flex items-start">
                            <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">Salary negotiation guides</span>
                          </li>
                        )}
                        {fullPlan.features.jobMarketInsights && (
                          <li className="flex items-start">
                            <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">Job market insights</span>
                          </li>
                        )}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Benefits */}
          <Card className="bg-gradient-to-r from-blue-50 to-teal-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">Why upgrade?</h3>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">No credit card required</p>
                </div>
                <div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Cancel anytime</p>
                </div>
                <div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Check className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">30-day money back guarantee</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
