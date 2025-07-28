"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, RefreshCw, ArrowLeft, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function EmailConfirmationPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [checkingConfirmation, setCheckingConfirmation] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        if (!supabase) {
          console.error("Supabase not configured")
          router.push("/")
          return
        }

        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error("Error getting user:", error)
          router.push("/")
          return
        }

        if (!user) {
          router.push("/")
          return
        }

        // If user is already confirmed, redirect to dashboard
        if (user.email_confirmed_at) {
          router.push("/dashboard")
          return
        }

        setUser(user)
      } catch (error) {
        console.error("Error in checkUser:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const handleResendEmail = async () => {
    if (!user?.email || !supabase) return

    setResending(true)
    setResendSuccess(false)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      })

      if (error) {
        console.error("Error resending email:", error)
        alert("Failed to resend confirmation email. Please try again.")
      } else {
        setResendSuccess(true)
        setTimeout(() => setResendSuccess(false), 5000)
      }
    } catch (error) {
      console.error("Error in handleResendEmail:", error)
      alert("An unexpected error occurred. Please try again.")
    } finally {
      setResending(false)
    }
  }

  const handleCheckConfirmation = async () => {
    if (!supabase) return
    
    setCheckingConfirmation(true)

    try {
      // Refresh the user session to check if email was confirmed
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error("Error refreshing session:", error)
        alert("Failed to check confirmation status. Please try again.")
        return
      }

      if (data.user?.email_confirmed_at) {
        // Email confirmed, redirect to dashboard
        router.push("/dashboard")
      } else {
        alert("Email not confirmed yet. Please check your inbox and click the confirmation link.")
      }
    } catch (error) {
      console.error("Error in handleCheckConfirmation:", error)
      alert("An unexpected error occurred. Please try again.")
    } finally {
      setCheckingConfirmation(false)
    }
  }

  const handleSignOut = async () => {
    if (!supabase) {
      router.push("/")
      return
    }
    
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      router.push("/")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-lg -z-10"></div>
        
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Confirm Your Email
          </CardTitle>
          <p className="text-gray-600 mt-2">
            We've sent a confirmation link to
          </p>
          <p className="text-blue-600 font-medium">
            {user?.email}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {resendSuccess && (
            <div className="p-3 rounded-lg bg-green-50 text-green-800 border border-green-200 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmation email sent successfully!
            </div>
          )}

          <div className="text-center space-y-4">
            <p className="text-gray-600 text-sm">
              Please check your email and click the confirmation link to activate your account.
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={handleCheckConfirmation}
                disabled={checkingConfirmation}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              >
                {checkingConfirmation ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    I've Confirmed My Email
                  </>
                )}
              </Button>

              <Button
                onClick={handleResendEmail}
                disabled={resending}
                variant="outline"
                className="w-full"
              >
                {resending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Resend Confirmation Email
                  </>
                )}
              </Button>

              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="w-full text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-xs text-gray-500">
              Didn't receive the email? Check your spam folder or try signing up again.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 