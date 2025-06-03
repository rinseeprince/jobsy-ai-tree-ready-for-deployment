import { supabase } from "./supabase"
import type { Application } from "./supabase"

// Simple Application input type for saving
export type SaveApplicationInput = {
  job_title: string
  company_name: string
  job_posting: string
  cv_content: string
  cover_letter: string
  cv_recommendations: string
  location?: string
  salary_range?: string
  job_url?: string
}

// Applications Service - Simple and focused
export class ApplicationsService {
  // Save a new application
  static async saveApplication(data: SaveApplicationInput): Promise<Application> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Must be logged in to save applications")
    }

    const { data: result, error } = await supabase
      .from("applications")
      .insert({
        user_id: user.id,
        job_title: data.job_title,
        company_name: data.company_name,
        job_posting: data.job_posting,
        cv_content: data.cv_content,
        cover_letter: data.cover_letter,
        cv_recommendations: data.cv_recommendations,
        location: data.location,
        salary_range: data.salary_range,
        job_url: data.job_url,
        status: "applied",
        applied_date: new Date().toISOString().split("T")[0], // Today's date
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving application:", error)
      throw new Error("Failed to save application")
    }

    return result
  }

  // Get all applications for current user
  static async getUserApplications(): Promise<Application[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return []
    }

    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching applications:", error)
      return []
    }

    return data || []
  }

  // Get application statistics
  static async getApplicationStats() {
    const applications = await this.getUserApplications()

    const total = applications.length
    const thisMonth = applications.filter((app) => {
      const appDate = new Date(app.applied_date)
      const now = new Date()
      return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear()
    }).length

    const byStatus = applications.reduce(
      (acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const interviews = byStatus.interview || 0
    const interviewRate = total > 0 ? Math.round((interviews / total) * 100) : 0

    return {
      total,
      thisMonth,
      byStatus,
      interviewRate,
    }
  }

  // Update application status
  static async updateApplicationStatus(
    applicationId: string,
    status: Application["status"],
    interviewDate?: string,
    notes?: string,
  ): Promise<void> {
    const updateData: Partial<Application> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (interviewDate) {
      updateData.interview_date = interviewDate
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    const { error } = await supabase.from("applications").update(updateData).eq("id", applicationId)

    if (error) {
      console.error("Error updating application:", error)
      throw new Error("Failed to update application")
    }
  }

  // Delete application
  static async deleteApplication(applicationId: string): Promise<void> {
    const { error } = await supabase.from("applications").delete().eq("id", applicationId)

    if (error) {
      console.error("Error deleting application:", error)
      throw new Error("Failed to delete application")
    }
  }

  // Extract job details from job posting text (simple regex-based extraction)
  static extractJobDetails(jobPosting: string) {
    const lines = jobPosting.split("\n").filter((line) => line.trim())

    // Try to find job title (usually in first few lines)
    let job_title = "Software Engineer" // default
    const titleLine = lines.find(
      (line) =>
        line.toLowerCase().includes("position") ||
        line.toLowerCase().includes("role") ||
        line.toLowerCase().includes("engineer") ||
        line.toLowerCase().includes("developer") ||
        line.toLowerCase().includes("manager"),
    )
    if (titleLine) {
      job_title = titleLine
        .trim()
        .replace(/[^\w\s]/g, "")
        .trim()
    }

    // Try to find company name
    let company_name = "Company" // default
    const companyLine = lines.find(
      (line) =>
        line.toLowerCase().includes("company") ||
        line.toLowerCase().includes("inc") ||
        line.toLowerCase().includes("corp") ||
        line.toLowerCase().includes("ltd"),
    )
    if (companyLine) {
      company_name = companyLine
        .trim()
        .replace(/[^\w\s]/g, "")
        .trim()
    }

    // Try to find location
    let location = ""
    const locationLine = lines.find(
      (line) =>
        line.toLowerCase().includes("location") ||
        line.toLowerCase().includes("remote") ||
        line.toLowerCase().includes("san francisco") ||
        line.toLowerCase().includes("new york") ||
        line.toLowerCase().includes("london"),
    )
    if (locationLine) {
      location = locationLine.trim()
    }

    // Try to find salary
    let salary_range = ""
    const salaryLine = lines.find(
      (line) =>
        line.includes("$") || line.toLowerCase().includes("salary") || line.toLowerCase().includes("compensation"),
    )
    if (salaryLine) {
      salary_range = salaryLine.trim()
    }

    return {
      job_title: job_title.substring(0, 100), // Limit length
      company_name: company_name.substring(0, 100),
      location: location.substring(0, 100),
      salary_range: salary_range.substring(0, 100),
    }
  }
}
