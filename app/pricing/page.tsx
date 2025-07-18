"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Star, Zap, Crown, CheckCircle, ChevronDown, ChevronUp, Target, Sparkles, MessageSquare, Users, Calendar, ArrowRight } from "lucide-react"
import { SUBSCRIPTION_PLANS, type BillingCycle } from "@/lib/subscription"
import { PaywallService } from "@/lib/paywall"

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly")
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "How does the free plan work?",
      answer:
        "The free plan gives you 3 CV generations, 3 cover letters, and 1 application wizard use per month with GPT-3.5 AI. No credit card required.",
    },
    {
      question: "What's the difference between Pro and Premium?",
      answer:
        "Pro includes unlimited CVs, 20 optimizations, 20 cover letters, and GPT-4 AI. Premium adds unlimited everything, career coaching, salary guides, and job insights.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes! You can cancel your subscription at any time. Your plan will remain active until the end of your current billing period.",
    },
    {
      question: "What's included in the 30-day money back guarantee?",
      answer:
        "If you are not completely satisfied with your subscription within the first 30 days, we will refund your payment in full.",
    },
    {
      question: "How accurate is the AI-generated content?",
      answer:
        "Our AI is trained on thousands of successful applications. Our users report 3x higher interview rates compared to generic applications.",
    },
    {
      question: "Do you offer quarterly billing?",
      answer:
        "Yes! We offer both monthly and quarterly billing options. Quarterly plans come with significant savings - up to 21% off compared to monthly billing.",
    },
  ]

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

  const getPlansForBillingCycle = () => {
    return SUBSCRIPTION_PLANS.filter(plan => plan.billingCycle === billingCycle)
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "free":
        return <Star className="w-6 h-6" />
      case "pro":
        return <Zap className="w-6 h-6" />
      case "premium":
        return <Crown className="w-6 h-6" />
      default:
        return <Star className="w-6 h-6" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "free":
        return "bg-gray-100"
      case "pro":
        return "bg-gradient-to-r from-blue-600 to-teal-600"
      case "premium":
        return "bg-gradient-to-r from-purple-600 to-pink-600"
      default:
        return "bg-gray-100"
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Choose the perfect plan for your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">job search</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            From free cover letters to unlimited applications with premium features. Start free and upgrade when you are
            ready to accelerate your career.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              Cancel anytime
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              30-day money back guarantee
            </div>
          </div>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-gray-900" : "text-gray-500"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "quarterly" : "monthly")}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === "quarterly" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === "quarterly" ? "text-gray-900" : "text-gray-500"}`}>
              Quarterly
              <Badge className="ml-2 bg-green-100 text-green-800 text-xs">Save up to 21%</Badge>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {getPlansForBillingCycle().map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? "border-blue-500 shadow-lg scale-105" 
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                )}
                {plan.savings && (
                  <Badge className="absolute -top-3 -right-3 bg-green-500 text-white px-2 py-1 text-xs">
                    {plan.savings}
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className={`w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center ${getTierColor(plan.tier)} ${plan.tier !== "free" ? "text-white" : "text-gray-600"}`}>
                    {getTierIcon(plan.tier)}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">
                    {plan.tier === "free" 
                      ? "Perfect for trying out our AI-powered applications"
                      : plan.tier === "pro"
                      ? "For active job seekers who want the best results"
                      : "For professionals who want everything unlimited"
                    }
                  </p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600">
                      /{plan.billingCycle === "monthly" ? "month" : "quarter"}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isLoading === plan.id}
                    variant={plan.tier === "free" ? "outline" : "default"}
                    size="lg"
                    className={`w-full ${
                      plan.tier === "pro" 
                        ? "bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                        : plan.tier === "premium"
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        : ""
                    }`}
                  >
                    {isLoading === plan.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {plan.tier === "free" ? "Get Started Free" : `Start ${plan.name} Trial`}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </CardHeader>
                
                <CardContent>
                  <h4 className="font-semibold text-gray-900 mb-3">What is included:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        {plan.features.cvGenerations === "unlimited" 
                          ? "Unlimited CV generations"
                          : `${plan.features.cvGenerations} CV generations per month`
                        }
                      </span>
                    </li>
                    {plan.features.cvOptimizations !== 0 && (
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          {plan.features.cvOptimizations === "unlimited"
                            ? "Unlimited CV optimizations"
                            : `${plan.features.cvOptimizations} CV optimizations per month`
                          }
                        </span>
                      </li>
                    )}
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        {plan.features.coverLetters === "unlimited"
                          ? "Unlimited cover letters"
                          : `${plan.features.coverLetters} cover letters per month`
                        }
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        {plan.features.applicationWizard === "unlimited"
                          ? "Unlimited application wizard uses"
                          : `${plan.features.applicationWizard} application wizard uses per month`
                        }
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        {plan.features.aiModel === "gpt-4" ? "GPT-4 AI" : "GPT-3.5 AI"}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">
                        {plan.features.support === "priority" ? "Priority support" : "Email support"}
                      </span>
                    </li>
                    {plan.features.applicationTracking && (
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Application tracking dashboard</span>
                      </li>
                    )}
                    {plan.features.careerCoaching && (
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">1-on-1 career coaching session (monthly)</span>
                      </li>
                    )}
                    {plan.features.salaryNegotiation && (
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Salary negotiation guides</span>
                      </li>
                    )}
                    {plan.features.jobMarketInsights && (
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Job market insights</span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800">
                <X className="w-4 h-4" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Compare all features</h2>
            <p className="text-xl text-gray-600">See exactly what is included in each plan</p>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="bg-white border-b">
              <div className="grid grid-cols-4 gap-4">
                <div></div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Free</h3>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-blue-600">Pro</h3>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Enterprise</h3>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="bg-gray-100 px-6 py-3 border-b">
                <h3 className="font-semibold text-gray-900">Core Features</h3>
              </div>

              <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="font-medium text-gray-900">Cover letter generation</div>
                <div className="text-center">
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                </div>
                <div className="text-center">
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                </div>
                <div className="text-center">
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="font-medium text-gray-900">Applications per month</div>
                <div className="text-center">
                  <span className="text-sm text-gray-700">3</span>
                </div>
                <div className="text-center">
                  <span className="text-sm text-gray-700">Unlimited</span>
                </div>
                <div className="text-center">
                  <span className="text-sm text-gray-700">Unlimited</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="font-medium text-gray-900">Priority support</div>
                <div className="text-center">
                  <X className="w-5 h-5 text-gray-300 mx-auto" />
                </div>
                <div className="text-center">
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                </div>
                <div className="text-center">
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="font-medium text-gray-900">API access</div>
                <div className="text-center">
                  <X className="w-5 h-5 text-gray-300 mx-auto" />
                </div>
                <div className="text-center">
                  <X className="w-5 h-5 text-gray-300 mx-auto" />
                </div>
                <div className="text-center">
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
            <p className="text-xl text-gray-600">Everything you need to know about our pricing and plans</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-0">
                  <button
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  >
                    <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                    {openFaqIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>

                  {openFaqIndex === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
