"use client"

import { useEffect, useState } from "react"
import { AdminPanel } from "@/components/admin-panel"
import { RolesService } from "@/lib/roles"
import { supabase, isSupabaseReady } from "@/lib/supabase"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { redirect } from "next/navigation"

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      if (!isSupabaseReady || !supabase) {
        redirect("/")
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        redirect("/")
        return
      }

      setUser(user)
      const adminStatus = await RolesService.isCurrentUserAdmin()
      setIsAdmin(adminStatus)

      if (!adminStatus) {
        // Not an admin, redirect to dashboard
        redirect("/dashboard")
        return
      }
    } catch (error) {
      console.error("Error checking admin access:", error)
      redirect("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (isAdmin === false) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              Access Denied
            </CardTitle>
            <CardDescription>You don't have permission to access the admin panel.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <AdminPanel currentUserId={user?.id} />
    </div>
  )
}
