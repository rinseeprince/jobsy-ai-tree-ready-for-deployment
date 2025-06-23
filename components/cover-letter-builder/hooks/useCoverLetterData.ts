"use client"

import { useState, useCallback } from "react"
import type { CoverLetterData } from "@/lib/cover-letter-templates"

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
      // TODO: Implement regeneration logic
      console.log("Regenerating content")
      setSuccess("Content regenerated successfully")
    } catch (err) {
      console.error("Failed to regenerate content:", err)
      setError("Failed to regenerate content")
    } finally {
      setIsRegenerating(false)
    }
  }, [])

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
    loadFromCV,
    generateCoverLetterText,
    regenerateContent,
  }
}

export default useCoverLetterData;
