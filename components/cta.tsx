"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function CTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-teal-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-6">
          <Sparkles className="w-12 h-12 text-white" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to land more interviews?</h2>

        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join thousands of job seekers who have transformed their applications and accelerated their careers with
          job-specific AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
            onClick={() => (window.location.href = "/generator")}
          >
            Create your cover letter
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
            See success stories
          </Button>
        </div>

        <p className="text-blue-100 text-sm mt-6">No credit card required • Free forever plan • Instant results</p>
      </div>
    </section>
  )
}
