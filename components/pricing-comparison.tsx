import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X } from "lucide-react"

export function PricingComparison() {
  return (
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
                <CardTitle className="text-lg">Free</CardTitle>
              </div>
              <div className="text-center">
                <CardTitle className="text-lg text-blue-600">Pro</CardTitle>
              </div>
              <div className="text-center">
                <CardTitle className="text-lg">Enterprise</CardTitle>
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
              <div className="font-medium text-gray-900">CV analysis</div>
              <div className="text-center">
                <span className="text-sm text-gray-700">Basic</span>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-700">Advanced</span>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-700">Advanced</span>
              </div>
            </div>

            <div className="bg-gray-100 px-6 py-3 border-b">
              <h3 className="font-semibold text-gray-900">Advanced Features</h3>
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
  )
}
