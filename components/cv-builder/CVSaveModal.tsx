import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, RefreshCw } from "lucide-react"

interface CVSaveModalProps {
  showSaveModal: boolean
  cvTitle: string
  isSaving: boolean
  currentCVId: string | null
  onCvTitleChange: (title: string) => void
  onSave: () => void
  onClose: () => void
}

export const CVSaveModal = ({
  showSaveModal,
  cvTitle,
  isSaving,
  currentCVId,
  onCvTitleChange,
  onSave,
  onClose,
}: CVSaveModalProps) => {
  if (!showSaveModal) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white rounded-t-3xl">
          <h2 className="text-xl font-bold flex items-center">
            <Save className="w-6 h-6 mr-3" />
            {currentCVId ? "Update CV" : "Save CV"}
          </h2>
          <p className="text-blue-100 mt-2">Give your CV a descriptive name</p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="cv-title" className="text-sm font-medium text-gray-700 mb-2 block">
                CV Title *
              </Label>
              <Input
                id="cv-title"
                value={cvTitle}
                onChange={(e) => onCvTitleChange(e.target.value)}
                placeholder="e.g., Software Engineer CV - Tech Companies"
                className="border-2 border-gray-200 focus:border-blue-400 rounded-xl p-3"
                autoFocus
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-sm">
                {"💡 "}
                <strong>Tip:</strong>
                {
                  ' Use descriptive names like "Marketing Manager CV - Healthcare" or "Data Scientist CV - Startups" to easily find your CVs later.'
                }
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6 py-2 rounded-xl"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={isSaving || !cvTitle.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {currentCVId ? "Update CV" : "Save CV"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 