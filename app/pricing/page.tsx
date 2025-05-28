"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Star, Zap, Crown, CheckCircle, ChevronDown, ChevronUp } from "lucide-react"

export default function PricingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "How does the free plan work?",
      answer:
        "The free plan gives you 3 cover letter generations per month with basic CV analysis. No credit card required.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes! You can cancel your subscription at any time. Your plan will remain active until the end of your current billing period.",
    },
    {
      question: "What is included in the 30-day money back guarantee?",
      answer:
        "If you are not completely satisfied with your Pro subscription within the first 30 days, we will refund your payment in full.",
    },
    {
      question: "How accurate is the AI-generated content?",
      answer:
        "Our AI is trained on thousands of successful applications. Our users report 3x higher interview rates compared to generic applications.",
    },
  ]

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

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="relative border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
              <CardHeader className="text-center pb-8">
                <div className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center bg-gray-100">
                  <Star className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <p className="text-gray-600 mb-4">Perfect for trying out our AI-powered applications</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600">/forever</span>
                </div>
                <Button variant="outline" size="lg" className="w-full">
                  Get Started Free
                </Button>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold text-gray-900 mb-3">What is included:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">3 cover letters per month</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Basic CV analysis</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Standard templates</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Email support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2 border-blue-500 shadow-lg scale-105 transition-all duration-300 hover:shadow-xl">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-1">
                Most Popular
              </Badge>
              <CardHeader className="text-center pb-8">
                <div className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center bg-gradient-to-r from-blue-600 to-teal-600">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                <p className="text-gray-600 mb-4">For active job seekers who want the best results</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">$19</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                >
                  Start Pro Trial
                </Button>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold text-gray-900 mb-3">What is included:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Unlimited cover letters</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Advanced CV optimization</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Premium templates</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Application tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
              <CardHeader className="text-center pb-8">
                <div className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center bg-gray-100">
                  <Crown className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-600 mb-4">For teams and career coaches helping multiple clients</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">$99</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <Button variant="outline" size="lg" className="w-full">
                  Contact Sales
                </Button>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold text-gray-900 mb-3">What is included:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Everything in Pro</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Team collaboration</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Bulk processing</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Custom branding</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">API access</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
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
