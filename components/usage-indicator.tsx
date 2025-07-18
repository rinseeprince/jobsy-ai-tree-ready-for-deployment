"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  Target, 
  Sparkles, 
  MessageSquare, 
  Users, 
  Star, 
  Zap, 
  Crown,
  ArrowUp,
  Calendar,
  RefreshCw
} from "lucide-react"
import { SubscriptionService, type SubscriptionTier } from "@/lib/subscription"
import { PaywallService, type Feature } from "@/lib/paywall"
import { PaywallModal } from "./paywall-modal"

interface UsageIndicatorProps {
  className?: string
  showUpgradePrompt?: boolean
}

export function UsageIndicator({ className = "", showUpgradePrompt = true }: UsageIndicatorProps) {
  const [usage, setUsage] = useState<any>(null)
  const [tier, setTier] = useState<SubscriptionTier>("free")
  const [isLoading, setIsLoading] = useState(true)
  const [paywallModal, setPaywallModal] = useState<{
    isOpen: boolean
    feature: Feature | null
    paywallInfo: any
  }>({
    isOpen: false,
    feature: null,
    paywallInfo: null,
  })

  const loadUsage = async () => {
    try {
      setIsLoading(true)
      const [usageData, userTier] = await Promise.all([
        SubscriptionService.getCurrentUsage(),
        SubscriptionService.getUserTier(),
      ])
      setUsage(usageData)
      setTier(userTier)
    } catch (error) {
      console.error("Error loading usage:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsage()
  }, [])

  const handleUpgradeClick = async (feature: Feature) => {
    try {
      const paywallInfo = await PaywallService.checkFeatureAccess(feature)
      setPaywallModal({
        isOpen: true,
        feature,
        paywallInfo,
      })
    } catch (error) {
      console.error("Error checking feature access:", error)
    }
  }

  const getTierInfo = (tier: SubscriptionTier) => {
    switch (tier) {
      case "free":
        return {
          name: "Free",
          icon: <Star className="w-4 h-4" />,
          color: "bg-gray-500",
          badgeColor: "bg-gray-100 text-gray-800",
        }
      case "pro":
        return {
          name: "Pro",
          icon: <Zap className="w-4 h-4" />,
          color: "bg-gradient-to-r from-blue-600 to-teal-600",
          badgeColor: "bg-blue-100 text-blue-800",
        }
      case "premium":
        return {
          name: "Premium",
          icon: <Crown className="w-4 h-4" />,
          color: "bg-gradient-to-r from-purple-600 to-pink-600",
          badgeColor: "bg-purple-100 text-purple-800",
        }
      default:
        return {
          name: "Free",
          icon: <Star className="w-4 h-4" />,
          color: "bg-gray-500",
          badgeColor: "bg-gray-100 text-gray-800",
        }
    }
  }

  const getFeatureInfo = (feature: string) => {
    switch (feature) {
      case "cv_generations":
        return {
          name: "CV Generations",
          icon: <Target className="w-4 h-4" />,
          limit: tier === "free" ? 3 : "unlimited" as const,
        }
      case "cv_optimizations":
        return {
          name: "CV Optimizations",
          icon: <Sparkles className="w-4 h-4" />,
          limit: tier === "free" ? 0 : tier === "pro" ? 20 : "unlimited" as const,
        }
      case "cover_letters":
        return {
          name: "Cover Letters",
          icon: <MessageSquare className="w-4 h-4" />,
          limit: tier === "free" ? 3 : tier === "pro" ? 20 : "unlimited" as const,
        }
      case "application_wizard":
        return {
          name: "Application Wizard",
          icon: <Users className="w-4 h-4" />,
          limit: tier === "free" ? 1 : tier === "pro" ? 10 : "unlimited" as const,
        }
      default:
        return {
          name: feature,
          icon: <Star className="w-4 h-4" />,
          limit: 0,
        }
    }
  }

  const getUsageProgress = (current: number, limit: number | "unlimited") => {
    if (limit === "unlimited") {
      return { percentage: 0, remaining: "unlimited" }
    }
    const percentage = Math.min((current / limit) * 100, 100)
    const remaining = Math.max(limit - current, 0)
    return { percentage, remaining }
  }

  const tierInfo = getTierInfo(tier)

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Usage</CardTitle>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm text-gray-500">Loading...</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!usage) {
    return null
  }

  const features = [
    { key: "cv_generations" as Feature, value: usage.cvGenerations },
    { key: "cv_optimizations" as Feature, value: usage.cvOptimizations },
    { key: "cover_letters" as Feature, value: usage.coverLetters },
    { key: "application_wizard" as Feature, value: usage.applicationWizard },
  ]

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Usage</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={tierInfo.badgeColor}>
                <div className="flex items-center gap-1">
                  {tierInfo.icon}
                  {tierInfo.name}
                </div>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadUsage}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {usage.resetDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Resets {new Date(usage.resetDate).toLocaleDateString()}</span>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {features.map(({ key, value }) => {
            const featureInfo = getFeatureInfo(key)
            const progress = getUsageProgress(value, featureInfo.limit)
            const isUnlimited = featureInfo.limit === "unlimited"
            const isAtLimit = !isUnlimited && value >= featureInfo.limit
            
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {featureInfo.icon}
                    <span className="text-sm font-medium text-gray-700">
                      {featureInfo.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {value} / {PaywallService.formatLimit(featureInfo.limit)}
                    </span>
                    {isAtLimit && (
                      <Badge variant="destructive" className="text-xs">
                        Limit Reached
                      </Badge>
                    )}
                  </div>
                </div>
                
                {!isUnlimited && (
                  <Progress 
                    value={progress.percentage} 
                    className="h-2"
                    style={{
                      backgroundColor: isAtLimit ? "#fef2f2" : undefined,
                    }}
                  />
                )}
                
                {!isUnlimited && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Remaining: {progress.remaining}</span>
                    <span>{Math.round(progress.percentage)}% used</span>
                  </div>
                )}
                
                {showUpgradePrompt && tier === "free" && !isUnlimited && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpgradeClick(key)}
                    className="w-full mt-2"
                  >
                    <ArrowUp className="w-4 h-4 mr-2" />
                    Upgrade for more {featureInfo.name.toLowerCase()}
                  </Button>
                )}
              </div>
            )
          })}
          
          {showUpgradePrompt && tier === "free" && (
            <div className="pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Upgrade to unlock unlimited features and advanced AI
                </p>
                <Button
                  onClick={() => handleUpgradeClick("cv_generations")}
                  className="w-full"
                  size="sm"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <PaywallModal
        isOpen={paywallModal.isOpen}
        onClose={() => setPaywallModal({ isOpen: false, feature: null, paywallInfo: null })}
        paywallInfo={paywallModal.paywallInfo}
      />
    </>
  )
} 