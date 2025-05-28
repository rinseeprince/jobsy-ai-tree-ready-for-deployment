"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"

export function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "How does the free plan work?",
      answer:
        "The free plan gives you 3 cover letter generations per month with basic CV analysis. It is perfect for trying out our AI and seeing the quality of applications we create. No credit card required.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes! You can cancel your subscription at any time. Your plan will remain active until the end of your current billing period, and you will not be charged again.",
    },
    {
      question: "What is included in the 30-day money back guarantee?",
      answer:
        "If you are not completely satisfied with your Pro subscription within the first 30 days, we will refund your payment in full. No questions asked.",
    },
    {
      question: "How accurate is the AI-generated content?",
      answer:
        "Our AI is trained on thousands of successful applications and continuously improved. While we recommend reviewing and personalizing the content, our users report 3x higher interview rates compared to generic applications.",
    },
  ]

  return (
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
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>

                {openIndex === index && (
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
  )
}
