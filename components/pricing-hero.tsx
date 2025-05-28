import { CheckCircle } from "lucide-react"

export function PricingHero() {
  return (
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
  )
}
