import { CheckCircle, Star, Zap, Shield } from "lucide-react"

interface SubscriptionConfirmationEmailProps {
  userEmail: string
  planName: string
  planFeatures: string[]
  subscriptionDate: string
  nextBillingDate?: string
}

export function SubscriptionConfirmationEmail({
  userEmail,
  planName,
  planFeatures,
  subscriptionDate,
  nextBillingDate
}: SubscriptionConfirmationEmailProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md shadow-xl border-0 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-lg -z-10"></div>
        
        <div className="text-center pb-6 pt-8 px-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to {planName}!
          </h1>
          <p className="text-gray-600 mb-4">
            Your subscription has been successfully activated
          </p>
          <p className="text-green-600 font-medium text-sm">
            {userEmail}
          </p>
        </div>

        <div className="px-6 pb-6 space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-2">Your {planName} Benefits:</p>
                <ul className="space-y-1">
                  {planFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Subscription Date:</span>
              <span className="text-sm font-medium">{new Date(subscriptionDate).toLocaleDateString()}</span>
            </div>
            {nextBillingDate && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Next Billing:</span>
                <span className="text-sm font-medium">{new Date(nextBillingDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Ready to get started?</p>
                <p>Access your enhanced features in your dashboard and start creating AI-powered, ATS-optimized applications.</p>
              </div>
            </div>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-xs text-gray-500">
              Thank you for choosing JobsyAI. We're excited to help you land your dream job!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 