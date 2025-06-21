import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Upload,
  Download,
  Save,
  RefreshCw,
  Rocket,
  Brain,
  Wand2,
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
  showAISection: boolean
  recommendationsText: string
  isImplementing: boolean
  originalCVData: CVData | null
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSaveClick: () => void
  onDownloadPDF: () => void
  onCVUpdate: (updatedCVData: CVData) => void
  onShowAISection: (show: boolean) => void
  onRecommendationsTextChange: (text: string) => void
  onShowImplementModal: () => void
  onRevertToOriginal: () => void
  onTemplateChange: () => void
}

export const CVActionsPanel = ({
  cvData,
  selectedTemplate,
  isUploading,
  isSaving,
  showAISection,
  recommendationsText,
  isImplementing,
  originalCVData,
  onFileUpload,
  onSaveClick,
  onDownloadPDF,
  onCVUpdate,
  onShowAISection,
  onRecommendationsTextChange,
  onShowImplementModal,
  onRevertToOriginal,
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
          {/* AI Implementation Section */}
          <div className="border-t pt-4 mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              AI Implementation
              <span className="ml-auto px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                Pro
              </span>
            </h4>
            <div className="space-y-3">
              <Button
                onClick={() => onShowAISection(!showAISection)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                variant="outline"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                {showAISection ? "Hide" : "Implement AI Recommendations"}
              </Button>

              {showAISection && (
                <div className="space-y-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div>
                    <Label
                      htmlFor="recommendations-input"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Paste AI Recommendations Report
                    </Label>
                    <Textarea
                      id="recommendations-input"
                      value={recommendationsText}
                      onChange={(e) => onRecommendationsTextChange(e.target.value)}
                      placeholder="Paste your complete AI recommendations report here...

Example format:
• Add quantifiable metrics to your experience section
• Include relevant keywords like 'project management' and 'team leadership'
• Update your summary to highlight key achievements
• Consider adding certifications section"
                      rows={8}
                      className="border-2 border-purple-200 focus:border-purple-400 rounded-lg text-sm"
                    />
                  </div>

                  <div className="bg-purple-100 border border-purple-200 rounded-lg p-3">
                    <p className="text-purple-800 text-xs">
                      <strong>💡 How to use:</strong> Run &quot;AI Optimize&quot; → Copy recommendations →
                      Paste above → Click &quot;Parse & Implement&quot;
                    </p>
                    <p className="text-purple-700 text-xs mt-1">
                      <strong>📝 Tip:</strong> Make sure to paste the complete recommendations text with
                      specific suggestions, not just general advice.
                    </p>
                  </div>

                  <Button
                    onClick={onShowImplementModal}
                    disabled={
                      isImplementing ||
                      !recommendationsText.trim() ||
                      recommendationsText.trim().length < 50
                    }
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    size="sm"
                  >
                    {isImplementing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Parse & Implement ({recommendationsText.trim().length} chars)
                      </>
                    )}
                  </Button>
                </div>
              )}

              {originalCVData && (
                <Button
                  onClick={onRevertToOriginal}
                  className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Revert to Original
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 