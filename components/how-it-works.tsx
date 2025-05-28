import React from 'react'
import { Upload, Wand2, Download, CheckCircle } from 'lucide-react'

export function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: "Upload Your CV",
      description: "Upload your existing CV and paste the job posting you're interested in",
      step: "01",
    },
    {
      icon: Wand2,
      title: "AI Analysis",
      description: "Our AI analyzes the job requirements and your background to create perfect matches",
      step: "02",
    },
    {
      icon: Download,
      title: "Get Your Documents",
      description: "Download your optimized CV and personalized cover letter instantly",
      step: "03",
    },
    {
      icon: CheckCircle,
      title: "Apply & Get Hired",
      description: "Submit your application with confidence and watch the interview invites roll in",
      step: "04",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How it works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get from job posting to perfect application in just 4 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}