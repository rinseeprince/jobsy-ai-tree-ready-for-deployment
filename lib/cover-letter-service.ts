import { supabase, isSupabaseReady } from "./supabase"
import type { CoverLetterData } from "./cover-letter-templates"

// SavedCoverLetter type definition
export interface SavedCoverLetter {
  id: string
  user_id: string
  title: string
  cover_letter_data: CoverLetterData
  template_id: string
  status: "draft" | "ready" | "sent"
  word_count: number
  created_at: string
  updated_at: string
}

// Save cover letter function
export async function saveCoverLetter(data: {
  title: string
  cover_letter_data: CoverLetterData
  template_id: string
  status: "draft" | "ready" | "sent"
}): Promise<SavedCoverLetter> {
  console.log("💾 Starting saveCoverLetter function...")
  console.log("📋 Input data:", {
    title: data.title,
    template_id: data.template_id,
    status: data.status,
    cover_letter_data_keys: Object.keys(data.cover_letter_data)
  })

  if (!isSupabaseReady) {
    console.error("❌ Supabase not ready")
    throw new Error("Supabase not ready")
  }

  console.log("🔐 Getting user authentication...")
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error("❌ User not authenticated")
    throw new Error("User not authenticated")
  }

  console.log("✅ User authenticated:", { userId: user.id })

  // Calculate word count
  const wordCount = 
    (data.cover_letter_data.content.opening?.split(/\s+/).length || 0) +
    (data.cover_letter_data.content.body?.split(/\s+/).length || 0) +
    (data.cover_letter_data.content.closing?.split(/\s+/).length || 0)

  console.log("📊 Calculated word count:", wordCount)

  const coverLetterData = {
    user_id: user.id,
    title: data.title,
    cover_letter_data: data.cover_letter_data,
    template_id: data.template_id,
    status: data.status,
    word_count: wordCount,
  }

  console.log("💾 Inserting into database with data:", {
    user_id: coverLetterData.user_id,
    title: coverLetterData.title,
    template_id: coverLetterData.template_id,
    status: coverLetterData.status,
    word_count: coverLetterData.word_count,
  })

  const { data: savedData, error } = await supabase
    .from("saved_cover_letters")
    .insert(coverLetterData)
    .select()
    .single()

  if (error) {
    console.error("❌ Database error saving cover letter:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      fullError: error,
    })
    throw new Error(`Failed to save cover letter: ${error.message}`)
  }

  console.log("✅ Cover letter saved successfully to database:", {
    id: savedData.id,
    title: savedData.title,
    status: savedData.status,
    created_at: savedData.created_at
  })
  
  return savedData as unknown as SavedCoverLetter
}

export async function getUserSavedCoverLetters(): Promise<SavedCoverLetter[]> {
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
  return (data || []) as unknown as SavedCoverLetter[]
}

export async function getSavedCoverLetter(coverLetterId: string): Promise<SavedCoverLetter | null> {
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

  return data as unknown as SavedCoverLetter
}

export async function deleteSavedCoverLetter(coverLetterId: string): Promise<boolean> {
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

export async function duplicateSavedCoverLetter(coverLetterId: string, newTitle?: string): Promise<SavedCoverLetter> {
  console.log("📋 Duplicating saved cover letter:", coverLetterId)

  const originalCoverLetter = await getSavedCoverLetter(coverLetterId)
  if (!originalCoverLetter) {
    throw new Error("Cover letter not found")
  }

  const duplicateData = {
    title: newTitle || `${originalCoverLetter.title} (Copy)`,
    cover_letter_data: originalCoverLetter.cover_letter_data,
    template_id: originalCoverLetter.template_id,
    status: "draft" as const,
  }

  return saveCoverLetter(duplicateData)
}
