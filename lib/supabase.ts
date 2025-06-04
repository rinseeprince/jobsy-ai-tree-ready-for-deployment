import { createClient } from "@supabase/supabase-js"

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate that both URL and key are present and valid
const isSupabaseConfigured = () => {
  console.log("🔍 DETAILED SUPABASE DEBUG:")
  console.log("Raw environment variables:")
  console.log("- NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl)
  console.log("- NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey)
  console.log("- URL exists:", !!supabaseUrl)
  console.log("- URL is string:", typeof supabaseUrl === "string")
  console.log("- URL starts with http:", supabaseUrl?.startsWith("http"))
  console.log("- URL is not placeholder:", supabaseUrl !== "your_supabase_project_url")
  console.log("- Key exists:", !!supabaseAnonKey)
  console.log("- Key is string:", typeof supabaseAnonKey === "string")
  console.log("- Key length > 10:", (supabaseAnonKey?.length || 0) > 10)
  console.log("- Key is not placeholder:", supabaseAnonKey !== "your_supabase_anon_key")

  const isConfigured =
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "your_supabase_project_url" &&
    supabaseAnonKey !== "your_supabase_anon_key" &&
    supabaseUrl.startsWith("http")

  console.log("Final isSupabaseReady result:", isConfigured)
  return isConfigured
}

// Export the configuration check result
export const isSupabaseReady = isSupabaseConfigured()

// Define proper types for the mock client
type MockResponse<T = null> = {
  data: T
  error: { message: string } | null
}

type MockQueryBuilder = {
  select: (columns?: string) => MockQueryBuilder
  eq: (column: string, value: unknown) => MockQueryBuilder
  order: (column: string, options?: { ascending: boolean }) => MockQueryBuilder
  single: () => Promise<MockResponse>
  then: <TResult1 = MockResponse<unknown[]>, TResult2 = never>(
    onfulfilled?: ((value: MockResponse<unknown[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) => Promise<TResult1 | TResult2>
  catch: <TResult = never>(
    onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null,
  ) => Promise<MockResponse<unknown[]> | TResult>
}

// Create a comprehensive mock client
const createMockSupabaseClient = () => {
  console.log("⚠️ Creating mock Supabase client - database features will not work")

  const mockSubscription = {
    unsubscribe: () => {},
  }

  const mockError = { message: "Supabase not configured" }
  const mockResponse: MockResponse = { data: null, error: mockError }
  const mockArrayResponse: MockResponse<unknown[]> = { data: [], error: null }

  // Create a mock query builder that properly chains
  const createMockQueryBuilder = (): MockQueryBuilder => {
    const mockBuilder: MockQueryBuilder = {
      select: () => mockBuilder,
      eq: () => mockBuilder,
      order: () => mockBuilder,
      single: () => Promise.resolve(mockResponse),
      then: <TResult1 = MockResponse<unknown[]>, TResult2 = never>(
        resolve?: ((value: MockResponse<unknown[]>) => TResult1 | PromiseLike<TResult1>) | null,
      ) => {
        if (resolve) {
          return Promise.resolve(mockArrayResponse).then(resolve)
        }
        return Promise.resolve(mockArrayResponse) as Promise<TResult1 | TResult2>
      },
      catch: <TResult = never>(reject?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null) => {
        if (reject) {
          return Promise.resolve(mockArrayResponse).catch(reject)
        }
        return Promise.resolve(mockArrayResponse) as Promise<MockResponse<unknown[]> | TResult>
      },
    }
    return mockBuilder
  }

  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: mockError }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: mockError }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: mockSubscription } }),
      exchangeCodeForSession: () => Promise.resolve({ data: { user: null, session: null }, error: mockError }),
    },
    from: () => ({
      select: () => createMockQueryBuilder(),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve(mockResponse),
        }),
      }),
      update: () => ({
        eq: () => Promise.resolve(mockResponse),
      }),
      delete: () => ({
        eq: () => Promise.resolve(mockResponse),
      }),
    }),
  }
}

// Create the Supabase client
const createSupabaseClient = () => {
  if (!isSupabaseReady) {
    console.warn("⚠️ Supabase environment variables not configured or invalid. Using mock client.")
    return createMockSupabaseClient()
  }

  try {
    console.log("✅ Creating real Supabase client with valid configuration")
    return createClient(supabaseUrl!, supabaseAnonKey!)
  } catch (error) {
    console.error("❌ Failed to create Supabase client:", error)
    return createMockSupabaseClient()
  }
}

export const supabase = createSupabaseClient() as ReturnType<typeof createClient>

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

    if (!isSupabaseReady) {
      console.error("❌ Cannot save application: Supabase not configured")
      throw new Error("Supabase not configured")
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

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

      const { data, error } = await supabase.from("applications").insert(insertData).select().single()

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

    if (!isSupabaseReady) {
      console.log("⚠️ Supabase not ready, returning empty array")
      return []
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("👤 User for applications:", { hasUser: !!user, userId: user?.id })

    if (!user) {
      console.log("❌ No user found, returning empty array")
      return []
    }

    const { data, error } = await supabase
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
    if (!isSupabaseReady) {
      return {
        total: 0,
        thisMonth: 0,
        byStatus: {},
        interviewRate: 0,
      }
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return {
        total: 0,
        thisMonth: 0,
        byStatus: {},
        interviewRate: 0,
      }
    }

    const result = await supabase.from("applications").select("status, created_at").eq("user_id", user.id)
    const { data, error } = result

    if (error || !data) {
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

    if (!isSupabaseReady) {
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

    if (!isSupabaseReady) {
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

      const { error } = await supabase.from("applications").update(updateData).eq("id", applicationId)

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

    if (!isSupabaseReady) {
      console.error("❌ Cannot delete application: Supabase not configured")
      throw new Error("Supabase not configured")
    }

    try {
      const { error } = await supabase.from("applications").delete().eq("id", applicationId)

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
    if (!isSupabaseReady) {
      return null
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

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
}
