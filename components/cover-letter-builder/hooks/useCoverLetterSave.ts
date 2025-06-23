"use client"

import { useState, useCallback } from "react"
import type { CoverLetterData } from "@/lib/cover-letter-templates"
import { saveCoverLetter } from "@/lib/cover-letter-service"

interface SaveCoverLetterData {
  title: string
  cover_letter_data: CoverLetterData
  template_id: string
  status: "draft" | "ready" | "sent"
}

export const useCoverLetterSave = () => {
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  const saveCoverLetterHandler = useCallback(async (data: SaveCoverLetterData) => {
    console.log("💾 Starting cover letter save process...", data)
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(null)

    try {
      console.log("📝 Calling saveCoverLetter service function...")
      const savedCoverLetter = await saveCoverLetter(data)
      console.log("✅ Cover letter saved successfully:", savedCoverLetter)
      
      setSaveSuccess("Cover letter saved successfully!")
      return savedCoverLetter
    } catch (error) {
      console.error("❌ Failed to save cover letter:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to save cover letter. Please try again."
      setSaveError(errorMessage)
      throw error
    } finally {
      setIsSaving(false)
    }
  }, [])

  const clearMessages = useCallback(() => {
    setSaveError(null)
    setSaveSuccess(null)
  }, [])

  return {
    saveCoverLetter: saveCoverLetterHandler,
    isSaving,
    saveError,
    saveSuccess,
    clearMessages,
  }
}

export default useCoverLetterSave;
