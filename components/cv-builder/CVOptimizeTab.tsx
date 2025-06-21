import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Target,
  TrendingUp,
  Star,
  Rocket,
  Brain,
  Lightbulb,
  Shield,
  Download,
  Copy,
  Check,
  RefreshCw,
  Wand2,
} from "lucide-react"

interface CVOptimizeTabProps {
  jobDescription: string
  isImproving: boolean
  improvementSuggestions: string
  isCopied: boolean
  onJobDescriptionChange: (description: string) => void
  onImproveCV: () => void
  onCopyRecommendations: () => void
  onExportJobReport: () => void
}

export const CVOptimizeTab = ({
  jobDescription,
  isImproving,
  improvementSuggestions,
  isCopied,
  onJobDescriptionChange,
  onImproveCV,
  onCopyRecommendations,
  onExportJobReport,
}: CVOptimizeTabProps) => {
  return (
    <div className="p-6 bg-white border rounded-xl shadow-md">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Brain className="w-6 h-6 text-blue-600" />
          Job-Specific CV Optimization
        </h2>
        <p className="text-gray-600 mb-4">
          Get targeted recommendations to maximize your chances for specific job applications
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-6">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-green-600" />
            <span>ATS Optimization</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span>Keyword Matching</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-purple-600" />
            <span>Impact Enhancement</span>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-green-800 font-medium">
            <Rocket className="w-5 h-5" />
            <span>Increase interview chances by up to 40% with job-specific optimization</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Description Input */}
        <div className="border rounded-lg p-6 shadow-md bg-white">
          <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-blue-600" />
            Target Job Description
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="job-description" className="mb-1 block font-medium">
                Paste the complete job posting you are applying for
              </Label>
              <p className="text-sm text-gray-600 mb-3">
                Include job title, requirements, responsibilities, and company information for best results
              </p>
              <Textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => onJobDescriptionChange(e.target.value)}
                placeholder="Paste the complete job description here..."
                rows={12}
                className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
              />
            </div>
            <Button
              onClick={onImproveCV}
              disabled={isImproving || !jobDescription.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6 shadow-lg"
              size="lg"
            >
              {isImproving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing & Optimizing...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Get Job-Specific Recommendations
                </>
              )}
            </Button>

            {/* Quick Check Upgrade Prompt */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">💡 Pro Tip</p>
                  <p className="text-blue-800">
                    Already ran a Quick CV Check? Great! Now optimize your improved CV for this specific job to
                    maximize your application success.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="border rounded-lg p-6 shadow-md bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2 min-w-0">
              <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <span className="break-words">Job-Specific Recommendations</span>
            </h3>
            {improvementSuggestions && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  onClick={onExportJobReport}
                  size="sm"
                  className="flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700 text-white border-0 px-3 py-2 whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  Export Report
                </Button>
                <Button
                  onClick={onCopyRecommendations}
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-2 text-sm transition-all duration-200 px-3 py-2 whitespace-nowrap ${
                    isCopied ? "bg-green-50 border-green-300 text-green-700 scale-95" : "hover:bg-gray-50"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
          {improvementSuggestions ? (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Job-Specific Analysis Complete</span>
                </div>
                <p className="text-green-700 text-sm">
                  Your CV has been analyzed against this specific jobs requirements. These recommendations are
                  tailored to help you pass ATS screening and impress hiring managers.
                </p>
              </div>
              <div className="prose prose-sm max-w-none">
                <div
                  className="text-gray-700 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: improvementSuggestions }}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for Job-Specific Optimization</h3>
              <p className="text-gray-600 mb-6">
                Add a job description to get personalized recommendations that match the specific requirements
                and keywords employers are looking for.
              </p>
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="flex items-center justify-center gap-2 text-blue-600 bg-blue-50 rounded-lg p-3">
                  <Shield className="w-4 h-4" />
                  <span>ATS Keyword Optimization</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 rounded-lg p-3">
                  <Target className="w-4 h-4" />
                  <span>Role-Specific Tailoring</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-purple-600 bg-purple-50 rounded-lg p-3">
                  <TrendingUp className="w-4 h-4" />
                  <span>Impact Enhancement</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 