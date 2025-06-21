"use client"

import { useState, useEffect } from "react"
import { AlertCircle, Check, Copy } from "lucide-react"
import { CVBuilderHeader } from "./CVBuilderHeader"
import { CVBuilderTabs } from "./CVBuilderTabs"
import { CVBuildTab } from "./CVBuildTab"
import { CVTemplatesTab } from "./CVTemplatesTab"
import { CVPreviewTab } from "./CVPreviewTab"
import { CVOptimizeTab } from "./CVOptimizeTab"
import { CVSaveModal } from "./CVSaveModal"
import { CVAIImplementationModal } from "./CVAIImplementationModal"
import CVEditorModals from "@/components/cv-editor/cv-editor-modals"
import { useCVData } from "./hooks/useCVData"
import { useCVSave } from "./hooks/useCVSave"
import { useCVAnalysis } from "./hooks/useCVAnalysis"
import { useCVCompletion } from "./hooks/useCVCompletion"
import { getTemplateById, renderTemplate, type CVData } from "@/lib/cv-templates"
import { openPrintableVersion } from "@/lib/pdf-generator"

export const CVBuilderPage = () => {
  const [activeTab, setActiveTab] = useState("build")
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState("modern")

  // Custom hooks
  const {
    cvData,
    setCVData,
    isUploading,
    isLoading,
    error,
    setError,
    success,
    setSuccess,
    updatePersonalInfo,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    updateSkills,
    addCertification,
    updateCertification,
    removeCertification,
    handlePhotoUpload,
    removePhoto,
    handleFileUpload,
    generateCVText,
  } = useCVData()

  const {
    isSaving,
    showSaveModal,
    setShowSaveModal,
    cvTitle,
    setCvTitle,
    currentCVId,
    setCurrentCVId,
    handleSaveClick,
    handleSave,
  } = useCVSave()

  const {
    jobDescription,
    setJobDescription,
    isImproving,
    improvementSuggestions,
    copySuccess,
    isCopied,
    errorMessage,
    showImplementModal,
    setShowImplementModal,
    recommendationsText,
    setRecommendationsText,
    isImplementing,
    originalCVData,
    parsedRecommendations,
    selectedRecommendations,
    setSelectedRecommendations,
    showAISection,
    setShowAISection,
    handleImproveCV,
    handleCopyRecommendations,
    handleExportJobReport,
    handleShowImplementModal,
    handleImplementRecommendations,
    handleRevertToOriginal,
    handleRecommendationToggle,
  } = useCVAnalysis()

  const { calculateCompletion, getSectionStatus, getSectionPreview } = useCVCompletion()

  // Update template preview when data or template changes
  useEffect(() => {
    if (selectedTemplate && cvData) {
      getTemplateById(selectedTemplate)
    }
  }, [selectedTemplate, cvData])

  // Calculate completion percentage
  const completion = calculateCompletion(cvData, selectedTemplate)

  // PDF generation function
  const downloadCVAsPDF = () => {
    try {
      const printWindow = window.open("", "_blank")
      if (!printWindow) return

      // Get the template and render with proper styling
      const template = getTemplateById(selectedTemplate)
      let renderedHTML = ""

      if (template) {
        renderedHTML = renderTemplate(cvData, template)
      } else {
        // Fallback to simple rendering if template not found
        renderedHTML = renderSimpleCV(cvData)
      }

      const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <title>${cvData.personalInfo.name || "CV"}</title>
    <meta charset="utf-8">
    <style>
      @page { 
        margin: 0.5in; 
        size: A4; 
        /* Remove headers and footers */
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
        
        /* Force colors to print */
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
      
      /* Ensure template styles are preserved and colors print */
      * { 
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      /* Force background colors to print */
      div, span, section, header, footer, article, aside, nav {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      /* Ensure gradients print */
      [style*="background"] {
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
        }, 1000);
      }
    </script>
  </body>
</html>
`

      printWindow.document.write(htmlContent)
      printWindow.document.close()
      setSuccess("CV opened for PDF download! Follow the tips in the blue box for best results.")
    } catch (error) {
      console.error("Error downloading CV as PDF:", error)
      setError("Error generating PDF. Please try again.")
    }
  }

  // Add the renderSimpleCV helper function
  const renderSimpleCV = (cvData: CVData): string => {
    try {
      let html = ""

      // Personal Info
      if (cvData.personalInfo) {
        const p = cvData.personalInfo
        html += `<div class="section">
        <h1>${p.name || ""}</h1>
        <p>${p.title || ""}</p>
        <p>${p.email || ""} | ${p.phone || ""} | ${p.location || ""}</p>
        ${p.linkedin ? `<p>LinkedIn: ${p.linkedin}</p>` : ""}
        ${p.website ? `<p>Website: ${p.website}</p>` : ""}
        <p>${p.summary || ""}</p>
      </div>`
      }

      // Experience
      if (cvData.experience && cvData.experience.length > 0) {
        html += `<h2>Experience</h2>`
        cvData.experience.forEach((exp) => {
          html += `<div class="section">
          <h3>${exp.title || ""} | ${exp.company || ""}</h3>
          <p>${exp.startDate || ""} - ${exp.current ? "Present" : exp.endDate || ""} | ${exp.location || ""}</p>
          <p>${exp.description || ""}</p>
        </div>`
        })
      }

      // Education
      if (cvData.education && cvData.education.length > 0) {
        html += `<h2>Education</h2>`
        cvData.education.forEach((edu) => {
          html += `<div class="section">
          <h3>${edu.degree || ""} | ${edu.institution || ""}</h3>
          <p>${edu.startDate || ""} - ${edu.current ? "Present" : edu.endDate || ""} | ${edu.location || ""}</p>
          <p>${edu.description || ""}</p>
        </div>`
        })
      }

      // Skills
      if (cvData.skills && cvData.skills.length > 0) {
        html += `<h2>Skills</h2><p>${cvData.skills.join(", ")}</p>`
      }

      // Certifications
      if (cvData.certifications && cvData.certifications.length > 0) {
        html += `<h2>Certifications</h2>`
        cvData.certifications.forEach((cert) => {
          html += `<div class="section">
          <h3>${cert.name || ""} | ${cert.issuer || ""}</h3>
          <p>${cert.date || ""}</p>
          ${cert.description ? `<p>${cert.description}</p>` : ""}
        </div>`
        })
      }

      return html
    } catch (error) {
      console.error("Error rendering CV:", error)
      return "<p>Error rendering CV</p>"
    }
  }

  // Add a function to handle CV updates from analysis
  const handleCVUpdateFromAnalysis = (updatedCVData: CVData) => {
    console.log("🔄 Updating CV data from analysis:", updatedCVData)
    setCVData(updatedCVData)
    setSuccess("CV updated with AI recommendations!")
  }

  // Apply template handler
  const handleApplyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
    setSuccess(`Template "${templateId}" applied successfully!`)
    setActiveTab("build")
  }

  // Template change handler
  const handleTemplateChange = () => {
    setActiveTab("templates")
  }

  // Section click handler
  const handleSectionClick = (modal: string) => {
    setActiveModal(modal)
  }

  // Save click handler
  const handleSaveClickWrapper = () => {
    handleSaveClick(cvData)
  }

  // Save handler
  const handleSaveWrapper = () => {
    handleSave(cvData, selectedTemplate, setError, setSuccess)
  }

  // Improve CV handler
  const handleImproveCVWrapper = () => {
    handleImproveCV(generateCVText, setError, setSuccess)
  }

  // Export job report handler
  const handleExportJobReportWrapper = () => {
    handleExportJobReport(cvData)
  }

  // Show implement modal handler
  const handleShowImplementModalWrapper = () => {
    handleShowImplementModal(setError, setSuccess)
  }

  // Implement recommendations handlers
  const handleImplementRecommendationsWrapper = (applyAll = false) => {
    handleImplementRecommendations(cvData, setCVData, setError, setSuccess, applyAll)
  }

  // Revert to original handler
  const handleRevertToOriginalWrapper = () => {
    handleRevertToOriginal(setCVData, setSuccess)
  }

  // Recommendation selection handlers
  const handleSelectNone = () => {
    setSelectedRecommendations([])
  }

  const handleSelectAll = () => {
    setSelectedRecommendations(parsedRecommendations.map((_, i) => i.toString()))
  }

  if (isLoading) {
    return (
      <div className="min-h-screenbg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg">Loading CV data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <CVBuilderHeader completion={completion} />

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

        {copySuccess && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <Copy className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800">{copySuccess}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{errorMessage}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="mb-6">
          {/* Tab Navigation */}
          <CVBuilderTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Build Tab */}
          {activeTab === "build" && (
            <CVBuildTab
              cvData={cvData}
              selectedTemplate={selectedTemplate}
              isUploading={isUploading}
              isSaving={isSaving}
              showAISection={showAISection}
              recommendationsText={recommendationsText}
              isImplementing={isImplementing}
              originalCVData={originalCVData}
              getSectionStatus={(section) => getSectionStatus(cvData, section)}
              getSectionPreview={(section) => getSectionPreview(cvData, section)}
              onFileUpload={handleFileUpload}
              onSaveClick={handleSaveClickWrapper}
              onDownloadPDF={downloadCVAsPDF}
              onCVUpdate={handleCVUpdateFromAnalysis}
              onShowAISection={setShowAISection}
              onRecommendationsTextChange={setRecommendationsText}
              onShowImplementModal={handleShowImplementModalWrapper}
              onRevertToOriginal={handleRevertToOriginalWrapper}
              onTemplateChange={handleTemplateChange}
              onSectionClick={handleSectionClick}
            />
          )}

          {/* Templates Tab */}
          {activeTab === "templates" && (
            <CVTemplatesTab
              cvData={cvData}
              selectedTemplate={selectedTemplate}
              onApplyTemplate={handleApplyTemplate}
            />
          )}

          {/* Preview Tab */}
          {activeTab === "preview" && (
            <CVPreviewTab cvData={cvData} selectedTemplate={selectedTemplate} />
          )}

          {/* AI Optimize Tab */}
          {activeTab === "optimize" && (
            <CVOptimizeTab
              jobDescription={jobDescription}
              isImproving={isImproving}
              improvementSuggestions={improvementSuggestions}
              isCopied={isCopied}
              onJobDescriptionChange={setJobDescription}
              onImproveCV={handleImproveCVWrapper}
              onCopyRecommendations={handleCopyRecommendations}
              onExportJobReport={handleExportJobReportWrapper}
            />
          )}
        </div>

        {/* Save CV Modal */}
        <CVSaveModal
          showSaveModal={showSaveModal}
          cvTitle={cvTitle}
          isSaving={isSaving}
          currentCVId={currentCVId}
          onCvTitleChange={setCvTitle}
          onSave={handleSaveWrapper}
          onClose={() => setShowSaveModal(false)}
        />

        {/* AI Implementation Modal */}
        <CVAIImplementationModal
          showImplementModal={showImplementModal}
          isImplementing={isImplementing}
          parsedRecommendations={parsedRecommendations}
          selectedRecommendations={selectedRecommendations}
          onClose={() => setShowImplementModal(false)}
          onRecommendationToggle={handleRecommendationToggle}
          onSelectNone={handleSelectNone}
          onSelectAll={handleSelectAll}
          onApplySelected={() => handleImplementRecommendationsWrapper(false)}
          onApplyAll={() => handleImplementRecommendationsWrapper(true)}
        />

        {/* Modals */}
        <CVEditorModals
          activeModal={activeModal}
          setActiveModal={setActiveModal}
          cvData={cvData}
          updatePersonalInfo={updatePersonalInfo}
          addExperience={addExperience}
          updateExperience={updateExperience}
          removeExperience={removeExperience}
          addEducation={addEducation}
          updateEducation={updateEducation}
          removeEducation={removeEducation}
          updateSkills={updateSkills}
          addCertification={addCertification}
          updateCertification={updateCertification}
          removeCertification={removeCertification}
          handlePhotoUpload={handlePhotoUpload}
          removePhoto={removePhoto}
        />
      </div>
    </div>
  )
} 