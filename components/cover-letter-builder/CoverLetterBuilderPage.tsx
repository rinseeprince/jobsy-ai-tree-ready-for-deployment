"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { AlertCircle, Check } from "lucide-react"
import { CoverLetterBuilderTabs } from "./CoverLetterBuilderTabs"
import { CoverLetterBuildTab } from "./CoverLetterBuildTab"
import { CoverLetterTemplatesTab } from "./CoverLetterTemplatesTab"
import { CoverLetterPreviewTab } from "./CoverLetterPreviewTab"
import { CoverLetterBuilderHeader } from "./CoverLetterBuilderHeader"
import { useCoverLetterData } from "./hooks/useCoverLetterData"
import { useCoverLetterSave } from "./hooks/useCoverLetterSave"
import { CoverLetterSaveModal } from "./CoverLetterSaveModal"
import { COVER_LETTER_TEMPLATES } from "@/lib/cover-letter-templates"
import { renderCoverLetterTemplate, getCoverLetterTemplateById } from "@/lib/cover-letter-templates"

export default function CoverLetterBuilderPage() {
  const searchParams = useSearchParams()
  const coverLetterId = searchParams.get("id")

  const [activeTab, setActiveTab] = useState("build")
  const [selectedTemplate, setSelectedTemplate] = useState(COVER_LETTER_TEMPLATES[0].id)
  const [showSaveModal, setShowSaveModal] = useState(false)

  const {
    coverLetterData,
    isLoading,
    error,
    success,
    setError,
    setSuccess,
    updatePersonalInfo,
    updateJobInfo,
    updateContent,
    regenerateContent,
    isRegenerating,
    loadSavedCoverLetter,
  } = useCoverLetterData()

  const { saveCoverLetter, isSaving, saveError, saveSuccess } = useCoverLetterSave()

  // Calculate completion percentage
  const calculateCompletion = () => {
    const { jobInfo, content } = coverLetterData
    let completed = 0
    let total = 0

    // Job Information (40% weight)
    total += 4
    if (jobInfo.jobTitle.trim()) completed += 1
    if (jobInfo.companyName.trim()) completed += 1
    if (jobInfo.jobPosting.trim()) completed += 1
    if (jobInfo.hiringManager?.trim()) completed += 1

    // Content (60% weight)
    total += 3
    if (content.opening.trim()) completed += 1
    if (content.body.trim()) completed += 1
    if (content.closing.trim()) completed += 1

    return Math.round((completed / total) * 100)
  }

  const completion = calculateCompletion()

  // Load existing cover letter if editing
  useEffect(() => {
    if (coverLetterId) {
      console.log("🔄 Loading cover letter with ID:", coverLetterId)
      loadSavedCoverLetter(coverLetterId)
        .then((savedCoverLetter) => {
          console.log("✅ Cover letter loaded successfully:", savedCoverLetter)
          // Set the template to match the saved cover letter
          if (savedCoverLetter.template_id) {
            setSelectedTemplate(savedCoverLetter.template_id)
          }
        })
        .catch((error) => {
          console.error("❌ Failed to load cover letter:", error)
          setError("Failed to load cover letter. Please try again.")
        })
    }
  }, [coverLetterId, loadSavedCoverLetter, setError])

  const handleSave = async (title: string, status: "draft" | "ready" | "sent" = "draft") => {
    console.log("💾 handleSave called with:", { title, status })
    console.log("📋 Current cover letter data:", coverLetterData)
    console.log("🎨 Selected template:", selectedTemplate)
    
    try {
      console.log("📝 Calling saveCoverLetter from hook...")
      const savedCoverLetter = await saveCoverLetter({
        title,
        cover_letter_data: coverLetterData,
        template_id: selectedTemplate,
        status,
      })
      console.log("✅ Save completed successfully:", savedCoverLetter)
      
      setShowSaveModal(false)
      setSuccess("Cover letter saved successfully!")
    } catch (error) {
      console.error("❌ Save failed:", error)
      setError("Failed to save cover letter")
    }
  }

  const handleDownloadPDF = () => {
    try {
      // Get the selected template
      const template = getCoverLetterTemplateById(selectedTemplate)
      if (!template) {
        setError("No template selected for PDF generation")
        return
      }

      // Check if we have the minimum required data
      const hasRequiredData = coverLetterData.jobInfo.jobTitle && 
                             coverLetterData.jobInfo.companyName &&
                             (coverLetterData.content.opening || coverLetterData.content.body || coverLetterData.content.closing)

      if (!hasRequiredData) {
        setError("Please fill in job title, company name, and add some content before generating PDF")
        return
      }

      // Render the cover letter with the selected template
      const renderedHTML = renderCoverLetterTemplate(coverLetterData, template)

      // Create a printable window
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        setError("Could not open print window. Please check your popup blocker settings.")
        return
      }

      const title = `Cover Letter - ${coverLetterData.jobInfo.jobTitle} at ${coverLetterData.jobInfo.companyName}`
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <meta charset="utf-8">
            <style>
              @page { 
                margin: 0.5in; 
                size: A4; 
                @top-left { content: ""; }
                @top-center { content: ""; }
                @top-right { content: ""; }
                @bottom-left { content: ""; }
                @bottom-center { content: ""; }
                @bottom-right { content: ""; }
              }
              @media print { 
                body { 
                  margin: 0; 
                  padding: 0; 
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                  print-color-adjust: exact !important;
                } 
                .no-print { display: none; }
                * {
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
              }
              body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              * { 
                box-sizing: border-box;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            </style>
          </head>
          <body>
            <div class="no-print" style="position: fixed; top: 10px; right: 10px; background: #007bff; color: white; padding: 10px 15px; border-radius: 5px; font-size: 14px; z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
              <strong>💡 Tip:</strong> Uncheck "Headers and footers" in print options for a clean PDF
            </div>
            ${renderedHTML}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `

      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.focus()
      
      setSuccess("PDF generation window opened. Please use the print dialog to save as PDF.")
    } catch (error) {
      console.error("❌ PDF generation failed:", error)
      setError("Failed to generate PDF. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg">Loading cover letter data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <CoverLetterBuilderHeader completion={completion} />

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {saveError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{saveError}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{saveSuccess}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="mb-6">
          {/* Tab Navigation */}
          <CoverLetterBuilderTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Tab Content */}
          {activeTab === "build" && (
            <CoverLetterBuildTab
              coverLetterData={coverLetterData}
              updatePersonalInfo={updatePersonalInfo}
              updateJobInfo={updateJobInfo}
              updateContent={updateContent}
              regenerateContent={regenerateContent}
              isRegenerating={isRegenerating}
              isLoading={isLoading}
              onSave={() => setShowSaveModal(true)}
              onDownloadPDF={handleDownloadPDF}
              isSaving={isSaving}
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
