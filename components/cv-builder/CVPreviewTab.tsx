import { Target } from "lucide-react"
import { CVPreview } from "@/components/cv-editor/cv-preview"
import { type CVData } from "@/lib/cv-templates"

interface CVPreviewTabProps {
  cvData: CVData
  selectedTemplate: string
}

export const CVPreviewTab = ({ cvData, selectedTemplate }: CVPreviewTabProps) => {
  return (
    <div className="p-6 bg-white border rounded-xl shadow-md">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">CV Preview</h2>
        <p className="text-gray-600">See how your CV will look to employers</p>
      </div>

      <div className="bg-blue-600 text-white p-6 rounded-t-lg">
        <h3 className="text-xl font-medium flex items-center gap-2">
          <Target className="w-5 h-5" />
          Template Preview
        </h3>
        <p className="text-blue-100 mt-1">Live preview of your CV with the selected template</p>
      </div>

      <div className="border border-t-0 rounded-b-lg p-6 bg-white">
        <CVPreview cvData={cvData} templateId={selectedTemplate} />
      </div>
    </div>
  )
} 