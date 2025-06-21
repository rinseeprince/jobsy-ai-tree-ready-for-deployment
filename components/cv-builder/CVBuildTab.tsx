import { CVActionsPanel } from "./CVActionsPanel"
import { CVSectionsPanel } from "./CVSectionsPanel"
import { type CVData } from "@/lib/cv-templates"

interface CVBuildTabProps {
  cvData: CVData
  selectedTemplate: string
  isUploading: boolean
  isSaving: boolean
  showAISection: boolean
  recommendationsText: string
  isImplementing: boolean
  originalCVData: CVData | null
  getSectionStatus: (section: string) => boolean
  getSectionPreview: (section: string) => string
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSaveClick: () => void
  onDownloadPDF: () => void
  onCVUpdate: (updatedCVData: CVData) => void
  onShowAISection: (show: boolean) => void
  onRecommendationsTextChange: (text: string) => void
  onShowImplementModal: () => void
  onRevertToOriginal: () => void
  onTemplateChange: () => void
  onSectionClick: (modal: string) => void
}

export const CVBuildTab = ({
  cvData,
  selectedTemplate,
  isUploading,
  isSaving,
  showAISection,
  recommendationsText,
  isImplementing,
  originalCVData,
  getSectionStatus,
  getSectionPreview,
  onFileUpload,
  onSaveClick,
  onDownloadPDF,
  onCVUpdate,
  onShowAISection,
  onRecommendationsTextChange,
  onShowImplementModal,
  onRevertToOriginal,
  onTemplateChange,
  onSectionClick,
}: CVBuildTabProps) => {
  return (
    <div className="p-6 bg-white border rounded-xl shadow-md">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upload & Quick Actions */}
        <CVActionsPanel
          cvData={cvData}
          selectedTemplate={selectedTemplate}
          isUploading={isUploading}
          isSaving={isSaving}
          showAISection={showAISection}
          recommendationsText={recommendationsText}
          isImplementing={isImplementing}
          originalCVData={originalCVData}
          onFileUpload={onFileUpload}
          onSaveClick={onSaveClick}
          onDownloadPDF={onDownloadPDF}
          onCVUpdate={onCVUpdate}
          onShowAISection={onShowAISection}
          onRecommendationsTextChange={onRecommendationsTextChange}
          onShowImplementModal={onShowImplementModal}
          onRevertToOriginal={onRevertToOriginal}
          onTemplateChange={onTemplateChange}
        />

        {/* Middle Column - Collapsible CV Sections */}
        <CVSectionsPanel
          cvData={cvData}
          getSectionStatus={getSectionStatus}
          getSectionPreview={getSectionPreview}
          onSectionClick={onSectionClick}
        />
      </div>
    </div>
  )
} 