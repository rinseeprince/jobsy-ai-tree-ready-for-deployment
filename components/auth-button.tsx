"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, UserPlus } from "lucide-react"
import { supabase, isSupabaseReady } from "@/lib/supabase"
import { AuthModalReal } from "./auth-modal-real"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

export function AuthButton() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    // Check auth status immediately and on mount
    const checkAuth = async () => {
      if (!isSupabaseReady) {
        return
      }

      try {
        const { data } = await supabase.auth.getSession()
        if (mounted) {
          setUser(data.session?.user ?? null)
          setLoading(false)
        }
      } catch (error) {
        console.warn("Auth session check failed:", error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    checkAuth()

    // Set up auth listener only if Supabase is configured
    if (isSupabaseReady) {
      try {
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (mounted) {
            setUser(session?.user ?? null)
            setLoading(false)

            if (event === "SIGNED_IN" && session?.user) {
              setShowAuthModal(false)
              router.push("/dashboard")
            }
          }
        })

        return () => {
          mounted = false
          subscription.unsubscribe()
        }
      } catch (error) {
        console.warn("Auth state change listener failed:", error)
      }
    } else {
      setLoading(false)
    }

    return () => {
      mounted = false
    }
  }, [router])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.warn("Sign out failed:", error)
    }
  }

  if (loading) {
    return (
      <Button variant="outline" disabled>
        Loading...
      </Button>
    )
  }

  // If Supabase is not configured, show demo mode
  if (!isSupabaseReady) {
    return (
      <div className="flex items-center space-x-3">
        <Button variant="outline" disabled>
          Sign In (Demo Mode)
        </Button>
        <Button disabled className="bg-gradient-to-r from-blue-600 to-teal-600 opacity-50">
          <UserPlus className="w-4 h-4 mr-2" />
          Sign Up (Demo Mode)
        </Button>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm">Welcome, {user.email}</span>
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
        <Button
          variant="outline"
          onClick={() => {
            setAuthMode("signin")
            setShowAuthModal(true)
          }}
        >
          Sign In
        </Button>
        <Button
          onClick={() => {
            setAuthMode("signup")
            setShowAuthModal(true)
          }}
          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Sign Up
        </Button>
      </div>

      {showAuthModal && (
        <AuthModalReal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authMode} />
      )}
    </>
  )
}

export default AuthButton
