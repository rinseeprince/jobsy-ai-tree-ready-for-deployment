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
import { CVComparisonModal } from "./CVComparisonModal"
import CVEditorModals from "@/components/cv-editor/cv-editor-modals"
import { useCVData } from "./hooks/useCVData"
import { useCVSave } from "./hooks/useCVSave"
import { useCVAnalysis } from "./hooks/useCVAnalysis"
import { useCVCompletion } from "./hooks/useCVCompletion"
import { getTemplateById, renderTemplate, type CVData } from "@/lib/cv-templates"
import { PaywallService, type Feature } from "@/lib/paywall"
import { PaywallModal } from "@/components/paywall-modal"

export const CVBuilderPage = () => {
  const [activeTab, setActiveTab] = useState("build")
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState("modern")
  const [paywallModal, setPaywallModal] = useState<{
    isOpen: boolean
    feature: Feature | null
    paywallInfo: any
  }>({
    isOpen: false,
    feature: null,
    paywallInfo: null,
  })

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
    generateCoverLetter,
    setGenerateCoverLetter,
    showComparisonModal,
    setShowComparisonModal,
    isImplementing,
    originalCVData,
    modifiedCVData,
    parsedRecommendations,
    coverLetter,
    handleImproveCV,
    handleCopyRecommendations,
    handleExportJobReport,
    handleImplementRecommendations,
    handleAcceptRecommendation,
    handleDismissRecommendation,
    handleAcceptAll,
    handleDismissAll,
  } = useCVAnalysis()

  const { calculateCompletion, getSectionStatus, getSectionPreview } = useCVCompletion()

  // Paywall check functions
  const checkPaywall = async (feature: Feature) => {
    try {
      const paywallInfo = await PaywallService.checkFeatureAccess(feature)
      
      // Only show paywall if we have valid paywallInfo and access is not allowed
      if (paywallInfo && !paywallInfo.allowed) {
        setPaywallModal({
          isOpen: true,
          feature,
          paywallInfo,
        })
        return false
      }
      
      return true
    } catch (error) {
      console.error("Error checking paywall:", error)
      // If paywall check fails, allow access to avoid blocking users
      return true
    }
  }

  const handlePaywallUpgrade = async (feature: Feature) => {
    try {
      const paywallInfo = await PaywallService.checkFeatureAccess(feature)
      
      // Only show paywall if we have valid paywallInfo
      if (paywallInfo) {
        setPaywallModal({
          isOpen: true,
          feature,
          paywallInfo,
        })
      }
    } catch (error) {
      console.error("Error checking feature access:", error)
    }
  }

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
        }, 500);
      };
    </script>
  </body>
</html>`

      printWindow.document.write(htmlContent)
      printWindow.document.close()
    } catch (error) {
      console.error("Error generating PDF:", error)
      setError("Failed to generate PDF. Please try again.")
    }
  }

  // Simple CV rendering fallback
  const renderSimpleCV = (cvData: CVData): string => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <header style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">${cvData.personalInfo?.name || "Your Name"}</h1>
          <p style="color: #7f8c8d; margin: 5px 0; font-size: 18px;">${cvData.personalInfo?.title || "Professional Title"}</p>
          <p style="color: #7f8c8d; margin: 5px 0;">${cvData.personalInfo?.email || "email@example.com"}</p>
          <p style="color: #7f8c8d; margin: 5px 0;">${cvData.personalInfo?.phone || "Phone Number"}</p>
        </header>
        
        ${cvData.personalInfo?.summary ? `
        <section style="margin-bottom: 25px;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;">Professional Summary</h2>
          <p style="line-height: 1.6;">${cvData.personalInfo.summary}</p>
        </section>
        ` : ""}
        
        ${cvData.experience && cvData.experience.length > 0 ? `
        <section style="margin-bottom: 25px;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;">Professional Experience</h2>
          ${cvData.experience.map(exp => `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #34495e; margin: 0;">${exp.title}</h3>
              <p style="color: #7f8c8d; margin: 5px 0; font-weight: bold;">${exp.company} | ${exp.startDate} - ${exp.endDate || "Present"}</p>
              <p style="line-height: 1.6;">${exp.description}</p>
            </div>
          `).join("")}
        </section>
        ` : ""}
        
        ${cvData.education && cvData.education.length > 0 ? `
        <section style="margin-bottom: 25px;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;">Education</h2>
          ${cvData.education.map(edu => `
            <div style="margin-bottom: 15px;">
              <h3 style="color: #34495e; margin: 0;">${edu.degree}</h3>
              <p style="color: #7f8c8d; margin: 5px 0;">${edu.institution} | ${edu.startDate} - ${edu.endDate || "Present"}</p>
            </div>
          `).join("")}
        </section>
        ` : ""}
        
        ${cvData.skills && cvData.skills.length > 0 ? `
        <section style="margin-bottom: 25px;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;">Skills</h2>
          <p style="line-height: 1.6;">${cvData.skills.join(", ")}</p>
        </section>
        ` : ""}
      </div>
    `
  }

  // CV update handler from analysis
  const handleCVUpdateFromAnalysis = (updatedCVData: CVData) => {
    setCVData(updatedCVData)
  }

  // Template change handler
  const handleApplyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  // Template change modal handler
  const handleTemplateChange = () => {
    setActiveModal("template")
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
  const handleImproveCVWrapper = async () => {
    const allowed = await checkPaywall("cv_optimizations")
    if (!allowed) return
    handleImproveCV(generateCVText, setError, setSuccess)
  }

  // Export job report handler
  const handleExportJobReportWrapper = () => {
    handleExportJobReport(cvData)
  }

  // Implement recommendations handler
  const handleImplementRecommendationsWrapper = async () => {
    const allowed = await checkPaywall("cv_optimizations")
    if (!allowed) return
    handleImplementRecommendations(cvData, generateCVText, setError, setSuccess)
  }

  // Save optimized CV handler
  const handleSaveOptimizedCV = (cvDataToSave: CVData) => {
    // Update the main CV builder state with the user's chosen CV version
    setCVData(cvDataToSave)
    setShowComparisonModal(false)
    // Save the chosen CV data to the database
    handleSaveClick(cvDataToSave)
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
              getSectionStatus={(section) => getSectionStatus(cvData, section)}
              getSectionPreview={(section) => getSectionPreview(cvData, section)}
              onFileUpload={handleFileUpload}
              onSaveClick={handleSaveClickWrapper}
              onDownloadPDF={downloadCVAsPDF}
              onCVUpdate={handleCVUpdateFromAnalysis}
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
              generateCoverLetter={generateCoverLetter}
              onJobDescriptionChange={setJobDescription}
              onImproveCV={handleImproveCVWrapper}
              onCopyRecommendations={handleCopyRecommendations}
              onExportJobReport={handleExportJobReportWrapper}
              onGenerateCoverLetterChange={setGenerateCoverLetter}
              onImplementRecommendations={handleImplementRecommendationsWrapper}
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

        {/* CV Comparison Modal */}
        <CVComparisonModal
          isOpen={showComparisonModal}
          originalCVData={originalCVData || cvData}
          modifiedCVData={modifiedCVData || cvData}
          recommendations={parsedRecommendations}
          coverLetter={coverLetter}
          selectedTemplate={selectedTemplate}
          isImplementing={isImplementing}
          onClose={() => setShowComparisonModal(false)}
          onAcceptRecommendation={handleAcceptRecommendation}
          onDismissRecommendation={handleDismissRecommendation}
          onAcceptAll={handleAcceptAll}
          onDismissAll={handleDismissAll}
          onSave={handleSaveOptimizedCV}
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

        {/* Paywall Modal */}
        <PaywallModal
          isOpen={paywallModal.isOpen}
          onClose={() => setPaywallModal({ isOpen: false, feature: null, paywallInfo: null })}
          paywallInfo={paywallModal.paywallInfo}
        />
      </div>
    </div>
  )
} 