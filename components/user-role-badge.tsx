"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { RolesService, type UserRoleData } from "@/lib/roles"
import { supabase, isSupabaseReady } from "@/lib/supabase"
import { Crown, Star, User } from "lucide-react"

export function UserRoleBadge() {
  const [userRole, setUserRole] = useState<UserRoleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [databaseError, setDatabaseError] = useState(false)

  useEffect(() => {
    if (!isSupabaseReady || !supabase) {
      setLoading(false)
      setDatabaseError(true)
      return
    }

    checkUserRole()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && !databaseError) {
        await checkUserRole()
      } else {
        setUserRole(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [databaseError])

  const checkUserRole = async () => {
    try {
      if (!isSupabaseReady || !supabase || databaseError) {
        setUserRole(null)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setUserRole(null)
        return
      }

      const role = await RolesService.getCurrentUserRole()
      setUserRole(role)
    } catch (error) {
      console.error("Error checking user role:", error)
      setError(true)
      setDatabaseError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !userRole || error || databaseError) {
    return null
  }

  const getRoleConfig = (role: string) => {
    switch (role) {
      case "admin":
        return {
          label: "Admin",
          variant: "destructive" as const,
          icon: <Crown className="h-3 w-3" />,
        }
      case "super_user":
        return {
          label: "Super User",
          variant: "secondary" as const,
          icon: <Star className="h-3 w-3" />,
        }
      default:
        return {
          label: "Free",
          variant: "outline" as const,
          icon: <User className="h-3 w-3" />,
        }
    }
  }

  const config = getRoleConfig(userRole.role)

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      {config.icon}
      {config.label}
    </Badge>
  )
}
