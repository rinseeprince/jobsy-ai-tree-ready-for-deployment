"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { RolesService, type UserNotification } from "@/lib/roles"
import { supabase, isSupabaseReady } from "@/lib/supabase"
import { Bell, Check, CheckCheck } from "lucide-react"

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [databaseError, setDatabaseError] = useState(false)

  useEffect(() => {
    if (!isSupabaseReady || !supabase) {
      setLoading(false)
      setDatabaseError(true)
      return
    }

    loadNotifications()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && !databaseError) {
        await loadNotifications()
      } else {
        setNotifications([])
        setUnreadCount(0)
      }
    })

    return () => subscription.unsubscribe()
  }, [databaseError])

  const loadNotifications = async () => {
    try {
      if (!isSupabaseReady || !supabase || databaseError) {
        setNotifications([])
        setUnreadCount(0)
        return
      }

      const [notifs, count] = await Promise.all([
        RolesService.getUserNotifications(),
        RolesService.getUnreadNotificationsCount(),
      ])
      setNotifications(notifs)
      setUnreadCount(count)
    } catch (error) {
      console.error("Error loading notifications:", error)
      setError(true)
      setDatabaseError(true)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await RolesService.markNotificationAsRead(notificationId)
      await loadNotifications()
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await RolesService.markAllNotificationsAsRead()
      await loadNotifications()
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading || error || databaseError) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Bell className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4" />
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <DropdownMenuItem disabled>
            <div className="text-center py-4 text-gray-500">No notifications</div>
          </DropdownMenuItem>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start p-3 ${!notification.read ? "bg-blue-50" : ""}`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium text-sm">{notification.title}</span>
                {!notification.read && (
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Check className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
              <span className="text-xs text-gray-400 mt-1">{formatDate(notification.created_at)}</span>
            </DropdownMenuItem>
          ))
        )}

        {notifications.length > 5 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-gray-500">
              +{notifications.length - 5} more notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
