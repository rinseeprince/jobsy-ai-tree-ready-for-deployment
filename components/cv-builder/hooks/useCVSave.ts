import { useState } from "react"
import { ApplicationsService } from "@/lib/supabase"
import { type CVData } from "@/lib/cv-templates"

export const useCVSave = () => {
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [cvTitle, setCvTitle] = useState("")
  const [currentCVId, setCurrentCVId] = useState<string | null>(null)

  // Show save modal
  const handleSaveClick = (cvData: CVData) => {
    // Generate a default title if none exists
    if (!cvTitle) {
      const defaultTitle = cvData.personalInfo.name ? `${cvData.personalInfo.name} - CV` : "My CV"
      setCvTitle(defaultTitle)
    }
    setShowSaveModal(true)
  }

  // Save CV
  const handleSave = async (cvData: CVData, selectedTemplate: string, setError: (error: string) => void, setSuccess: (success: string) => void) => {
    if (!cvTitle.trim()) {
      setError("Please enter a title for your CV")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      console.log("🔍 Starting CV save process...")
      console.log("Current CV ID:", currentCVId)
      console.log("CV Title:", cvTitle)

      let savedCV
      if (currentCVId) {
        // Update existing CV
        savedCV = await ApplicationsService.updateSavedCV(currentCVId, {
          title: cvTitle.trim(),
          cv_data: cvData,
          template_id: selectedTemplate,
          status: "draft",
        })
        console.log("✅ CV updated successfully:", savedCV)
        setSuccess("CV updated successfully!")
      } else {
        // Create new CV
        savedCV = await ApplicationsService.saveCVData({
          title: cvTitle.trim(),
          cv_data: cvData,
          template_id: selectedTemplate,
          status: "draft",
        })
        console.log("✅ CV saved successfully:", savedCV)
        setCurrentCVId(savedCV.id)
        setSuccess("CV saved successfully! You can find it in 'My CVs'.")
      }

      setShowSaveModal(false)
    } catch (error) {
      console.error("❌ Error saving CV:", error)
      setError("Failed to save CV. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return {
    isSaving,
    showSaveModal,
    setShowSaveModal,
    cvTitle,
    setCvTitle,
    currentCVId,
    setCurrentCVId,
    handleSaveClick,
    handleSave,
  }
} 