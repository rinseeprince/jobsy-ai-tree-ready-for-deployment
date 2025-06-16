"use client"
import { Target } from "lucide-react"
import { CV_TEMPLATES, type CVData } from "@/lib/cv-templates"
import { renderTemplate } from "@/lib/template-renderer"

interface CVPreviewProps {
  cvData: CVData
  templateId?: string
}

export function CVPreview({ cvData, templateId }: CVPreviewProps) {
  // Get the selected template
  const template = templateId ? CV_TEMPLATES.find((t) => t.id === templateId) : null

  if (!template) {
    return (
      <div className="text-center p-8 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
          <Target className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Template Selected</h3>
        <p className="text-gray-600">Please select a template to preview your CV</p>
      </div>
    )
  }

  // Render the CV with the selected template
  const renderedHTML = renderTemplate(cvData, template)

  return (
    <div className="bg-white">
      <div dangerouslySetInnerHTML={{ __html: renderedHTML }} />
    </div>
  )
}
