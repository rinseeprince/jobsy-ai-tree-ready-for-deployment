"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ResumeBuilder } from "@/components/resume-builder/index"
import { supabase, isSupabaseReady } from "@/lib/supabase"

export default function ResumeBuilderPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (!isSupabaseReady) {
        setIsLoading(false)
        return
      }

      try {
        const { data } = await supabase.auth.getSession()
        setIsAuthenticated(!!data.session)
      } catch {
        console.error("Error checking auth")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/?login=true")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading resume builder...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ResumeBuilder />
      </main>
      <Footer />
    </div>
  )
}
