"use client"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star } from "lucide-react"
import { JobCards } from "@/components/job-cards"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-400/20 via-teal-400/10 to-transparent rounded-bl-[100px] transform rotate-12 scale-150"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                AI-Powered CV Generation{" "}
                <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Optimized for ATS Systems
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Don't let your dream job slip away because of a generic CV or a rejected application. Our AI-driven platform transforms your CV and cover letter to speak the language recruiters love. Just upload your CV and a job description, and our smart engine does the rest. Every word is optimized to get you noticed, every application tailored to open doors.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-lg px-8 py-4"
                onClick={() => (window.location.href = "/generator")}
              >
                Create Cover Letter
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 text-lg px-8 py-4"
              >
                See it in action
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">S</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">M</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">E</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">J</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">Trusted by 50,000+ job seekers</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">AI-powered ATS optimization in seconds</span>
                </div>
                <div className="text-sm text-gray-500">•</div>
                <div className="text-sm text-gray-600">3x higher interview rate</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <JobCards />
          </div>
        </div>
      </div>
    </section>
  )
}
