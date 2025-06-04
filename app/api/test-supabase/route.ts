import { NextResponse } from "next/server"
import { supabase, isSupabaseReady } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🔍 Testing Supabase connection...")

    if (!isSupabaseReady) {
      return NextResponse.json({
        success: false,
        error: "Supabase not configured",
        isSupabaseReady: false,
      })
    }

    // Test basic connection
    const { data: authData, error: authError } = await supabase.auth.getUser()

    // Test database connection by trying to select from applications table
    const { data: tableData, error: tableError } = await supabase.from("applications").select("count").limit(1)

    return NextResponse.json({
      success: true,
      isSupabaseReady,
      auth: {
        hasUser: !!authData.user,
        userEmail: authData.user?.email,
        authError: authError?.message,
      },
      database: {
        canAccessTable: !tableError,
        tableError: tableError?.message,
        tableErrorDetails: tableError,
      },
      environment: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        urlStart: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20),
      },
    })
  } catch (error) {
    console.error("❌ Supabase test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      fullError: error,
    })
  }
}
