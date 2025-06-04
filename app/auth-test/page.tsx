"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { supabase, isSupabaseReady } from "@/lib/supabase"
import { AuthButton } from "@/components/auth-button"

export default function AuthTestPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (!isSupabaseReady) {
        setLoading(false)
        return
      }

      try {
        const { data } = await supabase.auth.getSession()
        setUser(data.session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.error("Auth check error:", error)
        setLoading(false)
      }
    }

    checkAuth()

    if (isSupabaseReady) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null)
      })

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/">
          <Button variant="outline" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-3xl font-bold">Authentication Test Page</h1>
        <p className="text-gray-600 mb-8">
          This page helps you verify your authentication status. If you are properly signed in, you will see your email
          address below.
        </p>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Authentication Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Checking authentication...</span>
              </div>
            ) : !isSupabaseReady ? (
              <div className="flex items-center space-x-2 text-yellow-800">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span>Supabase not configured</span>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>
                  Signed in as <strong>{user.email}</strong>
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-red-800">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span>Not signed in</span>
                </div>
                <AuthButton />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold mb-2">Next Steps:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Make sure you are signed in (you should see your email above)</li>
            <li>
              Go to the{" "}
              <Link href="/generator" className="text-blue-600 underline">
                Cover Letter Generator
              </Link>
            </li>
            <li>Complete the generation process</li>
            <li>At step 4, you should see the Save Application form</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
