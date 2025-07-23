import { type NextRequest, NextResponse } from "next/server"
import { supabase, isSupabaseReady } from "@/lib/supabase"

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("🔍 Testing authentication status...")

    if (!isSupabaseReady || !supabase) {
      return NextResponse.json({
        success: false,
        error: "Supabase not configured",
        isSupabaseReady,
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      })
    }

    // Get user from Supabase auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("User:", user ? user.id : "None", "Auth error:", authError?.message)

    // Check if there are any users in the auth.users table
    let userCount = 0
    let userCountError = null
    try {
      const { count, error } = await supabase
        .from("auth.users")
        .select("*", { count: "exact", head: true })

      userCount = count || 0
      userCountError = error?.message
    } catch (error) {
      userCountError = error instanceof Error ? error.message : "Unknown error"
    }

    // Check if there are any user_roles entries
    let roleCount = 0
    let roleCountError = null
    try {
      const { count, error } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })

      roleCount = count || 0
      roleCountError = error?.message
    } catch (error) {
      roleCountError = error instanceof Error ? error.message : "Unknown error"
    }

    return NextResponse.json({
      success: true,
      auth: {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
        authError: authError?.message,
      },
      database: {
        totalUsers: userCount,
        userCountError,
        totalRoles: roleCount,
        roleCountError,
      },
      environment: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        urlStart: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20),
      },
    })
  } catch (error) {
    console.error("Error in test-auth:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
} 