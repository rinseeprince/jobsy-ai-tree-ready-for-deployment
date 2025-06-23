import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Upload,
  Download,
  Save,
  RefreshCw,
  Rocket,
  Layout,
  Check,
} from "lucide-react"
import { CVAnalysisButton } from "@/components/cv-analysis-button"
import { type CVData } from "@/lib/cv-templates"
import { CV_TEMPLATES } from "@/lib/cv-templates"

interface CVActionsPanelProps {
  cvData: CVData
  selectedTemplate: string
  isUploading: boolean
  isSaving: boolean
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSaveClick: () => void
  onDownloadPDF: () => void
  onCVUpdate: (updatedCVData: CVData) => void
  onTemplateChange: () => void
}

export const CVActionsPanel = ({
  cvData,
  selectedTemplate,
  isUploading,
  isSaving,
  onFileUpload,
  onSaveClick,
  onDownloadPDF,
  onCVUpdate,
  onTemplateChange,
}: CVActionsPanelProps) => {
  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="border border-dashed border-blue-300 rounded-lg p-6 hover:border-blue-500 transition-colors shadow-md">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-blue-700 mb-2">Quick Start</h3>
          <p className="text-gray-600 mb-4">Upload your existing CV to get started instantly</p>
          <Button
            onClick={() => document.getElementById("cv-upload")?.click()}
            disabled={isUploading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload CV
              </>
            )}
          </Button>
          <Input
            id="cv-upload"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={onFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Selected Template */}
      <div className="border rounded-lg p-6 shadow-md bg-white">
        <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
          <Layout className="w-5 h-5 text-blue-600" />
          Selected Template
        </h3>
        <div className="space-y-4">
          {CV_TEMPLATES.filter((template) => template.id === selectedTemplate).map((template) => (
            <div key={template.id} className="p-4 border border-gray-200 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={onTemplateChange}
            className="w-full border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          >
            Change Template
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="border rounded-lg p-6 shadow-md bg-white">
        <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
          <Rocket className="w-5 h-5 text-blue-600" />
          Actions
        </h3>
        <div className="space-y-3">
          <Button
            onClick={onSaveClick}
            disabled={isSaving}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save CV
          </Button>
          <CVAnalysisButton
            cvData={cvData}
            className="w-full h-10"
            variant="outline"
            onCVUpdate={onCVUpdate}
          />
          <Button onClick={onDownloadPDF} className="w-full" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  )
} 