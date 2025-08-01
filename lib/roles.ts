import { supabase, isSupabaseReady } from "./supabase"

// Helper function to ensure supabase client is available
const getSupabaseClient = () => {
  if (!isSupabaseReady || !supabase) {
    throw new Error("Supabase not configured")
  }
  return supabase
}

export type UserRole = "free" | "pro" | "premium" | "super_user" | "admin"

// New interface for user role data returned by getCurrentUserRole
export interface UserRoleData {
  role: UserRole
  is_active: boolean
  expires_at: string | null
}

export interface UserRoleInfo {
  id: string
  user_id: string
  email: string
  role: UserRole
  granted_by: string | null
  granted_at: string
  expires_at: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RoleGrantLog {
  id: string
  user_id: string
  email: string
  role: UserRole
  action: "granted" | "revoked" | "expired"
  granted_by: string | null
  granted_at: string
  expires_at: string | null
  notes: string | null
  created_at: string
}

export interface UserNotification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  data: any
  read: boolean
  created_at: string
  updated_at: string
}

export class RolesService {
  /**
   * Get the current user's role
   */
  static async getCurrentUserRole(): Promise<UserRoleData | null> {
    if (!isSupabaseReady || !supabase) {
      console.warn("⚠️ Supabase not configured, returning null")
      return null
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return null
      }

      // First check for manual role assignment
      try {
        const supabaseClient = getSupabaseClient()
        const { data: roleData, error } = await supabaseClient
          .from("user_roles")
          .select("role, expires_at, is_active")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single()

        if (error) {
          // Check for various error types
          if (error.code === "42P01" || error.message.includes("does not exist")) {
            console.warn("User roles table does not exist, falling back to subscription")
          } else if (error.code === "406" || error.code === "500") {
            console.warn("Database error (406/500), falling back to subscription:", error.message)
          } else if (error.code !== "PGRST116") {
            console.error("Error fetching user role:", error)
          }
        }

        // If user has an active manual role that hasn't expired
        if (roleData && roleData.is_active) {
          const now = new Date()
          const expiresAt = roleData.expires_at ? new Date(roleData.expires_at) : null

          if (!expiresAt || expiresAt > now) {
            return {
              role: roleData.role as UserRole,
              is_active: roleData.is_active,
              expires_at: roleData.expires_at,
            }
          }
        }
      } catch (roleError: any) {
        console.warn("Could not fetch user roles, falling back to subscription:", roleError?.message || roleError)
      }

      // Fall back to subscription-based role
      try {
        const supabaseClient2 = getSupabaseClient()
        const { data: subscription, error: subscriptionError } = await supabaseClient2
          .from("user_subscriptions")
          .select("plan_id, status")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single()

        if (subscriptionError) {
          // Check for various error types
          if (subscriptionError.code === "42P01" || subscriptionError.message.includes("does not exist")) {
            console.warn("User subscriptions table does not exist")
          } else if (subscriptionError.code === "406" || subscriptionError.code === "500") {
            console.warn("Database error (406/500) for subscriptions:", subscriptionError.message)
          } else if (subscriptionError.code !== "PGRST116") {
            console.error("Error fetching user subscriptions:", subscriptionError)
          }
        }

        if (subscription) {
          // Map subscription plan to role
          let role: UserRole = "free"
          if (subscription.plan_id.includes("premium")) {
            role = "premium"
          } else if (subscription.plan_id.includes("pro")) {
            role = "pro"
          }

          return {
            role,
            is_active: true,
            expires_at: null,
          }
        }
      } catch (subscriptionError: any) {
        console.warn("Could not fetch user subscriptions:", subscriptionError?.message || subscriptionError)
      }

      return {
        role: "free",
        is_active: true,
        expires_at: null,
      }
    } catch (error: any) {
      console.error("Error getting current user role:", error?.message || error)
      return null
    }
  }

  /**
   * Check if current user has admin privileges
   */
  static async isCurrentUserAdmin(): Promise<boolean> {
    const userRole = await this.getCurrentUserRole()
    return userRole?.role === "admin"
  }

  /**
   * Check if current user has super user or admin privileges
   */
  static async isCurrentUserSuperUser(): Promise<boolean> {
    const userRole = await this.getCurrentUserRole()
    return userRole?.role === "admin" || userRole?.role === "super_user"
  }

  /**
   * Get user role info by user ID
   */
  static async getUserRoleInfo(userId: string): Promise<UserRoleInfo | null> {
    if (!isSupabaseReady || !supabase) {
      return null
    }

    try {
      const supabaseClient = getSupabaseClient()
      const { data, error } = await supabaseClient.from("user_roles").select("*").eq("user_id", userId).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching user role info:", error)
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        return null
      }

      return data as UserRoleInfo
    } catch (error) {
      console.error("Error getting user role info:", error)
      return null
    }
  }

  /**
   * Grant role to user by email (admin only) - FIXED VERSION
   */
  static async grantRoleByEmail(
    email: string,
    role: UserRole,
    notes?: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseReady || !supabase) {
      return { success: false, message: "Database not configured" }
    }

    try {
      // Check if current user is admin
      const isAdmin = await this.isCurrentUserAdmin()
      if (!isAdmin) {
        return { success: false, message: "Insufficient permissions" }
      }

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      if (!currentUser) {
        return { success: false, message: "Not authenticated" }
      }

      // First, try to find user in auth.users (this might not work due to RLS)
      // So we'll use a different approach - call the function directly
      console.log("Attempting to grant role:", { email, role, notes })

      // Call the grant_user_role function with better error handling
      console.log("Calling grant_user_role function with params:", {
        target_user_id: null,
        target_email: email,
        new_role: role,
        granted_by_id: currentUser.id,
        expiry_days: role === "admin" ? null : 30,
        grant_notes: notes || null,
      })

      const { data: result, error: grantError } = await supabase.rpc("grant_user_role", {
        target_user_id: null, // Let the function find the user by email
        target_email: email,
        new_role: role,
        granted_by_id: currentUser.id,
        expiry_days: role === "admin" ? null : 30,
        grant_notes: notes || null,
      })

      console.log("grant_user_role result:", result)
      console.log("grant_user_role error:", grantError)

      if (grantError) {
        console.error("Error granting role:", grantError)

        // Handle specific error cases
        if (grantError.message?.includes("User not found")) {
          return { success: false, message: `No user found with email: ${email}. The user must sign up first.` }
        }

        if (grantError.message?.includes("already has role")) {
          return { success: false, message: `User ${email} already has the ${role} role.` }
        }

        return { success: false, message: `Failed to grant role: ${grantError.message}` }
      }

      if (!result) {
        console.error("No result returned from grant_user_role function")
        return { success: false, message: "No response from server" }
      }

      console.log("Role grant result:", result)

      // Send notification email (disabled for now to avoid console errors)
      // try {
      //   await this.sendRoleChangeNotification(email, role, notes)
      // } catch (emailError) {
      //   console.warn("Failed to send notification email:", emailError)
      //   // Don't fail the whole operation if email fails
      // }

      return {
        success: true,
        message: `Successfully granted ${role} role to ${email}${role === "super_user" ? " for 30 days" : ""}`,
      }
    } catch (error) {
      console.error("Error in grantRoleByEmail:", error)
      return { success: false, message: "An unexpected error occurred" }
    }
  }

  /**
   * Send role change notification email
   */
  static async sendRoleChangeNotification(email: string, role: UserRole, notes?: string): Promise<void> {
    if (!isSupabaseReady || !supabase) {
      throw new Error("Database not configured")
    }

    try {
      // First try to get user ID from auth.users (using a function call to bypass RLS)
      let userId: string | null = null
      
      try {
        // Try to get user ID from profiles table first
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", email)
          .single()

        if (!userError && userData) {
          userId = userData.id
        }
      } catch (profileError) {
        // If profiles table doesn't exist or user not found, try to get from user_roles
        console.warn("Could not find user profile for notification:", email)
        
        try {
          const { data: roleData, error: roleError } = await supabase
            .from("user_roles")
            .select("user_id")
            .eq("email", email)
            .eq("is_active", true)
            .single()

          if (!roleError && roleData) {
            userId = roleData.user_id
          }
        } catch (roleLookupError) {
          console.warn("Could not find user in user_roles table either:", email)
        }
      }

      // If we found a user ID, create notification
      if (userId) {
        const notificationData = {
          user_id: userId,
          type: "role_change",
          title: `Your JobsyAI access has been upgraded!`,
          message: `You've been granted ${this.getRoleDisplayName(role)} access${role === "super_user" ? " for 30 days" : ""}.`,
          data: {
            role,
            notes,
            granted_at: new Date().toISOString(),
          },
          read: false,
        }

        const { error: notificationError } = await supabase.from("user_notifications").insert(notificationData)

        if (notificationError) {
          console.warn("Failed to create notification record:", notificationError)
        }

        console.log("Role change notification sent to:", email, "Role:", role)
      } else {
        console.warn("Could not find user ID for notification, skipping notification for:", email)
      }
    } catch (error) {
      console.error("Error sending role change notification:", error)
      // Don't throw error - just log it and continue
    }
  }

  /**
   * Revoke user role (admin only)
   */
  static async revokeUserRole(userId: string, notes?: string): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseReady || !supabase) {
      return { success: false, message: "Database not configured" }
    }

    try {
      // Check if current user is admin
      const isAdmin = await this.isCurrentUserAdmin()
      if (!isAdmin) {
        return { success: false, message: "Insufficient permissions" }
      }

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      if (!currentUser) {
        return { success: false, message: "Not authenticated" }
      }

      // Call the revoke_user_role function
      const { error: revokeError } = await supabase.rpc("revoke_user_role", {
        target_user_id: userId,
        revoked_by_id: currentUser.id,
        revoke_notes: notes || null,
      })

      if (revokeError) {
        console.error("Error revoking role:", revokeError)
        return { success: false, message: `Failed to revoke role: ${revokeError.message}` }
      }

      return { success: true, message: "Successfully revoked user role" }
    } catch (error) {
      console.error("Error in revokeUserRole:", error)
      return { success: false, message: "An unexpected error occurred" }
    }
  }

  /**
   * Get all users with special roles (admin only)
   */
  static async getAllSpecialUsers(): Promise<UserRoleInfo[]> {
    if (!isSupabaseReady || !supabase) {
      return []
    }

    try {
      // Check if current user is admin
      const isAdmin = await this.isCurrentUserAdmin()
      if (!isAdmin) {
        return []
      }

      const supabaseClient = getSupabaseClient()
      const { data, error } = await supabaseClient
        .from("user_roles")
        .select("*")
        .in("role", ["admin", "super_user"])
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching special users:", error)
        return []
      }

      return data as UserRoleInfo[]
    } catch (error) {
      console.error("Error getting special users:", error)
      return []
    }
  }

  /**
   * Get role grants log (admin only)
   */
  static async getRoleGrantsLog(): Promise<RoleGrantLog[]> {
    if (!isSupabaseReady || !supabase) {
      return []
    }

    try {
      // Check if current user is admin
      const isAdmin = await this.isCurrentUserAdmin()
      if (!isAdmin) {
        return []
      }

      const supabaseClient = getSupabaseClient()
      const { data, error } = await supabaseClient
        .from("role_grants_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

      if (error) {
        console.error("Error fetching role grants log:", error)
        return []
      }

      return data as RoleGrantLog[]
    } catch (error) {
      console.error("Error getting role grants log:", error)
      return []
    }
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(): Promise<UserNotification[]> {
    if (!isSupabaseReady || !supabase) {
      return []
    }

    try {
      const supabaseClient = getSupabaseClient()
      const {
        data: { user },
      } = await supabaseClient.auth.getUser()
      if (!user) {
        return []
      }

      const { data, error } = await supabaseClient
        .from("user_notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) {
        // Check if it's a table doesn't exist error
        if (error.code === "42P01" || error.message.includes("does not exist")) {
          console.warn("User notifications table does not exist, returning empty array")
          return []
        } else if (error.code === "406" || error.code === "500") {
          console.warn("Database error (406/500) for notifications, returning empty array:", error.message)
          return []
        }
        console.error("Error fetching notifications:", error)
        return []
      }

      return data as UserNotification[]
    } catch (error: any) {
      console.error("Error getting notifications:", error?.message || error)
      return []
    }
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    if (!isSupabaseReady || !supabase) {
      return false
    }

    try {
      const { error } = await supabase
        .from("user_notifications")
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq("id", notificationId)

      if (error) {
        // Check if it's a table doesn't exist error
        if (error.code === "42P01" || error.message.includes("does not exist")) {
          console.warn("User notifications table does not exist")
          return false
        } else if (error.code === "406" || error.code === "500") {
          console.warn("Database error (406/500) for marking notification as read:", error.message)
          return false
        }
        console.error("Error marking notification as read:", error)
        return false
      }

      return true
    } catch (error: any) {
      console.error("Error marking notification as read:", error?.message || error)
      return false
    }
  }

  /**
   * Mark all notifications as read for current user
   */
  static async markAllNotificationsAsRead(): Promise<boolean> {
    if (!isSupabaseReady || !supabase) {
      return false
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return false
      }

      const { error } = await supabase
        .from("user_notifications")
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("read", false)

      if (error) {
        // Check if it's a table doesn't exist error
        if (error.code === "42P01" || error.message.includes("does not exist")) {
          console.warn("User notifications table does not exist")
          return false
        } else if (error.code === "406" || error.code === "500") {
          console.warn("Database error (406/500) for marking all notifications as read:", error.message)
          return false
        }
        console.error("Error marking all notifications as read:", error)
        return false
      }

      return true
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error?.message || error)
      return false
    }
  }

  /**
   * Get unread notifications count
   */
  static async getUnreadNotificationsCount(): Promise<number> {
    if (!isSupabaseReady || !supabase) {
      return 0
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return 0
      }

      const { count, error } = await supabase
        .from("user_notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false)

      if (error) {
        // Check if it's a table doesn't exist error
        if (error.code === "42P01" || error.message.includes("does not exist")) {
          console.warn("User notifications table does not exist, returning 0")
          return 0
        } else if (error.code === "406" || error.code === "500") {
          console.warn("Database error (406/500) for unread notifications count, returning 0:", error.message)
          return 0
        }
        console.error("Error getting unread notifications count:", error)
        return 0
      }

      return count || 0
    } catch (error: any) {
      console.error("Error getting unread notifications count:", error?.message || error)
      return 0
    }
  }

  /**
   * Run role expiration check (typically called by cron job)
   */
  static async expireRoles(): Promise<void> {
    if (!isSupabaseReady || !supabase) {
      return
    }

    try {
      const { error } = await supabase.rpc("expire_user_roles")

      if (error) {
        console.error("Error expiring roles:", error)
      }
    } catch (error) {
      console.error("Error in expireRoles:", error)
    }
  }

  /**
   * Get role display name
   */
  static getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case "admin":
        return "Admin"
      case "super_user":
        return "Super User"
      case "premium":
        return "Premium"
      case "pro":
        return "Pro"
      case "free":
        return "Free"
      default:
        return "Free"
    }
  }

  /**
   * Get role badge color
   */
  static getRoleBadgeColor(role: UserRole): string {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "super_user":
        return "bg-purple-100 text-purple-800"
      case "premium":
        return "bg-yellow-100 text-yellow-800"
      case "pro":
        return "bg-blue-100 text-blue-800"
      case "free":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }
}
