"use client"

import { Button } from "@/components/ui/button"
import { Download, Save } from "lucide-react"

interface CoverLetterBuilderHeaderProps {
  onSave: () => void
  onDownloadPDF: () => void
  isSaving: boolean
  error: string | null
  success: string | null
}

export const CoverLetterBuilderHeader = ({
  onSave,
  onDownloadPDF,
  isSaving,
  error,
  success,
}: CoverLetterBuilderHeaderProps) => {
  return (
    <div className="bg-white border rounded-xl shadow-md p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cover Letter Builder</h1>
          <p className="text-gray-600 mt-2">
            Create a professional cover letter tailored to your job application
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onDownloadPDF}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Cover Letter"}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}
    </div>
  )
}

export default CoverLetterBuilderHeader;
