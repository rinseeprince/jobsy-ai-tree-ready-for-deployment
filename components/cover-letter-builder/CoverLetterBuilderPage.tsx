"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import CoverLetterBuilderTabs from "./CoverLetterBuilderTabs"
import CoverLetterBuildTab from "./CoverLetterBuildTab"
import CoverLetterTemplatesTab from "./CoverLetterTemplatesTab"
import CoverLetterPreviewTab from "./CoverLetterPreviewTab"
import CoverLetterBuilderHeader from "./CoverLetterBuilderHeader"
import useCoverLetterData from "./hooks/useCoverLetterData"
import useCoverLetterSave from "./hooks/useCoverLetterSave"
import CoverLetterSaveModal from "./CoverLetterSaveModal"
import { COVER_LETTER_TEMPLATES } from "@/lib/cover-letter-templates"

export const CoverLetterBuilderPage = () => {
  const searchParams = useSearchParams()
  const coverLetterId = searchParams.get("id")

  const [activeTab, setActiveTab] = useState("build")
  const [selectedTemplate, setSelectedTemplate] = useState(COVER_LETTER_TEMPLATES[0].id)
  const [showSaveModal, setShowSaveModal] = useState(false)

  const {
    coverLetterData,
    error,
    success,
    setError,
    setSuccess,
    updatePersonalInfo,
    updateJobInfo,
    updateContent,
    loadFromCV,
    regenerateContent,
    isRegenerating,
  } = useCoverLetterData()

  const { saveCoverLetter, isSaving, saveError, saveSuccess } = useCoverLetterSave()

  // Load existing cover letter if editing
  useEffect(() => {
    if (coverLetterId) {
      // Load cover letter logic will be implemented in the hook
    }
  }, [coverLetterId])

  const handleSave = async (title: string, status: "draft" | "ready" | "sent" = "draft") => {
    try {
      await saveCoverLetter({
        title,
        cover_letter_data: coverLetterData,
        template_id: selectedTemplate,
        status,
      })
      setShowSaveModal(false)
      setSuccess("Cover letter saved successfully!")
    } catch (error) {
      console.error("Failed to save cover letter:", error)
      setError("Failed to save cover letter")
    }
  }

  const handleDownloadPDF = () => {
    // PDF download logic will be implemented
    console.log("Download PDF clicked")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <CoverLetterBuilderHeader
          onSave={() => setShowSaveModal(true)}
          onDownloadPDF={handleDownloadPDF}
          isSaving={isSaving}
          error={error || saveError}
          success={success || saveSuccess}
        />

        {/* Tabs */}
        <CoverLetterBuilderTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "build" && (
            <CoverLetterBuildTab
              coverLetterData={coverLetterData}
              updatePersonalInfo={updatePersonalInfo}
              updateJobInfo={updateJobInfo}
              updateContent={updateContent}
              loadFromCV={loadFromCV}
              regenerateContent={regenerateContent}
              isRegenerating={isRegenerating}
            />
          )}

          {activeTab === "templates" && (
            <CoverLetterTemplatesTab selectedTemplate={selectedTemplate} onSelectTemplate={setSelectedTemplate} />
          )}

          {activeTab === "preview" && (
            <CoverLetterPreviewTab coverLetterData={coverLetterData} selectedTemplate={selectedTemplate} />
          )}
        </div>

        {/* Save Modal */}
        {showSaveModal && (
          <CoverLetterSaveModal
            isOpen={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            onSave={handleSave}
            isSaving={isSaving}
            defaultTitle={`${coverLetterData.jobInfo.jobTitle} - ${coverLetterData.jobInfo.companyName}`}
          />
        )}
      </div>
    </div>
  )
}
