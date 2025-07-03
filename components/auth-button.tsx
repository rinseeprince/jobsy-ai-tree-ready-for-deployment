"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, UserPlus } from "lucide-react"
import { supabase, isSupabaseReady } from "@/lib/supabase"
import { AuthModalReal } from "./auth-modal-real"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { ApplicationsService } from "@/lib/supabase"

export function AuthButton() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [userName, setUserName] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    // Check auth status immediately and on mount
    const checkAuth = async () => {
      if (!isSupabaseReady || !supabase) {
        if (mounted) {
          setLoading(false)
        }
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
    if (isSupabaseReady && supabase) {
      try {
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (mounted) {
            setUser(session?.user ?? null)
            setLoading(false)

            if (event === "SIGNED_IN" && session?.user) {
              setShowAuthModal(false)
              fetchUserName()
              router.push("/dashboard")
            } else if (event === "SIGNED_OUT") {
              setUserName("")
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
    if (!supabase) return

    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.warn("Sign out failed:", error)
    }
  }

  const fetchUserName = async () => {
    try {
      const profile = await ApplicationsService.getUserProfile()
      if (profile?.full_name) {
        setUserName(profile.full_name)
      } else if (user?.email) {
        // Extract name from email as fallback
        const emailName = user.email.split("@")[0]
        setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1))
      }
    } catch (error) {
      console.warn("Failed to fetch user name:", error)
      if (user?.email) {
        const emailName = user.email.split("@")[0]
        setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1))
      }
    }
  }

  useEffect(() => {
    if (user && isSupabaseReady) {
      fetchUserName()
    }
  }, [user])

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
        <span className="text-sm">Welcome, {userName || user.email}</span>
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
