"use client"

import { Target } from "lucide-react"
import { type CoverLetterData } from "@/lib/cover-letter-templates"
import { renderCoverLetterTemplate, getCoverLetterTemplateById } from "@/lib/cover-letter-templates"

interface CoverLetterPreviewTabProps {
  coverLetterData: CoverLetterData
  selectedTemplate: string
}

export const CoverLetterPreviewTab = ({ coverLetterData, selectedTemplate }: CoverLetterPreviewTabProps) => {
  // Get the selected template
  const template = getCoverLetterTemplateById(selectedTemplate)

  if (!template) {
    return (
      <div className="text-center p-8 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
          <Target className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Template Selected</h3>
        <p className="text-gray-600">Please select a template to preview your cover letter</p>
      </div>
    )
  }

  // Check if we have the minimum required data (just job info and content)
  const hasRequiredData = coverLetterData.jobInfo.jobTitle && 
                         coverLetterData.jobInfo.companyName &&
                         (coverLetterData.content.opening || coverLetterData.content.body || coverLetterData.content.closing)

  if (!hasRequiredData) {
    return (
      <div className="text-center p-8 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
          <Target className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Incomplete Information</h3>
        <p className="text-gray-600">
          Please fill in job title, company name, and add some content to preview your cover letter
        </p>
      </div>
    )
  }

  // Render the cover letter with the selected template
  const renderedHTML = renderCoverLetterTemplate(coverLetterData, template)

  return (
    <div className="bg-white border rounded-xl shadow-md overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Cover Letter Preview</h2>
        <p className="text-gray-600">
          Preview how your cover letter will look with the &ldquo;{template.name}&rdquo; template
        </p>
      </div>
      
      <div className="p-6">
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <div dangerouslySetInnerHTML={{ __html: renderedHTML }} />
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            This is how your cover letter will appear when downloaded as PDF
          </p>
        </div>
      </div>
    </div>
  )
}

export default CoverLetterPreviewTab;
