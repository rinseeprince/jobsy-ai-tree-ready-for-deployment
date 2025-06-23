import { CVActionsPanel } from "./CVActionsPanel"
import { CVSectionsPanel } from "./CVSectionsPanel"
import { type CVData } from "@/lib/cv-templates"

interface CVBuildTabProps {
  cvData: CVData
  selectedTemplate: string
  isUploading: boolean
  isSaving: boolean
  getSectionStatus: (section: string) => boolean
  getSectionPreview: (section: string) => string
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSaveClick: () => void
  onDownloadPDF: () => void
  onCVUpdate: (updatedCVData: CVData) => void
  onTemplateChange: () => void
  onSectionClick: (modal: string) => void
}

export const CVBuildTab = ({
  cvData,
  selectedTemplate,
  isUploading,
  isSaving,
  getSectionStatus,
  getSectionPreview,
  onFileUpload,
  onSaveClick,
  onDownloadPDF,
  onCVUpdate,
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
          onFileUpload={onFileUpload}
          onSaveClick={onSaveClick}
          onDownloadPDF={onDownloadPDF}
          onCVUpdate={onCVUpdate}
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