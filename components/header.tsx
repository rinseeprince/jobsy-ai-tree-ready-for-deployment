"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AuthButton } from "./auth-button"
import { UserRoleBadge } from "./user-role-badge"
import { NotificationsDropdown } from "./notifications-dropdown"
import { RolesService } from "@/lib/roles"
import { supabase, isSupabaseReady } from "@/lib/supabase"
import { useState, useEffect } from "react"
import { Shield } from "lucide-react"

export function Header() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [databaseError, setDatabaseError] = useState(false)

  useEffect(() => {
    checkUser()

    if (!isSupabaseReady || !supabase) {
      setLoading(false)
      setDatabaseError(true)
      return
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          setUser(session.user)
          // Only try to check admin status if we haven't had database errors
          if (!databaseError) {
            const adminStatus = await RolesService.isCurrentUserAdmin()
            setIsAdmin(adminStatus)
          }
        } else {
          setUser(null)
          setIsAdmin(false)
        }
      } catch (err) {
        console.error("Error in auth state change:", err)
        setError(true)
        setDatabaseError(true)
      } finally {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [databaseError])

  const checkUser = async () => {
    try {
      if (!isSupabaseReady || !supabase) {
        setUser(null)
        setIsAdmin(false)
        setDatabaseError(true)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user && !databaseError) {
        try {
          const adminStatus = await RolesService.isCurrentUserAdmin()
          setIsAdmin(adminStatus)
        } catch (roleError) {
          console.error("Error checking admin status:", roleError)
          setDatabaseError(true)
        }
      }
    } catch (error) {
      console.error("Error checking user:", error)
      setError(true)
      setDatabaseError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">J</span>
              </div>
              <span className="font-bold text-xl text-gray-900">Jobsy</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
              How it works
            </Link>
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user && !error && !databaseError && (
              <>
                <UserRoleBadge />
                <NotificationsDropdown />

                {!loading && isAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
              </>
            )}

            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  )
}
