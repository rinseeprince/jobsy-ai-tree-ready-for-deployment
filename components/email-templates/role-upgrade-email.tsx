import { Crown, Star, Zap, Clock } from "lucide-react"

interface RoleUpgradeEmailProps {
  userEmail: string
  roleName: string
  grantedBy: string
  grantedDate: string
  expiresAt?: string
  notes?: string
}

export function RoleUpgradeEmail({
  userEmail,
  roleName,
  grantedBy,
  grantedDate,
  expiresAt,
  notes
}: RoleUpgradeEmailProps) {
  const isSuperUser = roleName === "Super User"
  const isAdmin = roleName === "Admin"
  
  const getRoleFeatures = () => {
    if (isAdmin) {
      return [
        "Unlimited platform access",
        "Admin panel access",
        "User management capabilities",
        "System-wide privileges",
        "Permanent access"
      ]
    }
    return [
      "Unlimited platform access",
      "All premium features",
      "Priority support",
      "Advanced AI analysis",
      "30-day access period"
    ]
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md shadow-xl border-0 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-lg -z-10"></div>
        
        <div className="text-center pb-6 pt-8 px-6">
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Special Access Granted!
          </h1>
          <p className="text-gray-600 mb-4">
            You've been upgraded to {roleName} status
          </p>
          <p className="text-purple-600 font-medium text-sm">
            {userEmail}
          </p>
        </div>

        <div className="px-6 pb-6 space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="text-sm text-purple-800">
                <p className="font-medium mb-2">Your {roleName} Benefits:</p>
                <ul className="space-y-1">
                  {getRoleFeatures().map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Granted By:</span>
              <span className="text-sm font-medium">{grantedBy}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Granted Date:</span>
              <span className="text-sm font-medium">{new Date(grantedDate).toLocaleDateString()}</span>
            </div>
            {expiresAt && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Expires:</span>
                <span className="text-sm font-medium">{new Date(expiresAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {notes && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Admin Notes:</p>
                  <p>{notes}</p>
                </div>
              </div>
            </div>
          )}

          {isSuperUser && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium mb-1">Important:</p>
                  <p>Your Super User access will expire in 30 days. Make the most of your enhanced features!</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">Ready to explore?</p>
                <p>Access your enhanced features in your dashboard and start creating AI-powered, ATS-optimized applications.</p>
              </div>
            </div>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-xs text-gray-500">
              Thank you for being part of the JobsyAI community!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 