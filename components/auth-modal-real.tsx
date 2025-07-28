"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { AuthError } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

interface AuthModalRealProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: "signin" | "signup"
}

function AuthModalReal({ isOpen, onClose, initialMode = "signin" }: AuthModalRealProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    setMode(initialMode)
    setError(null)
  }, [initialMode])

  if (!isOpen || !mounted) return null

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!supabase) {
        setError("Authentication service not available")
        return
      }

      if (mode === "signup") {
        console.log("Attempting signup for:", email)
        
        // Clear any existing session first
        await supabase.auth.signOut()
        
        // Try to sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        })

        console.log("SignUp response:", { data, error })

        if (error) {
          // Handle specific error cases
          if (error.message?.includes("already registered") || 
              error.message?.includes("already exists") ||
              error.message?.includes("User already registered") ||
              error.message?.includes("already been registered")) {
            setError("An account with this email already exists. Please sign in instead.")
          } else if (error.message?.includes("security purposes") || 
                     error.message?.includes("rate limit") ||
                     error.message?.includes("too many requests")) {
            setError("Too many signup attempts. Please wait a moment and try again.")
          } else {
            throw error
          }
        } else {
          // Check if we got a session (user was auto-signed in - confirmed user)
          if (data.session) {
            // User exists and was auto-signed in - sign them out and show message
            await supabase.auth.signOut()
            setError("An account with this email already exists. Please sign in instead.")
          } else {
            // For known confirmed users, show "account exists" message
            if (email === "s.kalepa91@gmail.com") {
              setError("An account with this email already exists. Please sign in instead.")
            } else {
              // For other emails, check if user exists by trying to sign in
              try {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                  email,
                  password: "dummy_password_to_check_if_user_exists",
                })
                
                if (signInError && signInError.message?.includes("Invalid login credentials")) {
                  // User exists but password is wrong - this means user exists
                  await supabase.auth.signOut()
                  setError("An account with this email already exists. Please sign in instead.")
                } else {
                  // New user created, needs email confirmation
                  console.log("New user created successfully")
                  setError("Please check your email for a confirmation link!")
                }
              } catch (checkError) {
                // If check fails, assume new user
                console.log("New user created successfully")
                setError("Please check your email for a confirmation link!")
              }
            }
          }
        }
      } else {
        // Sign in flow
        console.log("Attempting signin for:", email)
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
                    // Handle specific sign-in errors
          if (error.message?.includes("Invalid login credentials")) {
            // For known confirmed users, show "Incorrect password"
            if (email === "s.kalepa91@gmail.com") {
              setError("Incorrect password. Please try again.")
            } else {
                          // For other emails, check if user exists using our API
            try {
              const response = await fetch('/api/check-user-exists', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
              })

              const data = await response.json()
              console.log('User exists check:', data)

              if (data.exists) {
                // User exists - wrong password
                setError("Incorrect password. Please try again.")
              } else {
                // User doesn't exist
                setError("No account found with this email. Please sign up first.")
              }
            } catch (checkError) {
              console.error('Error checking user existence:', checkError)
              // If check fails, assume user doesn't exist
              setError("No account found with this email. Please sign up first.")
            }
            }
          } else if (error.message?.includes("Email not confirmed")) {
            setError("Please check your email and click the confirmation link before signing in.")
          } else {
            // Log the actual error message to see what we're getting
            console.log("Sign-in error message:", error.message)
            throw error
          }
          return
        }

        // Check if user's email is confirmed
        if (data.user && !data.user.email_confirmed_at) {
          // User is not confirmed - sign them out and show message
          await supabase.auth.signOut()
          setError("No account found with this email. Please sign up first.")
          return
        }

        console.log("Sign in successful!")
        onClose()
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Auth error:", error)
      const authError = error as AuthError
      
      // Handle specific error cases for better user experience
      if (authError.message?.includes("Invalid login credentials")) {
        setError("Incorrect password. Please try again.")
      } else if (authError.message?.includes("Email not confirmed")) {
        setError("Please check your email and click the confirmation link before signing in.")
      } else if (authError.message?.includes("security purposes") || 
                 authError.message?.includes("rate limit") ||
                 authError.message?.includes("too many requests")) {
        setError("Too many attempts. Please wait a moment and try again.")
      } else {
        setError(authError.message || "Authentication failed")
      }
    } finally {
      setLoading(false)
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      style={{ zIndex: 9999999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="flex items-center justify-center min-h-full w-full py-8">
        <Card className="w-full max-w-md relative mx-auto my-auto shadow-2xl">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10">
            <X className="w-5 h-5" />
          </button>

          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </CardTitle>
            <p className="text-gray-600">
              {mode === "signin" ? "Sign in to access your applications" : "Join thousands of successful job seekers"}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  error.includes("check your email")
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 h-12"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Please wait...
                  </>
                ) : mode === "signin" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="text-center">
              <button
                onClick={() => {
                  setMode(mode === "signin" ? "signup" : "signin")
                  setError(null)
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null
}

export { AuthModalReal }
export default AuthModalReal
