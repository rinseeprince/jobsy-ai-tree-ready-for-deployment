import { Button } from "@/components/ui/button"
import { Brain, X, Check, RefreshCw, Wand2 } from "lucide-react"

interface Recommendation {
  section: string
  recommendation: string
  impact: string
  type: string
}

interface CVAIImplementationModalProps {
  showImplementModal: boolean
  isImplementing: boolean
  parsedRecommendations: Recommendation[]
  selectedRecommendations: string[]
  onClose: () => void
  onRecommendationToggle: (index: string) => void
  onSelectNone: () => void
  onSelectAll: () => void
  onApplySelected: () => void
  onApplyAll: () => void
}

export const CVAIImplementationModal = ({
  showImplementModal,
  isImplementing,
  parsedRecommendations,
  selectedRecommendations,
  onClose,
  onRecommendationToggle,
  onSelectNone,
  onSelectAll,
  onApplySelected,
  onApplyAll,
}: CVAIImplementationModalProps) => {
  if (!showImplementModal) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center">
              <Brain className="w-6 h-6 mr-3" />
              Implement AI Recommendations
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-xl"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-purple-100 mt-2">Select which recommendations to apply to your CV</p>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {parsedRecommendations.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  {selectedRecommendations.length} of {parsedRecommendations.length} recommendations selected
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onSelectNone}>
                    Select None
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSelectAll}
                  >
                    Select All
                  </Button>
                </div>
              </div>

              {parsedRecommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={`rec-${index}`}
                      checked={selectedRecommendations.includes(index.toString())}
                      onChange={() => onRecommendationToggle(index.toString())}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{rec.section}</h4>
                      <p className="text-sm text-gray-700 mb-2">{rec.recommendation}</p>
                      {rec.impact && (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Impact: {rec.impact}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No recommendations found. Please paste a valid AI recommendations report.
              </p>
            </div>
          )}
        </div>

        <div className="border-t p-6">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isImplementing}>
              Cancel
            </Button>
            <Button
              onClick={onApplySelected}
              disabled={isImplementing || selectedRecommendations.length === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isImplementing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Implementing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Apply Selected ({selectedRecommendations.length})
                </>
              )}
            </Button>
            <Button
              onClick={onApplyAll}
              disabled={isImplementing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isImplementing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Implementing...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Apply All
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 