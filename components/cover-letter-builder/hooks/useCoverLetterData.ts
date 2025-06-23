"use client"

import { useState, useCallback } from "react"
import type { CoverLetterData } from "@/lib/cover-letter-templates"
import { getSavedCoverLetter } from "@/lib/cover-letter-service"
import { generateCoverLetter } from "@/lib/ai-service"

const initialCoverLetterData: CoverLetterData = {
  personalInfo: {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
  },
  jobInfo: {
    jobTitle: "",
    companyName: "",
    hiringManager: "",
    jobPosting: "",
  },
  content: {
    opening: "",
    body: "",
    closing: "",
  },
}

export const useCoverLetterData = () => {
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData>(initialCoverLetterData)
  const [isLoading, setIsLoading] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const updatePersonalInfo = useCallback((field: string, value: string) => {
    setCoverLetterData((prev: CoverLetterData) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }))
  }, [])

  const updateJobInfo = useCallback((field: string, value: string) => {
    setCoverLetterData((prev: CoverLetterData) => ({
      ...prev,
      jobInfo: {
        ...prev.jobInfo,
        [field]: value,
      },
    }))
  }, [])

  const updateContent = useCallback((field: "opening" | "body" | "closing", value: string) => {
    setCoverLetterData((prev: CoverLetterData) => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value,
      },
    }))
  }, [])

  const loadSavedCoverLetter = useCallback(async (coverLetterId: string) => {
    console.log("🔄 Loading saved cover letter:", coverLetterId)
    setIsLoading(true)
    setError(null)

    try {
      const savedCoverLetter = await getSavedCoverLetter(coverLetterId)
      
      if (!savedCoverLetter) {
        throw new Error("Cover letter not found")
      }

      console.log("✅ Loaded saved cover letter:", savedCoverLetter)
      
      // Update the cover letter data with the saved data
      setCoverLetterData(savedCoverLetter.cover_letter_data)
      setSuccess("Cover letter loaded successfully")
      
      return savedCoverLetter
    } catch (err) {
      console.error("❌ Failed to load saved cover letter:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load cover letter"
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadFromCV = useCallback(async (cvId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // TODO: Implement CV loading logic
      console.log("Loading from CV:", cvId)
      setSuccess("Personal information loaded from CV")
    } catch (err) {
      console.error("Failed to load CV data:", err)
      setError("Failed to load CV data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const generateCoverLetterText = useCallback(async (jobDescription: string) => {
    setIsRegenerating(true)
    setError(null)

    try {
      // TODO: Implement AI generation logic
      console.log("Generating cover letter for:", jobDescription)
      setSuccess("Cover letter generated successfully")
    } catch (err) {
      console.error("Failed to generate cover letter:", err)
      setError("Failed to generate cover letter")
    } finally {
      setIsRegenerating(false)
    }
  }, [])

  const regenerateContent = useCallback(async () => {
    setIsRegenerating(true)
    setError(null)

    try {
      console.log("🔄 Regenerating cover letter content...")
      
      // Check if we have job posting to regenerate from
      if (!coverLetterData.jobInfo.jobPosting.trim()) {
        throw new Error("Please provide a job description first to regenerate content")
      }

      // Create basic CV content from personal info (if available)
      const cvContent = `
Name: ${coverLetterData.personalInfo.name || "Your Name"}
Title: ${coverLetterData.personalInfo.title || "Your Title"}
Email: ${coverLetterData.personalInfo.email || "your.email@example.com"}
Phone: ${coverLetterData.personalInfo.phone || "Your Phone"}
Location: ${coverLetterData.personalInfo.location || "Your Location"}
LinkedIn: ${coverLetterData.personalInfo.linkedin || ""}
Website: ${coverLetterData.personalInfo.website || ""}
      `.trim()

      // Generate new cover letter content
      const fullCoverLetter = await generateCoverLetter(coverLetterData.jobInfo.jobPosting, cvContent)

      // Split the cover letter into sections
      const paragraphs = fullCoverLetter.split("\n\n").filter((p) => p.trim())

      if (paragraphs.length >= 3) {
        setCoverLetterData((prev) => ({
          ...prev,
          content: {
            opening: paragraphs[0],
            body: paragraphs.slice(1, -1).join("\n\n"),
            closing: paragraphs[paragraphs.length - 1],
          },
        }))
      } else {
        // If we can't split properly, put everything in body
        setCoverLetterData((prev) => ({
          ...prev,
          content: {
            opening: "",
            body: fullCoverLetter,
            closing: "",
          },
        }))
      }

      console.log("✅ Cover letter content regenerated successfully")
      setSuccess("Cover letter regenerated successfully!")
    } catch (err) {
      console.error("❌ Failed to regenerate content:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to regenerate content"
      setError(errorMessage)
      throw err
    } finally {
      setIsRegenerating(false)
    }
  }, [coverLetterData.jobInfo.jobPosting, coverLetterData.personalInfo])

  return {
    coverLetterData,
    setCoverLetterData,
    isLoading,
    isRegenerating,
    error,
    success,
    setError,
    setSuccess,
    updatePersonalInfo,
    updateJobInfo,
    updateContent,
    loadSavedCoverLetter,
    loadFromCV,
    generateCoverLetterText,
    regenerateContent,
  }
}

export default useCoverLetterData;
