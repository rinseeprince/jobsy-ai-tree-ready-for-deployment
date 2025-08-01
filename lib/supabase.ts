import { createClient } from "@supabase/supabase-js"
import type { CVData } from "./cv-templates"

// Re-export CVData for use in other modules
export type { CVData } from "./cv-templates"

export type Application = {
  id: string
  user_id: string
  job_title: string
  company_name: string
  job_posting: string
  cv_content: string
  cover_letter: string
  cv_recommendations: string
  status:
    | "applied"
    | "phone_screen"
    | "first_interview"
    | "second_interview"
    | "third_interview"
    | "final_interview"
    | "offer"
    | "accepted"
    | "rejected"
    | "withdrawn"
    | "ghosted"
  applied_date: string | null
  interview_date?: string | null
  notes?: string | null
  job_url?: string | null
  salary_range?: string | null
  location?: string | null
  remote?: boolean | null
  created_at: string
  updated_at: string
}

export type SavedCV = {
  id: string
  user_id: string
  title: string
  cv_data: CVData
  template_id: string
  status: "draft" | "ready" | "sent"
  word_count: number
  created_at: string
  updated_at: string
}

export type SavedCoverLetter = {
  id: string
  user_id: string
  title: string
  content: string
  job_title?: string
  company_name?: string
  template_id?: string
  status: "draft" | "ready" | "sent"
  word_count: number
  created_at: string
  updated_at: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Fix the return type issue by ensuring proper boolean return
const isSupabaseConfigured = (): boolean => {
  console.log("🔍 DETAILED SUPABASE DEBUG:")
  console.log("Raw environment variables:")
  console.log("- NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl)
  console.log("- NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey)
  console.log("- URL exists:", !!supabaseUrl)
  console.log("- URL is string:", typeof supabaseUrl === "string")
  console.log("- URL starts with http:", Boolean(supabaseUrl?.startsWith("http")))
  console.log("- URL is not placeholder:", supabaseUrl !== "your_supabase_project_url")
  console.log("- Key exists:", !!supabaseAnonKey)
  console.log("- Key is string:", typeof supabaseAnonKey === "string")
  console.log("- Key length > 10:", (supabaseAnonKey?.length || 0) > 10)
  console.log("- Key is not placeholder:", supabaseAnonKey !== "your_supabase_anon_key")

  // Additional validation for URL format
  if (supabaseUrl && typeof supabaseUrl === "string") {
    try {
      const url = new URL(supabaseUrl)
      console.log("- URL is valid:", true)
      console.log("- URL protocol:", url.protocol)
      console.log("- URL hostname:", url.hostname)
      console.log("- URL pathname:", url.pathname)
    } catch (error) {
      console.log("- URL is valid:", false)
      console.log("- URL validation error:", error)
    }
  }

  const isConfigured = Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl !== "your_supabase_project_url" &&
      supabaseAnonKey !== "your_supabase_anon_key" &&
      supabaseUrl.startsWith("http"),
  )

  console.log("Final isSupabaseReady result:", isConfigured)
  return isConfigured
}

// Export the configuration check result
export const isSupabaseReady = isSupabaseConfigured()

// Create the Supabase client using the modern approach
const createSupabaseClient = () => {
  if (!isSupabaseReady) {
    console.warn("⚠️ Supabase environment variables not configured or invalid.")
    return null
  }

  try {
    console.log("✅ Creating Supabase client with valid configuration")
    // Ensure URL is properly formatted and doesn't have trailing slashes
    const cleanUrl = supabaseUrl!.replace(/\/$/, '')
    return createClient(cleanUrl, supabaseAnonKey!)
  } catch (error) {
    console.error("❌ Failed to create Supabase client:", error)
    return null
  }
}

export const supabase = createSupabaseClient()

// Helper function to ensure supabase client is available
const getSupabaseClient = () => {
  if (!isSupabaseReady || !supabase) {
    throw new Error("Supabase not configured")
  }
  return supabase
}

// Log the configuration status
console.log("🔧 Supabase Configuration Status:", {
  isSupabaseReady,
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlValid: supabaseUrl?.startsWith("http"),
})

// Type for application stats data
type ApplicationStatsData = {
  status: string
  created_at: string
}

// Applications service functions
export class ApplicationsService {
  static async saveApplication(applicationData: {
    job_title: string
    company_name: string
    job_posting: string
    cv_content: string
    cover_letter: string
    cv_recommendations: string
    location?: string
    salary_range?: string
    job_url?: string
  }): Promise<Application> {
    console.log("📝 Attempting to save application:", {
      isSupabaseReady,
      jobTitle: applicationData.job_title,
      companyName: applicationData.company_name,
    })

    if (!isSupabaseReady || !supabase) {
      console.error("❌ Cannot save application: Supabase not configured")
      throw new Error("Supabase not configured")
    }

    try {
      const supabaseClient = getSupabaseClient()
      const {
        data: { user },
      } = await supabaseClient.auth.getUser()

      console.log("👤 User check:", { hasUser: !!user, userId: user?.id })

      if (!user) {
        console.error("❌ Cannot save application: User not authenticated")
        throw new Error("User not authenticated")
      }

      // Prepare the data to insert
      const insertData = {
        user_id: user.id,
        job_title: applicationData.job_title,
        company_name: applicationData.company_name,
        job_posting: applicationData.job_posting,
        cv_content: applicationData.cv_content,
        cover_letter: applicationData.cover_letter,
        cv_recommendations: applicationData.cv_recommendations,
        location: applicationData.location || null,
        salary_range: applicationData.salary_range || null,
        job_url: applicationData.job_url || null,
        status: "applied" as const,
        applied_date: new Date().toISOString().substring(0, 10), // More reliable YYYY-MM-DD format
      }

      console.log("💾 Inserting application to Supabase with data:", {
        user_id: insertData.user_id,
        job_title: insertData.job_title,
        company_name: insertData.company_name,
        applied_date: insertData.applied_date,
        status: insertData.status,
        location: insertData.location,
        salary_range: insertData.salary_range,
        job_url: insertData.job_url,
        // Truncate long fields for logging
        job_posting: `${insertData.job_posting.substring(0, 100)}...`,
        cv_content: `${insertData.cv_content.substring(0, 100)}...`,
        cover_letter: `${insertData.cover_letter.substring(0, 100)}...`,
        cv_recommendations: `${insertData.cv_recommendations.substring(0, 100)}...`,
      })

      // Validate required fields before insert
      if (!insertData.applied_date) {
        console.error("❌ applied_date is null or undefined:", insertData.applied_date)
        throw new Error("Applied date is required but is null")
      }

      const { data, error } = await supabaseClient.from("applications").insert(insertData).select().single()

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

      console.log("✅ Application saved successfully:", data)
      return data as Application
    } catch (error) {
      console.error("❌ Error in saveApplication:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error,
      })
      throw error
    }
  }

  static async getUserApplications(): Promise<Application[]> {
    console.log("🔍 Getting user applications...")

    if (!isSupabaseReady || !supabase) {
      console.log("⚠️ Supabase not ready, returning empty array")
      return []
    }

    const supabaseClient = getSupabaseClient()
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    console.log("👤 User for applications:", { hasUser: !!user, userId: user?.id })

    if (!user) {
      console.log("❌ No user found, returning empty array")
      return []
    }

    const { data, error } = await supabaseClient
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error fetching applications:", error)
      return []
    }

    console.log("✅ Successfully fetched applications:", data?.length || 0)
    return (data || []) as Application[]
  }

  static async getApplicationStats(): Promise<{
    total: number
    thisMonth: number
    byStatus: Record<string, number>
    interviewRate: number
  }> {
    if (!isSupabaseReady || !supabase) {
      return {
        total: 0,
        thisMonth: 0,
        byStatus: {},
        interviewRate: 0,
      }
    }

    const supabaseClient = getSupabaseClient()
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()
    if (!user) {
      return {
        total: 0,
        thisMonth: 0,
        byStatus: {},
        interviewRate: 0,
      }
    }

    const { data, error } = await supabaseClient.from("applications").select("status, created_at").eq("user_id", user.id)

    if (error || !data) {
      console.error("❌ Error fetching application stats:", error)
      if (error) {
        console.error("❌ Error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
      }
      return {
        total: 0,
        thisMonth: 0,
        byStatus: {},
        interviewRate: 0,
      }
    }

    // Type assertion to ensure proper typing
    const typedData = data as ApplicationStatsData[]

    const now = new Date()
    const thisMonth = typedData.filter((app) => {
      const createdAt = new Date(app.created_at)
      return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
    }).length

    const byStatus = typedData.reduce((acc: Record<string, number>, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {})

    const interviewCount = byStatus.interview || 0
    const interviewRate = typedData.length > 0 ? Math.round((interviewCount / typedData.length) * 100) : 0

    return {
      total: typedData.length,
      thisMonth,
      byStatus,
      interviewRate,
    }
  }

  static extractJobDetails(jobPosting: string): {
    job_title: string
    company_name: string
    location: string
    salary_range: string
  } {
    // Simple extraction logic - you can make this more sophisticated
    const lines = jobPosting.split("\n").filter((line) => line.trim())

    let job_title = ""
    let company_name = ""
    let location = ""
    let salary_range = ""

    // Try to extract job title (usually in first few lines)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim()
      if (line && !job_title && line.length < 100) {
        job_title = line
        break
      }
    }

    // Try to extract company name
    const companyKeywords = ["company", "corp", "inc", "ltd", "llc", "technologies", "tech"]
    for (const line of lines) {
      const lowerLine = line.toLowerCase()
      if (companyKeywords.some((keyword) => lowerLine.includes(keyword)) && line.length < 50) {
        company_name = line.trim()
        break
      }
    }

    // Try to extract location
    const locationKeywords = ["location", "based", "office", "remote", "hybrid"]
    for (const line of lines) {
      const lowerLine = line.toLowerCase()
      if (locationKeywords.some((keyword) => lowerLine.includes(keyword))) {
        const match = line.match(/([A-Za-z\s]+,\s*[A-Z]{2}|Remote|Hybrid)/i)
        if (match) {
          location = match[0]
          break
        }
      }
    }

    // Try to extract salary
    const salaryMatch = jobPosting.match(/\$[\d,]+(?:\s*-\s*\$?[\d,]+)?(?:\s*(?:per year|annually|\/year))?/i)
    if (salaryMatch) {
      salary_range = salaryMatch[0]
    }

    return {
      job_title: job_title || "Untitled Position",
      company_name: company_name || "Unknown Company",
      location: location || "",
      salary_range: salary_range || "",
    }
  }

  static async updateApplication(
    applicationId: string,
    data: {
      job_title?: string
      company_name?: string
      location?: string | null
      salary_range?: string | null
      job_url?: string | null
      notes?: string | null
      interview_date?: string | null
    },
  ): Promise<void> {
    console.log("📝 Updating application:", applicationId, data)

    if (!isSupabaseReady || !supabase) {
      console.error("❌ Cannot update application: Supabase not configured")
      throw new Error("Supabase not configured")
    }

    try {
      const { error } = await supabase
        .from("applications")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId)

      if (error) {
        console.error("❌ Supabase update error:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log("✅ Application updated successfully")
    } catch (error) {
      console.error("❌ Error in updateApplication:", error)
      throw error
    }
  }

  static async updateApplicationStatus(
    applicationId: string,
    status: Application["status"],
    interviewDate?: string | null,
    notes?: string | null,
  ): Promise<void> {
    console.log("🔄 Updating application status:", { applicationId, status, interviewDate })

    if (!isSupabaseReady || !supabase) {
      console.error("❌ Cannot update application status: Supabase not configured")
      throw new Error("Supabase not configured")
    }

    try {
      const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (interviewDate !== undefined) {
        updateData.interview_date = interviewDate
      }

      if (notes !== undefined) {
        updateData.notes = notes
      }

      const supabaseClient = getSupabaseClient()
      const { error } = await supabaseClient.from("applications").update(updateData).eq("id", applicationId)

      if (error) {
        console.error("❌ Supabase status update error:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log("✅ Application status updated successfully")
    } catch (error) {
      console.error("❌ Error in updateApplicationStatus:", error)
      throw error
    }
  }

  static async deleteApplication(applicationId: string): Promise<void> {
    console.log("🗑️ Deleting application:", applicationId)

    if (!isSupabaseReady || !supabase) {
      console.error("❌ Cannot delete application: Supabase not configured")
      throw new Error("Supabase not configured")
    }

    try {
      const supabaseClient = getSupabaseClient()
      const { error } = await supabaseClient.from("applications").delete().eq("id", applicationId)

      if (error) {
        console.error("❌ Supabase delete error:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log("✅ Application deleted successfully")
    } catch (error) {
      console.error("❌ Error in deleteApplication:", error)
      throw error
    }
  }

  static async getUserProfile(): Promise<{ full_name?: string } | null> {
    if (!isSupabaseReady || !supabase) {
      return null
    }

    try {
      const supabaseClient = getSupabaseClient()
      const {
        data: { user },
      } = await supabaseClient.auth.getUser()

      if (!user) {
        return null
      }

      // Get user metadata which might contain the full name
      const metadata = user.user_metadata

      return {
        full_name: metadata?.full_name || metadata?.name || null,
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  }

  // CV Management Functions
  static async saveCVData(cvData: {
    title: string
    cv_data: CVData
    template_id: string
    status?: "draft" | "ready" | "sent"
  }): Promise<SavedCV> {
    console.log("📝 Attempting to save CV:", {
      isSupabaseReady,
      title: cvData.title,
      templateId: cvData.template_id,
    })

    if (!isSupabaseReady || !supabase) {
      console.error("❌ Cannot save CV: Supabase not configured")
      throw new Error("Supabase not configured")
    }

    try {
      const supabaseClient = getSupabaseClient()
      const {
        data: { user },
      } = await supabaseClient.auth.getUser()

      if (!user) {
        console.error("❌ Cannot save CV: User not authenticated")
        throw new Error("User not authenticated")
      }

      // Calculate word count
      const wordCount = this.calculateWordCount(cvData.cv_data)

      const insertData = {
        user_id: user.id,
        title: cvData.title,
        cv_data: cvData.cv_data,
        template_id: cvData.template_id,
        status: cvData.status || "draft",
        word_count: wordCount,
      }

      console.log("💾 Inserting CV to Supabase:", {
        user_id: insertData.user_id,
        title: insertData.title,
        template_id: insertData.template_id,
        status: insertData.status,
        word_count: insertData.word_count,
      })

      const { data, error } = await supabaseClient.from("saved_cvs").insert(insertData).select().single()

      if (error) {
        console.error("❌ Supabase insert error:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log("✅ CV saved successfully:", data)
      return data as SavedCV
    } catch (error) {
      console.error("❌ Error in saveCVData:", error)
      throw error
    }
  }

  static async updateCVData(
    cvId: string,
    cvData: {
      title?: string
      cv_data?: CVData
      template_id?: string
      status?: "draft" | "ready" | "sent"
    },
  ): Promise<SavedCV> {
    console.log("📝 Updating CV:", cvId, cvData)

    if (!isSupabaseReady || !supabase) {
      throw new Error("Supabase not configured")
    }

    try {
      const updateData: Record<string, unknown> = {
        ...cvData,
        updated_at: new Date().toISOString(),
      }

      // Calculate word count if cv_data is provided
      if (cvData.cv_data) {
        updateData.word_count = this.calculateWordCount(cvData.cv_data)
      }

      const supabaseClient = getSupabaseClient()
      const { data, error } = await supabaseClient.from("saved_cvs").update(updateData).eq("id", cvId).select().single()

      if (error) {
        console.error("❌ Supabase update error:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log("✅ CV updated successfully:", data)
      return data as SavedCV
    } catch (error) {
      console.error("❌ Error in updateCVData:", error)
      throw error
    }
  }

  static async getUserSavedCVs(): Promise<SavedCV[]> {
    console.log("🔍 Getting user saved CVs...")

    if (!isSupabaseReady || !supabase) {
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

    const { data, error } = await supabaseClient
      .from("saved_cvs")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("❌ Error fetching saved CVs:", error)
      return []
    }

    console.log("✅ Successfully fetched saved CVs:", data?.length || 0)
    return (data || []) as SavedCV[]
  }

  static async getSavedCV(cvId: string): Promise<SavedCV | null> {
    console.log("🔍 Getting saved CV by ID:", cvId)

    if (!isSupabaseReady || !supabase) {
      return null
    }

    const supabaseClient = getSupabaseClient()
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return null
    }

    const { data, error } = await supabaseClient.from("saved_cvs").select("*").eq("id", cvId).eq("user_id", user.id).single()

    if (error) {
      console.error("❌ Error fetching saved CV:", error)
      return null
    }

    return data as SavedCV
  }

  static async deleteSavedCV(cvId: string): Promise<boolean> {
    console.log("🗑️ Deleting saved CV:", cvId)

    if (!isSupabaseReady || !supabase) {
      return false
    }

    try {
      const supabaseClient = getSupabaseClient()
      const { error } = await supabaseClient.from("saved_cvs").delete().eq("id", cvId)

      if (error) {
        console.error("❌ Supabase delete error:", error)
        return false
      }

      console.log("✅ Saved CV deleted successfully")
      return true
    } catch (error) {
      console.error("❌ Error in deleteSavedCV:", error)
      return false
    }
  }

  static async duplicateSavedCV(cvId: string, newTitle?: string): Promise<SavedCV> {
    console.log("📋 Duplicating saved CV:", cvId)

    const originalCV = await this.getSavedCV(cvId)
    if (!originalCV) {
      throw new Error("CV not found")
    }

    const duplicateData = {
      title: newTitle || `${originalCV.title} (Copy)`,
      cv_data: originalCV.cv_data,
      template_id: originalCV.template_id,
      status: "draft" as const,
    }

    return this.saveCVData(duplicateData)
  }

  // Add the missing updateSavedCV method
  static async updateSavedCV(
    cvId: string,
    cvData: {
      title?: string
      cv_data?: CVData
      template_id?: string
      status?: "draft" | "ready" | "sent"
    },
  ): Promise<SavedCV> {
    console.log("📝 Updating saved CV:", cvId, cvData)

    if (!isSupabaseReady || !supabase) {
      console.error("❌ Cannot update CV: Supabase not configured")
      throw new Error("Supabase not configured")
    }

    try {
      const supabaseClient = getSupabaseClient()
      const {
        data: { user },
      } = await supabaseClient.auth.getUser()

      if (!user) {
        console.error("❌ Cannot update CV: User not authenticated")
        throw new Error("User not authenticated")
      }

      const updateData: Record<string, unknown> = {
        ...cvData,
        updated_at: new Date().toISOString(),
      }

      // Calculate word count if cv_data is provided
      if (cvData.cv_data) {
        updateData.word_count = this.calculateWordCount(cvData.cv_data)
      }

      const { data, error } = await supabaseClient
        .from("saved_cvs")
        .update(updateData)
        .eq("id", cvId)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) {
        console.error("❌ Supabase update error:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log("✅ CV updated successfully:", data)
      return data as SavedCV
    } catch (error) {
      console.error("❌ Error in updateSavedCV:", error)
      throw error
    }
  }

  // Cover Letter Management Functions
  static async saveCoverLetter(coverLetterData: {
    title: string
    content: string
    job_title?: string
    company_name?: string
    template_id?: string
    status?: "draft" | "ready" | "sent"
  }): Promise<SavedCoverLetter> {
    console.log("📝 Attempting to save cover letter:", {
      isSupabaseReady,
      title: coverLetterData.title,
    })

    if (!isSupabaseReady || !supabase) {
      console.error("❌ Cannot save cover letter: Supabase not configured")
      throw new Error("Supabase not configured")
    }

    try {
      const supabaseClient2 = getSupabaseClient()
      const {
        data: { user },
      } = await supabaseClient2.auth.getUser()

      if (!user) {
        console.error("❌ Cannot save cover letter: User not authenticated")
        throw new Error("User not authenticated")
      }

      // Calculate word count
      const wordCount = this.countWords(coverLetterData.content)

      const insertData = {
        user_id: user.id,
        title: coverLetterData.title,
        content: coverLetterData.content,
        job_title: coverLetterData.job_title || null,
        company_name: coverLetterData.company_name || null,
        template_id: coverLetterData.template_id || null,
        status: coverLetterData.status || "draft",
        word_count: wordCount,
      }

      console.log("💾 Inserting cover letter to Supabase:", {
        user_id: insertData.user_id,
        title: insertData.title,
        job_title: insertData.job_title,
        company_name: insertData.company_name,
        status: insertData.status,
        word_count: insertData.word_count,
      })

      const { data, error } = await supabaseClient2.from("saved_cover_letters").insert(insertData).select().single()

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

  static async getUserSavedCoverLetters(): Promise<SavedCoverLetter[]> {
    console.log("🔍 Getting user saved cover letters...")

    if (!isSupabaseReady || !supabase) {
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

    const { data, error } = await supabaseClient
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

  static async updateSavedCoverLetter(
    coverLetterId: string,
    coverLetterData: {
      title?: string
      content?: string
      job_title?: string
      company_name?: string
      template_id?: string
      status?: "draft" | "ready" | "sent"
    },
  ): Promise<SavedCoverLetter> {
    console.log("📝 Updating saved cover letter:", coverLetterId, coverLetterData)

    if (!isSupabaseReady || !supabase) {
      console.error("❌ Cannot update cover letter: Supabase not configured")
      throw new Error("Supabase not configured")
    }

    try {
      const supabaseClient = getSupabaseClient()
      const {
        data: { user },
      } = await supabaseClient.auth.getUser()

      if (!user) {
        console.error("❌ Cannot update cover letter: User not authenticated")
        throw new Error("User not authenticated")
      }

      const updateData: Record<string, unknown> = {
        ...coverLetterData,
        updated_at: new Date().toISOString(),
      }

      // Calculate word count if content is provided
      if (coverLetterData.content) {
        updateData.word_count = this.countWords(coverLetterData.content)
      }

      const { data, error } = await supabaseClient
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
      console.error("❌ Error in updateSavedCoverLetter:", error)
      throw error
    }
  }

  static async deleteSavedCoverLetter(coverLetterId: string): Promise<boolean> {
    console.log("🗑️ Deleting saved cover letter:", coverLetterId)

    if (!isSupabaseReady || !supabase) {
      return false
    }

    try {
      const supabaseClient3 = getSupabaseClient()
      const { error } = await supabaseClient3.from("saved_cover_letters").delete().eq("id", coverLetterId)

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

  private static calculateWordCount(cvData: CVData): number {
    let wordCount = 0

    // Count words in personal info
    const personalInfo = cvData.personalInfo
    if (personalInfo && personalInfo.summary) {
      wordCount += this.countWords(personalInfo.summary)
    }

    // Count words in experience
    if (cvData.experience && Array.isArray(cvData.experience)) {
      cvData.experience.forEach((exp) => {
        if (exp && exp.description) {
          wordCount += this.countWords(exp.description)
        }
      })
    }

    // Count words in education
    if (cvData.education && Array.isArray(cvData.education)) {
      cvData.education.forEach((edu) => {
        if (edu && edu.description) {
          wordCount += this.countWords(edu.description)
        }
      })
    }

    // Count words in certifications
    if (cvData.certifications && Array.isArray(cvData.certifications)) {
      cvData.certifications.forEach((cert) => {
        if (cert && cert.description) {
          wordCount += this.countWords(cert.description)
        }
      })
    }

    // Count skills (each skill counts as 1 word)
    if (cvData.skills && Array.isArray(cvData.skills)) {
      wordCount += cvData.skills.filter((skill) => skill && skill.trim()).length
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

