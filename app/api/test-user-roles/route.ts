import { type NextRequest, NextResponse } from "next/server"
import { supabase, isSupabaseReady } from "@/lib/supabase"

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("🔍 Testing user_roles table access...")

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

    // Test 1: Basic table access without any filters
    let basicAccess = false
    let basicError = null
    try {
      const { data: basicData, error: basicErr } = await supabase
        .from("user_roles")
        .select("id")
        .limit(1)

      basicAccess = !basicErr
      basicError = basicErr?.message || basicErr?.code
      console.log("Basic access test:", { success: basicAccess, error: basicError })
    } catch (error) {
      basicError = error instanceof Error ? error.message : "Unknown error"
      console.log("Basic access exception:", basicError)
    }

    // Test 2: Access with user_id filter (what the app actually does)
    let userFilterAccess = false
    let userFilterError = null
    if (user) {
      try {
        const { data: userData, error: userErr } = await supabase
          .from("user_roles")
          .select("role, expires_at, is_active")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single()

        userFilterAccess = !userErr
        userFilterError = userErr?.message || userErr?.code
        console.log("User filter test:", { success: userFilterAccess, error: userFilterError, data: userData })
      } catch (error) {
        userFilterError = error instanceof Error ? error.message : "Unknown error"
        console.log("User filter exception:", userFilterError)
      }
    }

    // Test 3: Check if table exists at all
    let tableExists = false
    let tableError = null
    try {
      const { data: tableData, error: tableErr } = await supabase
        .from("user_roles")
        .select("count", { count: "exact", head: true })

      tableExists = !tableErr
      tableError = tableErr?.message || tableErr?.code
      console.log("Table exists test:", { success: tableExists, error: tableError, count: tableData })
    } catch (error) {
      tableError = error instanceof Error ? error.message : "Unknown error"
      console.log("Table exists exception:", tableError)
    }

    // Test 4: Check RLS policies
    let rlsTest = false
    let rlsError = null
    try {
      // Try to get all roles (this should be blocked by RLS if working correctly)
      const { data: rlsData, error: rlsErr } = await supabase
        .from("user_roles")
        .select("*")

      rlsTest = !rlsErr
      rlsError = rlsErr?.message || rlsErr?.code
      console.log("RLS test:", { success: rlsTest, error: rlsError, dataCount: rlsData?.length })
    } catch (error) {
      rlsError = error instanceof Error ? error.message : "Unknown error"
      console.log("RLS exception:", rlsError)
    }

    return NextResponse.json({
      success: true,
      auth: {
        hasUser: !!user,
        userId: user?.id,
        authError: authError?.message,
      },
      tests: {
        basicAccess: { success: basicAccess, error: basicError },
        userFilterAccess: { success: userFilterAccess, error: userFilterError },
        tableExists: { success: tableExists, error: tableError },
        rlsTest: { success: rlsTest, error: rlsError },
      },
      environment: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        urlStart: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20),
      },
    })
  } catch (error) {
    console.error("Error in test-user-roles:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
} 