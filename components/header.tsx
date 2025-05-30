"use client"
import { Menu, X, LogOut, UserPlus, Mail, Lock, User, Eye, EyeOff } from "lucide-react"
import type React from "react"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Inline AuthModal component
function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = "signin",
}: {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: (user: { email: string; name: string }) => void
  initialMode?: "signin" | "signup"
}) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  if (!isOpen || !mounted) return null

  const handleGoogleAuth = async () => {
    setLoading(true)
    // Simulate Google auth
    setTimeout(() => {
      onAuthSuccess({
        email: "john.doe@gmail.com",
        name: "John Doe",
      })
      setLoading(false)
      onClose()
    }, 1000)
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate email auth
    setTimeout(() => {
      onAuthSuccess({
        email: email,
        name: name || email.split("@")[0],
      })
      setLoading(false)
      onClose()
    }, 1000)
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
        <Card className="w-full max-w-md relative mx-auto my-auto shadow-2xl" style={{ zIndex: 9999999 }}>
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
            {/* Google Sign In */}
            <Button
              onClick={handleGoogleAuth}
              disabled={loading}
              variant="outline"
              className="w-full h-12 border-2 hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? "Connecting..." : `Continue with Google`}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            {/* Email Form */}
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
                {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
              </Button>
            </form>

            {/* Toggle Mode */}
            <div className="text-center">
              <button
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {mode === "signin" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>

            {mode === "signup" && (
              <p className="text-xs text-gray-500 text-center">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // Use portal to render modal at the end of body
  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null
}

// Inline AuthButtonDemo component
function AuthButtonDemo() {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [loading, setLoading] = useState(false)

  const handleAuthSuccess = (userData: { email: string; name: string }) => {
    setUser(userData)
    // Use window.location for better compatibility in preview
    window.location.href = "/dashboard"
  }

  const handleSignOut = async () => {
    setLoading(true)
    setTimeout(() => {
      setUser(null)
      setLoading(false)
    }, 500)
  }

  const openSignIn = () => {
    setAuthMode("signin")
    setShowAuthModal(true)
  }

  const openSignUp = () => {
    setAuthMode("signup")
    setShowAuthModal(true)
  }

  if (loading) {
    return (
      <Button variant="outline" disabled>
        Loading...
      </Button>
    )
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium">{user.name}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        </div>
        <Button variant="outline" onClick={handleSignOut} size="sm">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center space-x-3">
        <Button variant="outline" onClick={openSignIn}>
          Sign In
        </Button>
        <Button
          onClick={openSignUp}
          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Sign Up
        </Button>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authMode}
      />
    </>
  )
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Check if we're on the homepage
  const isHomePage = pathname === "/"

  const handleSectionNavigation = (sectionId: string) => {
    if (isHomePage) {
      // If we're on the homepage, scroll to the section
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    } else {
      // If we're on a different page, navigate to homepage then scroll
      router.push(`/#${sectionId}`)
    }
    setIsMenuOpen(false) // Close mobile menu
  }

  return (
    <header className="relative z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent"
            >
              Jobsy
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleSectionNavigation("features")}
              className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => handleSectionNavigation("how-it-works")}
              className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              How it Works
            </button>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="/generator" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">
              Cover Letter Generator
            </Link>
            <AuthButtonDemo />
          </nav>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-2 space-y-2">
            <button
              onClick={() => handleSectionNavigation("features")}
              className="block py-2 text-gray-600 w-full text-left"
            >
              Features
            </button>
            <button
              onClick={() => handleSectionNavigation("how-it-works")}
              className="block py-2 text-gray-600 w-full text-left"
            >
              How it Works
            </button>
            <Link href="/pricing" className="block py-2 text-gray-600" onClick={() => setIsMenuOpen(false)}>
              Pricing
            </Link>
            <Link
              href="/generator"
              className="block py-2 text-gray-600 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Cover Letter Generator
            </Link>
            <div className="pt-2 space-y-2">
              <AuthButtonDemo />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
