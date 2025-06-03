import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Application = {
  id: string
  user_id: string
  job_title: string
  company_name: string
  job_posting: string
  cv_content: string
  cover_letter: string
  cv_recommendations: string
  status: "applied" | "interview" | "rejected" | "offer" | "withdrawn"
  applied_date: string
  interview_date?: string | null
  notes?: string | null
  job_url?: string | null
  salary_range?: string | null
  location?: string | null
  created_at: string
  updated_at: string
}
