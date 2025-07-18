"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Lock, 
  Zap, 
  Crown, 
  Check, 
  X, 
  Star,
  ArrowRight,
  Sparkles,
  Target,
  Users,
  MessageSquare,
  Calendar
} from "lucide-react"
import { PaywallInfo, PaywallService } from "@/lib/paywall"
import { SUBSCRIPTION_PLANS } from "@/lib/subscription"

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  paywallInfo: PaywallInfo
}

export function PaywallModal({ isOpen, onClose, paywallInfo }: PaywallModalProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpgrade = async (planId: string) => {
    setIsLoading(planId)
    setError(null)

    try {
      const result = await PaywallService.createCheckoutSession(planId)
      
      if (result.success && result.sessionUrl) {
        window.location.href = result.sessionUrl
      } else {
        setError(result.error || "Failed to create checkout session")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error("Upgrade error:", err)
    } finally {
      setIsLoading(null)
    }
  }

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case "cv_generations":
        return <Target className="w-4 h-4" />
      case "cv_optimizations":
        return <Sparkles className="w-4 h-4" />
      case "cover_letters":
        return <MessageSquare className="w-4 h-4" />
      case "application_wizard":
        return <Users className="w-4 h-4" />
      default:
        return <Star className="w-4 h-4" />
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "pro":
        return <Zap className="w-5 h-5" />
      case "premium":
        return <Crown className="w-5 h-5" />
      default:
        return <Star className="w-5 h-5" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "pro":
        return "bg-gradient-to-r from-blue-600 to-teal-600"
      case "premium":
        return "bg-gradient-to-r from-purple-600 to-pink-600"
      default:
        return "bg-gray-600"
    }
  }

  // Add null checks to prevent runtime errors
  if (!paywallInfo) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Lock className="w-6 h-6 text-orange-500" />
              Upgrade Your Plan
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-600">Loading upgrade options...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const progress = PaywallService.getUsageProgress(paywallInfo.current, paywallInfo.limit)
  const featureName = PaywallService.getFeatureDisplayName(paywallInfo.feature)
  const upgradeMessage = PaywallService.getUpgradeMessage(paywallInfo.feature, paywallInfo.tier)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lock className="w-6 h-6 text-orange-500" />
            Upgrade Your Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Usage Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              {getFeatureIcon(paywallInfo.feature)}
              <h3 className="font-semibold text-gray-900">
                {featureName} Usage
              </h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current usage</span>
                <span className="font-medium">
                  {paywallInfo?.current || 0} / {PaywallService.formatLimit(paywallInfo?.limit || 0)}
                </span>
              </div>
              
              <Progress value={progress.percentage} className="h-2" />
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Remaining</span>
                <span className="font-medium">
                  {progress.remaining === "unlimited" ? "Unlimited" : `${progress.remaining} left`}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-3">
              {upgradeMessage}
            </p>
          </div>

          {/* Upgrade Plans */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Choose Your Plan</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {(paywallInfo?.upgradePlans || []).map((plan) => {
                const planDetails = SUBSCRIPTION_PLANS.find(p => p.id === plan.id)
                const features = planDetails ? PaywallService.getPlanFeatures(plan.id) : { features: [], aiModel: "GPT-3.5", support: "Email" }
                
                return (
                  <Card key={plan.id} className="relative hover:shadow-lg transition-shadow">
                    {plan.savings && (
                      <Badge className="absolute -top-2 -right-2 bg-green-500 text-white">
                        {plan.savings}
                      </Badge>
                    )}
                    
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTierColor(plan.tier)} text-white`}>
                          {getTierIcon(plan.tier)}
                        </div>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                      </div>
                      
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-gray-600">
                          /{plan.billingCycle === "monthly" ? "month" : "quarter"}
                        </span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        {features.features.slice(0, 4).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                        
                        {features.features.length > 4 && (
                          <div className="text-sm text-gray-500">
                            +{features.features.length - 4} more features
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-3 border-t">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>AI Model:</span>
                          <span className="font-medium">{features.aiModel}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Support:</span>
                          <span className="font-medium">{features.support}</span>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isLoading === plan.id}
                        className="w-full mt-4"
                        size="lg"
                      >
                        {isLoading === plan.id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Upgrade to {plan.name}
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <X className="w-4 h-4" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-gray-600 space-y-2">
            <p>
              All plans include a 30-day money-back guarantee
            </p>
            <p>
              Cancel anytime • No hidden fees
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 