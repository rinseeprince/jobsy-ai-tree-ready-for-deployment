import { Check } from "lucide-react"
import { CV_TEMPLATES, renderTemplate } from "@/lib/cv-templates"
import { type CVData } from "@/lib/cv-templates"

interface CVTemplatesTabProps {
  cvData: CVData
  selectedTemplate: string
  onApplyTemplate: (templateId: string) => void
}

export const CVTemplatesTab = ({ cvData, selectedTemplate, onApplyTemplate }: CVTemplatesTabProps) => {
  return (
    <div className="p-6 bg-white border rounded-xl shadow-md">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Template</h2>
        <p className="text-gray-600">Select a professional template that matches your style</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CV_TEMPLATES.map((template) => (
          <div
            key={template.id}
            className={`border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg shadow-md bg-white ${
              selectedTemplate === template.id
                ? "ring-2 ring-blue-500 border-blue-500 shadow-lg"
                : "border-gray-200 hover:border-blue-300"
            }`}
            onClick={() => onApplyTemplate(template.id)}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">{template.name}</h3>
                {selectedTemplate === template.id && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>

              {/* Template Preview */}
              <div className="bg-gray-50 rounded-lg p-2 mb-4 h-64 overflow-hidden relative">
                <div
                  className="text-xs leading-tight text-gray-700 transform scale-50 origin-top-left w-[200%] h-[200%]"
                  style={{
                    fontSize: "6px",
                    lineHeight: "1.2",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: renderTemplate(cvData, template),
                  }}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {template.features?.map((feature, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {feature}
                  </span>
                )) || (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Professional</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 