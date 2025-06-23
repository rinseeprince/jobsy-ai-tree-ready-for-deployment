"use client"

import { Check } from "lucide-react"
import { COVER_LETTER_TEMPLATES, CoverLetterTemplate } from "@/lib/cover-letter-templates"

interface CoverLetterTemplatesTabProps {
  selectedTemplate: string
  onSelectTemplate: (templateId: string) => void
}

export const CoverLetterTemplatesTab = ({ selectedTemplate, onSelectTemplate }: CoverLetterTemplatesTabProps) => {
  return (
    <div className="p-6 bg-white border rounded-xl shadow-md">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Template</h2>
        <p className="text-gray-600">Select a professional template that matches your style</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COVER_LETTER_TEMPLATES.map((template: CoverLetterTemplate) => (
          <div
            key={template.id}
            className={`border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg shadow-md bg-white ${
              selectedTemplate === template.id
                ? "ring-2 ring-blue-500 border-blue-500 shadow-lg"
                : "border-gray-200 hover:border-blue-300"
            }`}
            onClick={() => onSelectTemplate(template.id)}
          >
            {/* Template Preview */}
            <div className="h-48 bg-gray-100 flex items-center justify-center">
              {template.preview ? (
                <img
                  src={template.preview}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2"></div>
                  <p className="text-sm">{template.name}</p>
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                {selectedTemplate === template.id && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              
              {/* Category Badge */}
              <div className="flex items-center justify-between">
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize">
                  {template.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          All templates are professionally designed and optimized for ATS systems
        </p>
      </div>
    </div>
  )
}

export default CoverLetterTemplatesTab;
