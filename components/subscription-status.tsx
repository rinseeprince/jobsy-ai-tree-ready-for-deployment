"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Star, 
  Zap, 
  Crown,
  Calendar,
  CreditCard,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink
} from "lucide-react"
import { SubscriptionService, type SubscriptionTier, SUBSCRIPTION_PLANS } from "@/lib/subscription"

interface SubscriptionStatusProps {
  className?: string
}

export function SubscriptionStatus({ className = "" }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<any>(null)
  const [tier, setTier] = useState<SubscriptionTier>("free")
  const [isLoading, setIsLoading] = useState(true)

  const loadSubscription = async () => {
    try {
      setIsLoading(true)
      const [subscriptionData, userTier] = await Promise.all([
        SubscriptionService.getUserSubscription(),
        SubscriptionService.getUserTier(),
      ])
      setSubscription(subscriptionData)
      setTier(userTier)
    } catch (error) {
      console.error("Error loading subscription:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSubscription()
  }, [])

  const getTierInfo = (tier: SubscriptionTier) => {
    switch (tier) {
      case "free":
        return {
          name: "Free",
          icon: <Star className="w-5 h-5" />,
          color: "bg-gray-500",
          badgeColor: "bg-gray-100 text-gray-800",
          description: "Basic features with monthly limits",
        }
      case "pro":
        return {
          name: "Pro",
          icon: <Zap className="w-5 h-5" />,
          color: "bg-gradient-to-r from-blue-600 to-teal-600",
          badgeColor: "bg-blue-100 text-blue-800",
          description: "Advanced features with higher limits",
        }
      case "premium":
        return {
          name: "Premium",
          icon: <Crown className="w-5 h-5" />,
          color: "bg-gradient-to-r from-purple-600 to-pink-600",
          badgeColor: "bg-purple-100 text-purple-800",
          description: "Unlimited access to all features",
        }
      default:
        return {
          name: "Free",
          icon: <Star className="w-5 h-5" />,
          color: "bg-gray-500",
          badgeColor: "bg-gray-100 text-gray-800",
          description: "Basic features with monthly limits",
        }
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "active":
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: "text-green-600",
          bgColor: "bg-green-50",
          text: "Active",
        }
      case "trialing":
        return {
          icon: <Clock className="w-4 h-4" />,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          text: "Trial",
        }
      case "past_due":
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          text: "Past Due",
        }
      case "canceled":
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: "text-red-600",
          bgColor: "bg-red-50",
          text: "Canceled",
        }
      default:
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          text: status,
        }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleManageSubscription = () => {
    // For now, redirect to pricing page
    // In a full implementation, this would open Stripe customer portal
    window.location.href = "/pricing"
  }

  const tierInfo = getTierInfo(tier)

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (tier === "free") {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tierInfo.color} text-white`}>
              {tierInfo.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{tierInfo.name} Plan</h3>
                <Badge className={tierInfo.badgeColor}>
                  {tierInfo.name}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{tierInfo.description}</p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Upgrade to Pro
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  Get unlimited CV generations, advanced AI analysis, and priority support.
                </p>
                <Button
                  onClick={() => window.location.href = "/pricing"}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  View Plans
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return null
  }

  const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.plan_id)
  const statusInfo = getStatusInfo(subscription.status)
  const isActive = subscription.status === "active" || subscription.status === "trialing"

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Subscription</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan Info */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tierInfo.color} text-white`}>
            {tierInfo.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{tierInfo.name} Plan</h3>
              <Badge className={tierInfo.badgeColor}>
                {tierInfo.name}
              </Badge>
              <Badge className={`${statusInfo.bgColor} ${statusInfo.color}`}>
                <div className="flex items-center gap-1">
                  {statusInfo.icon}
                  {statusInfo.text}
                </div>
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{tierInfo.description}</p>
            {plan && (
              <p className="text-sm text-gray-600">
                ${plan.price}/{plan.billingCycle === "monthly" ? "month" : "quarter"}
              </p>
            )}
          </div>
        </div>

        {/* Subscription Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Current period:</span>
            <span className="font-medium">
              {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
            </span>
          </div>

          {subscription.cancel_at_period_end && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Subscription will cancel at period end</span>
              </div>
            </div>
          )}

          {!isActive && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Your subscription is not active. Please update your payment method.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleManageSubscription}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage Subscription
          </Button>
          
          {subscription.stripe_subscription_id && (
            <Button
              onClick={() => window.location.href = "/pricing"}
              variant="outline"
              size="sm"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Billing
            </Button>
          )}
        </div>

        {/* Plan Features */}
        {plan && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Plan Features</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>AI Model: {plan.features.aiModel === "gpt-4" ? "GPT-4" : "GPT-3.5"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Support: {plan.features.support === "priority" ? "Priority" : "Email"}</span>
              </div>
              {plan.features.applicationTracking && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Application Tracking</span>
                </div>
              )}
              {plan.features.careerCoaching && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Career Coaching</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 