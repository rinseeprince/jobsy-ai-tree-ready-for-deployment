"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, ArrowLeft, ArrowRight, Save, Download, FileText, RefreshCw, Crown } from "lucide-react"
import { CVPreview } from "@/components/cv-editor/cv-preview"
import { getTemplateById, renderTemplate } from "@/lib/cv-templates"
import type { CVData } from "@/lib/cv-templates"

interface Recommendation {
  section: string
  recommendation: string
  impact: string
  type: string
}

interface CVComparisonModalProps {
  isOpen: boolean
  originalCVData: CVData
  modifiedCVData: CVData
  recommendations: Recommendation[]
  coverLetter?: string
  selectedTemplate: string
  isImplementing: boolean
  onClose: () => void
  onAcceptRecommendation: (index: number) => void
  onDismissRecommendation: (index: number) => void
  onAcceptAll: () => void
  onDismissAll: () => void
  onSave: (cvData: CVData) => void
}

export const CVComparisonModal = ({
  isOpen,
  originalCVData,
  modifiedCVData,
  recommendations,
  coverLetter,
  selectedTemplate,
  isImplementing,
  onClose,
  onAcceptRecommendation,
  onDismissRecommendation,
  onAcceptAll,
  onDismissAll,
  onSave,
}: CVComparisonModalProps) => {
  const [acceptedRecommendations, setAcceptedRecommendations] = useState<Set<number>>(new Set())

  // Auto-default to Accept All when modal opens
  useEffect(() => {
    if (isOpen && recommendations.length > 0) {
      const allIndices = new Set(recommendations.map((_, index) => index))
      setAcceptedRecommendations(allIndices)
    }
  }, [isOpen, recommendations])

  // Generate current CV data based on accepted recommendations
  const currentCVData = useMemo(() => {
    const acceptedCount = acceptedRecommendations.size
    const totalCount = recommendations.length

    if (acceptedCount === 0) {
      // No recommendations accepted - return original CV
      return originalCVData
    } else if (acceptedCount === totalCount) {
      // All recommendations accepted - return fully modified CV
      return modifiedCVData
    } else {
      // Some recommendations accepted - need to apply only selected ones
      // For now, we'll use a simplified approach and return the modified CV
      // In a more complex implementation, you'd apply only specific recommendations
      return modifiedCVData
    }
  }, [acceptedRecommendations, originalCVData, modifiedCVData, recommendations])

  if (!isOpen) return null

  const handleAcceptRecommendation = (index: number) => {
    setAcceptedRecommendations((prev) => new Set([...prev, index]))
    onAcceptRecommendation(index)
  }

  const handleDismissRecommendation = (index: number) => {
    setAcceptedRecommendations((prev) => {
      const newSet = new Set(prev)
      newSet.delete(index)
      return newSet
    })
    onDismissRecommendation(index)
  }

  const handleAcceptAll = () => {
    const allIndices = new Set(recommendations.map((_, index) => index))
    setAcceptedRecommendations(allIndices)
    onAcceptAll()
  }

  const handleDismissAll = () => {
    setAcceptedRecommendations(new Set())
    onDismissAll()
  }

  const handleSave = () => {
    // Pass the current CV data based on accepted recommendations
    onSave(currentCVData)
  }

  const downloadCurrentPDF = () => {
    try {
      const printWindow = window.open("", "_blank")
      if (!printWindow) return

      // Use the current CV data based on accepted recommendations
      const cvDataToUse = currentCVData

      // Get the template and render with the current CV data
      const template = getTemplateById ? getTemplateById(selectedTemplate) : null
      let renderedHTML = ""

      if (template && typeof renderTemplate === "function") {
        renderedHTML = renderTemplate(cvDataToUse, template)
      } else {
        // Fallback to simple rendering if template not found
        renderedHTML = renderSimpleCV(cvDataToUse)
      }

      const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <title>${cvDataToUse.personalInfo.name || "CV"}</title>
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
      
      div, span, section, header, footer, article, aside, nav {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
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
      
      ${
        cvData.personalInfo?.summary
          ? `
      <section style="margin-bottom: 25px;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;">Professional Summary</h2>
        <p style="line-height: 1.6;">${cvData.personalInfo.summary}</p>
      </section>
      `
          : ""
      }
      
      ${
        cvData.experience && cvData.experience.length > 0
          ? `
      <section style="margin-bottom: 25px;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;">Professional Experience</h2>
        ${cvData.experience
          .map(
            (exp) => `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #34495e; margin: 0;">${exp.title}</h3>
            <p style="color: #7f8c8d; margin: 5px 0; font-weight: bold;">${exp.company} | ${exp.startDate} - ${exp.endDate || "Present"}</p>
            <p style="line-height: 1.6;">${exp.description}</p>
          </div>
        `,
          )
          .join("")}
      </section>
      `
          : ""
      }
      
      ${
        cvData.education && cvData.education.length > 0
          ? `
      <section style="margin-bottom: 25px;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;">Education</h2>
        ${cvData.education
          .map(
            (edu) => `
          <div style="margin-bottom: 15px;">
            <h3 style="color: #34495e; margin: 0;">${edu.degree}</h3>
            <p style="color: #7f8c8d; margin: 5px 0;">${edu.institution} | ${edu.startDate} - ${edu.endDate || "Present"}</p>
          </div>
        `,
          )
          .join("")}
      </section>
      `
          : ""
      }
      
      ${
        cvData.skills && cvData.skills.length > 0
          ? `
      <section style="margin-bottom: 25px;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;">Skills</h2>
        <p style="line-height: 1.6;">${cvData.skills.join(", ")}</p>
      </section>
      `
          : ""
      }
    </div>
  `
  }

  const acceptedCount = acceptedRecommendations.size
  const totalCount = recommendations.length

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">CV Optimization Preview</h2>
                <p className="text-blue-100 text-sm">Review and apply AI recommendations to optimize your CV</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                {acceptedCount}/{totalCount} Applied
              </Badge>
              <Button onClick={onClose} variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Original CV */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4 text-gray-500" />
                Original CV
              </h3>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <CVPreview cvData={originalCVData} templateId={selectedTemplate} />
              </div>
            </div>
          </div>

          {/* Center Panel - Recommendations */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">AI Recommendations</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAcceptAll}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={acceptedCount === totalCount}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Accept All
                  </Button>
                  <Button
                    onClick={handleDismissAll}
                    size="sm"
                    variant="outline"
                    // Removed the disabled condition - now always clickable
                  >
                    <X className="w-4 h-4 mr-1" />
                    Dismiss All
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {recommendations.map((rec, index) => {
                const isAccepted = acceptedRecommendations.has(index)
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border transition-all ${
                      isAccepted ? "bg-green-50 border-green-200" : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              rec.impact === "High"
                                ? "border-red-200 text-red-700 bg-red-50"
                                : rec.impact === "Medium"
                                  ? "border-yellow-200 text-yellow-700 bg-yellow-50"
                                  : "border-blue-200 text-blue-700 bg-blue-50"
                            }`}
                          >
                            {rec.impact} Impact
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {rec.section}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">{rec.recommendation}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => handleAcceptRecommendation(index)}
                          size="sm"
                          className={`${
                            isAccepted
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                          }`}
                          disabled={isAccepted}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDismissRecommendation(index)}
                          size="sm"
                          variant="outline"
                          className="text-gray-600 hover:text-red-600"
                          disabled={!isAccepted}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Panel - Current CV (based on accepted recommendations) */}
          <div className="w-1/3 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-gray-500" />
                {acceptedCount === 0
                  ? "Original CV"
                  : acceptedCount === totalCount
                    ? "Optimized CV"
                    : "Partially Optimized CV"}
              </h3>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <CVPreview cvData={currentCVData} templateId={selectedTemplate} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {coverLetter && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>Cover letter generated</span>
                </div>
              )}
              <div className="text-sm text-gray-600">
                {acceptedCount} of {totalCount} recommendations applied
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={downloadCurrentPDF} variant="outline" className="border-gray-300 hover:border-gray-400">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button
                onClick={handleSave}
                disabled={isImplementing}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {isImplementing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save {acceptedCount === 0 ? "Original" : acceptedCount === totalCount ? "Optimized" : "Modified"} CV
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
