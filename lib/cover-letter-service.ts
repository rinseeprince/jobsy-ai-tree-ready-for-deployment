import { supabase, isSupabaseReady } from "./supabase"
import type { CoverLetterData } from "./cover-letter-templates"

export type SavedCoverLetter = {
  id: string
  user_id: string
  title: string
  cover_letter_data: CoverLetterData
  template_id: string
  status: "draft" | "ready" | "sent"
  word_count: number
  job_title: string
  company_name: string
  created_at: string
  updated_at: string
}

export class CoverLetterService {
  static async saveCoverLetter(coverLetterData: {
    title: string
    cover_letter_data: CoverLetterData
    template_id: string
    status?: "draft" | "ready" | "sent"
  }): Promise<SavedCoverLetter> {
    console.log("📝 Attempting to save cover letter:", {
      isSupabaseReady,
      title: coverLetterData.title,
      templateId: coverLetterData.template_id,
    })

    if (!isSupabaseReady) {
      console.error("❌ Cannot save cover letter: Supabase not configured")
      throw new Error("Supabase not configured")
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.error("❌ Cannot save cover letter: User not authenticated")
        throw new Error("User not authenticated")
      }

      // Calculate word count
      const wordCount = this.calculateWordCount(coverLetterData.cover_letter_data)

      const insertData = {
        user_id: user.id,
        title: coverLetterData.title,
        cover_letter_data: coverLetterData.cover_letter_data,
        template_id: coverLetterData.template_id,
        status: coverLetterData.status || "draft",
        word_count: wordCount,
        job_title: coverLetterData.cover_letter_data.jobInfo.jobTitle,
        company_name: coverLetterData.cover_letter_data.jobInfo.companyName,
      }

      console.log("💾 Inserting cover letter to Supabase:", {
        user_id: insertData.user_id,
        title: insertData.title,
        template_id: insertData.template_id,
        status: insertData.status,
        word_count: insertData.word_count,
        job_title: insertData.job_title,
        company_name: insertData.company_name,
      })

      const { data, error } = await supabase.from("saved_cover_letters").insert(insertData).select().single()

      if (error) {
        console.error("❌ Supabase insert error:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log("✅ Cover letter saved successfully:", data)
      return data as SavedCoverLetter
    } catch (error) {
      console.error("❌ Error in saveCoverLetter:", error)
      throw error
    }
  }

  static async updateCoverLetter(
    coverLetterId: string,
    coverLetterData: {
      title?: string
      cover_letter_data?: CoverLetterData
      template_id?: string
      status?: "draft" | "ready" | "sent"
    },
  ): Promise<SavedCoverLetter> {
    console.log("📝 Updating cover letter:", coverLetterId, coverLetterData)

    if (!isSupabaseReady) {
      throw new Error("Supabase not configured")
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      const updateData: Record<string, unknown> = {
        ...coverLetterData,
        updated_at: new Date().toISOString(),
      }

      // Calculate word count if cover_letter_data is provided
      if (coverLetterData.cover_letter_data) {
        updateData.word_count = this.calculateWordCount(coverLetterData.cover_letter_data)
        updateData.job_title = coverLetterData.cover_letter_data.jobInfo.jobTitle
        updateData.company_name = coverLetterData.cover_letter_data.jobInfo.companyName
      }

      const { data, error } = await supabase
        .from("saved_cover_letters")
        .update(updateData)
        .eq("id", coverLetterId)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        console.error("❌ Supabase update error:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log("✅ Cover letter updated successfully:", data)
      return data as SavedCoverLetter
    } catch (error) {
      console.error("❌ Error in updateCoverLetter:", error)
      throw error
    }
  }

  static async getUserSavedCoverLetters(): Promise<SavedCoverLetter[]> {
    console.log("🔍 Getting user saved cover letters...")

    if (!isSupabaseReady) {
      console.log("⚠️ Supabase not ready, returning empty array")
      return []
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log("❌ No user found, returning empty array")
      return []
    }

    const { data, error } = await supabase
      .from("saved_cover_letters")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("❌ Error fetching saved cover letters:", error)
      return []
    }

    console.log("✅ Successfully fetched saved cover letters:", data?.length || 0)
    return (data || []) as SavedCoverLetter[]
  }

  static async getSavedCoverLetter(coverLetterId: string): Promise<SavedCoverLetter | null> {
    console.log("🔍 Getting saved cover letter by ID:", coverLetterId)

    if (!isSupabaseReady) {
      return null
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const { data, error } = await supabase
      .from("saved_cover_letters")
      .select("*")
      .eq("id", coverLetterId)
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.error("❌ Error fetching saved cover letter:", error)
      return null
    }

    return data as SavedCoverLetter
  }

  static async deleteSavedCoverLetter(coverLetterId: string): Promise<boolean> {
    console.log("🗑️ Deleting saved cover letter:", coverLetterId)

    if (!isSupabaseReady) {
      return false
    }

    try {
      const { error } = await supabase.from("saved_cover_letters").delete().eq("id", coverLetterId)

      if (error) {
        console.error("❌ Supabase delete error:", error)
        return false
      }

      console.log("✅ Saved cover letter deleted successfully")
      return true
    } catch (error) {
      console.error("❌ Error in deleteSavedCoverLetter:", error)
      return false
    }
  }

  static async duplicateSavedCoverLetter(coverLetterId: string, newTitle?: string): Promise<SavedCoverLetter> {
    console.log("📋 Duplicating saved cover letter:", coverLetterId)

    const originalCoverLetter = await this.getSavedCoverLetter(coverLetterId)
    if (!originalCoverLetter) {
      throw new Error("Cover letter not found")
    }

    const duplicateData = {
      title: newTitle || `${originalCoverLetter.title} (Copy)`,
      cover_letter_data: originalCoverLetter.cover_letter_data,
      template_id: originalCoverLetter.template_id,
      status: "draft" as const,
    }

    return this.saveCoverLetter(duplicateData)
  }

  private static calculateWordCount(coverLetterData: CoverLetterData): number {
    let wordCount = 0

    // Count words in content sections
    if (coverLetterData.content.opening) {
      wordCount += this.countWords(coverLetterData.content.opening)
    }
    if (coverLetterData.content.body) {
      wordCount += this.countWords(coverLetterData.content.body)
    }
    if (coverLetterData.content.closing) {
      wordCount += this.countWords(coverLetterData.content.closing)
    }

    return wordCount
  }

  private static countWords(text: string): number {
    if (!text) return 0
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length
  }
}
