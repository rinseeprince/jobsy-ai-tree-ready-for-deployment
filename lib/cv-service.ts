import { supabase, isSupabaseReady } from "./supabase"

// Helper function to ensure supabase client is available
const getSupabaseClient = () => {
  if (!isSupabaseReady || !supabase) {
    throw new Error("Supabase not configured")
  }
  return supabase
}

export interface CV {
  id: string
  user_id: string
  title: string
  file_name: string
  file_size: number
  parsed_content: string
  raw_text?: string
  created_at: string
  updated_at: string
}

export class CVService {
  static async saveCV(cvData: {
    title: string
    file_name: string
    file_size: number
    parsed_content: string
    raw_text?: string
  }): Promise<CV> {
    console.log("📝 Attempting to save CV:", {
      isSupabaseReady,
      title: cvData.title,
      fileName: cvData.file_name,
    })

    if (!isSupabaseReady) {
      console.error("❌ Cannot save CV: Supabase not configured")
      throw new Error("Supabase not configured")
    }

    try {
      const supabaseClient = getSupabaseClient()
      const {
        data: { user },
      } = await supabaseClient.auth.getUser()

      console.log("👤 User check:", { hasUser: !!user, userId: user?.id })

      if (!user) {
        console.error("❌ Cannot save CV: User not authenticated")
        throw new Error("User not authenticated")
      }

      // Ensure we have a proper title - use filename if title is empty
      const finalTitle = cvData.title.trim() || cvData.file_name.replace(/\.[^/.]+$/, "")

      // Prepare the data to insert
      const insertData = {
        user_id: user.id,
        title: finalTitle,
        file_name: cvData.file_name,
        file_size: cvData.file_size,
        parsed_content: cvData.parsed_content,
        raw_text: cvData.raw_text || null,
      }

      console.log("💾 Inserting CV to Supabase with data:", {
        user_id: insertData.user_id,
        title: insertData.title,
        file_name: insertData.file_name,
        file_size: insertData.file_size,
        // Truncate long fields for logging
        parsed_content: `${insertData.parsed_content.substring(0, 100)}...`,
      })

      const { data, error } = await supabaseClient.from("cvs").insert(insertData).select().single()

      if (error) {
        console.error("❌ Supabase insert error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error,
        })
        throw new Error(`Database error: ${error.message}`)
      }

      console.log("✅ CV saved successfully:", data)
      // Fix the type conversion issue by explicitly mapping the fields
      return {
        id: data.id,
        user_id: data.user_id,
        title: data.title,
        file_name: data.file_name,
        file_size: data.file_size,
        parsed_content: data.parsed_content,
        raw_text: data.raw_text,
        created_at: data.created_at,
        updated_at: data.updated_at,
      } as CV
    } catch (error) {
      console.error("❌ Error in saveCV:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error,
      })
      throw error
    }
  }

  static async getUserCVs(): Promise<CV[]> {
    console.log("🔍 Getting user CVs...")

    if (!isSupabaseReady) {
      console.log("⚠️ Supabase not ready, returning empty array")
      return []
    }

    const supabaseClient = getSupabaseClient()
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    console.log("👤 User for CVs:", { hasUser: !!user, userId: user?.id })

    if (!user) {
      console.log("❌ No user found, returning empty array")
      return []
    }

    const { data, error } = await supabaseClient
      .from("cvs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error fetching CVs:", error)
      return []
    }

    console.log("✅ Successfully fetched CVs:", data?.map((cv) => ({ id: cv.id, title: cv.title })) || [])
    // Fix the type conversion by mapping each item
    return (data || []).map((item) => ({
      id: item.id,
      user_id: item.user_id,
      title: item.title,
      file_name: item.file_name,
      file_size: item.file_size,
      parsed_content: item.parsed_content,
      raw_text: item.raw_text,
      created_at: item.created_at,
      updated_at: item.updated_at,
    })) as CV[]
  }

  static async getCV(id: string): Promise<CV | null> {
    console.log("🔍 Getting CV by ID:", id)

    if (!isSupabaseReady) {
      console.log("⚠️ Supabase not ready, returning null")
      return null
    }

    const supabaseClient = getSupabaseClient()
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      console.log("❌ No user found, returning null")
      return null
    }

    const { data, error } = await supabaseClient.from("cvs").select("*").eq("id", id).eq("user_id", user.id).single()

    if (error) {
      console.error("❌ Error fetching CV:", error)
      return null
    }

    // Fix the type conversion issue
    return data
      ? ({
          id: data.id,
          user_id: data.user_id,
          title: data.title,
          file_name: data.file_name,
          file_size: data.file_size,
          parsed_content: data.parsed_content,
          raw_text: data.raw_text,
          created_at: data.created_at,
          updated_at: data.updated_at,
        } as CV)
      : null
  }

  static async deleteCV(id: string): Promise<boolean> {
    console.log("🗑️ Deleting CV:", id)

    if (!isSupabaseReady) {
      console.error("❌ Cannot delete CV: Supabase not configured")
      return false
    }

    try {
      const supabaseClient = getSupabaseClient()
      const { error } = await supabaseClient.from("cvs").delete().eq("id", id)

      if (error) {
        console.error("❌ Supabase delete error:", error)
        return false
      }

      console.log("✅ CV deleted successfully")
      return true
    } catch (error) {
      console.error("❌ Error in deleteCV:", error)
      return false
    }
  }

  static async updateCV(
    id: string,
    updates: Partial<Omit<CV, "id" | "user_id" | "created_at" | "updated_at">>,
  ): Promise<CV | null> {
    console.log("📝 Updating CV:", id, updates)

    if (!isSupabaseReady) {
      console.error("❌ Cannot update CV: Supabase not configured")
      return null
    }

    try {
      const supabaseClient = getSupabaseClient()
      const {
        data: { user },
      } = await supabaseClient.auth.getUser()

      if (!user) {
        console.error("❌ Cannot update CV: User not authenticated")
        return null
      }

      const { data, error } = await supabaseClient
        .from("cvs")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        console.error("❌ Supabase update error:", error)
        return null
      }

      console.log("✅ CV updated successfully:", data)
      return {
        id: data.id,
        user_id: data.user_id,
        title: data.title,
        file_name: data.file_name,
        file_size: data.file_size,
        parsed_content: data.parsed_content,
        raw_text: data.raw_text,
        created_at: data.created_at,
        updated_at: data.updated_at,
      } as CV
    } catch (error) {
      console.error("❌ Error in updateCV:", error)
      return null
    }
  }

  static async duplicateCV(id: string, newTitle?: string): Promise<CV | null> {
    console.log("📋 Duplicating CV:", id)

    try {
      const originalCV = await this.getCV(id)
      if (!originalCV) {
        throw new Error("CV not found")
      }

      const duplicateTitle = newTitle || `${originalCV.title} (Copy)`

      return await this.saveCV({
        title: duplicateTitle,
        file_name: originalCV.file_name,
        file_size: originalCV.file_size,
        parsed_content: originalCV.parsed_content,
        raw_text: originalCV.raw_text,
      })
    } catch (error) {
      console.error("❌ Error duplicating CV:", error)
      return null
    }
  }

  static async searchCVs(query: string): Promise<CV[]> {
    console.log("🔍 Searching CVs with query:", query)

    if (!isSupabaseReady) {
      console.log("⚠️ Supabase not ready, returning empty array")
      return []
    }

    const supabaseClient = getSupabaseClient()
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      console.log("❌ No user found, returning empty array")
      return []
    }

    // Use proper Supabase filter syntax for OR conditions
    const { data, error } = await supabaseClient
      .from("cvs")
      .select("*")
      .eq("user_id", user.id)
      .or(`title.ilike.%${query}%,parsed_content.ilike.%${query}%`)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("❌ Error searching CVs:", error)
      console.error("❌ Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      return []
    }

    return (data || []).map((item) => ({
      id: item.id,
      user_id: item.user_id,
      title: item.title,
      file_name: item.file_name,
      file_size: item.file_size,
      parsed_content: item.parsed_content,
      raw_text: item.raw_text,
      created_at: item.created_at,
      updated_at: item.updated_at,
    })) as CV[]
  }

  static async getCVStats(): Promise<{
    total: number
    thisMonth: number
    averageSize: number
  }> {
    console.log("📊 Getting CV stats...")

    if (!isSupabaseReady) {
      return { total: 0, thisMonth: 0, averageSize: 0 }
    }

    const supabaseClient = getSupabaseClient()
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return { total: 0, thisMonth: 0, averageSize: 0 }
    }

    const { data, error } = await supabaseClient.from("cvs").select("file_size, created_at").eq("user_id", user.id)

    if (error || !data) {
      console.error("❌ Error fetching CV stats:", error)
      return { total: 0, thisMonth: 0, averageSize: 0 }
    }

    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const thisMonth = data.filter((cv) => {
      if (!cv.created_at) return false
      try {
        const createdAt = new Date(cv.created_at as string)
        return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear
      } catch {
        return false
      }
    }).length

    const totalSize = data.reduce((sum, cv) => {
      const fileSize = typeof cv.file_size === "number" ? cv.file_size : 0
      return sum + fileSize
    }, 0)

    const averageSize = data.length > 0 ? Math.round(totalSize / data.length) : 0

    return {
      total: data.length,
      thisMonth,
      averageSize,
    }
  }
}
