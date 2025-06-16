"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  X,
  Brain,
  Target,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  BarChart3,
  Zap,
  Award,
  Eye,
  Download,
  RefreshCw,
  Check,
  XCircle,
} from "lucide-react"
import type { CVData } from "@/lib/cv-templates"

interface AnalysisResults {
  success: boolean
  results?: {
    atsScore: {
      overall: number
      breakdown: {
        formatting: number
        keywords: number
        structure: number
        readability: number
        fileFormat: number
      }
      recommendations: string[]
      passRate: string
    }
    contentQuality: {
      overall: number
      grammar: {
        score: number
        issues: Array<{
          type: string
          message: string
          suggestion: string
          severity: string
          originalText?: string
          correctedText?: string
          location?: string
        }>
      }
      impact: {
        score: number
        weakVerbs: Array<
          | {
              verb: string
              originalSentence: string
              improvedSentence: string
              location: string
            }
          | string
        >
        missingQuantification: Array<
          | {
              originalText: string
              suggestedText: string
              location: string
              metricType: string
            }
          | string
        >
        passiveVoiceCount: number
        passiveVoiceExamples?: Array<{
          originalText: string
          improvedText: string
          location: string
        }>
      }
      clarity: {
        score: number
        avgSentenceLength: number
        readabilityScore: number
        improvementSuggestions?: Array<{
          issue: string
          originalText: string
          improvedText: string
          location: string
        }>
      }
    }
    lengthAnalysis: {
      wordCount: number
      pageEstimate: number
      recommendation: string
      isOptimal: boolean
      sectionsAnalysis?: {
        tooLong: string[]
        tooShort: string[]
        suggestions: string[]
      }
    }
    industryFit?: {
      score: number
      matchedKeywords: Array<
        | {
            keyword: string
            context: string
            relevance: string
          }
        | string
      >
      missingKeywords: Array<
        | {
            keyword: string
            importance: string
            suggestedPlacement: string
            exampleUsage: string
          }
        | string
      >
      recommendations: string[]
    }
  }
  error?: string
}

interface CVAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  results: AnalysisResults | null
  onReanalyze?: () => void
  cvData?: CVData
  onUpdateCV?: (updatedCV: CVData) => void
}

function CVAnalysisModal({ isOpen, onClose, results, onReanalyze, cvData, onUpdateCV }: CVAnalysisModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "recommendations">("overview")
  const [editableCVData, setEditableCVData] = useState<CVData | undefined>(cvData)
  const [appliedChanges, setAppliedChanges] = useState<string[]>([])
  const [dismissedChanges, setDismissedChanges] = useState<string[]>([])

  if (!isOpen) return null

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBackground = (score: number): string => {
    if (score >= 80) return "bg-green-100"
    if (score >= 60) return "bg-yellow-100"
    return "bg-red-100"
  }

  const getPassRateIcon = (passRate: string) => {
    switch (passRate.toLowerCase()) {
      case "high":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "medium":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case "low":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Target className="w-5 h-5 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const handleApplyChange = (changeId: string, updatedText: string, section: string, fieldPath: string) => {
    if (!editableCVData || !onUpdateCV) return

    // Deep clone the CV data
    const newCVData = JSON.parse(JSON.stringify(editableCVData)) as CVData

    // Apply the change based on section and field path
    if (section === "personalInfo" && newCVData.personalInfo) {
      const personalInfo = newCVData.personalInfo as Record<string, string>
      personalInfo[fieldPath] = updatedText
    } else if (section === "experience") {
      const match = fieldPath.match(/experience\[(\d+)\]\.(.+)/)
      if (match && newCVData.experience) {
        const index = Number.parseInt(match[1])
        const field = match[2]
        if (newCVData.experience[index] && field) {
          const experienceItem = newCVData.experience[index] as Record<string, unknown>
          experienceItem[field] = updatedText
        }
      }
    } else if (section === "education") {
      const match = fieldPath.match(/education\[(\d+)\]\.(.+)/)
      if (match && newCVData.education) {
        const index = Number.parseInt(match[1])
        const field = match[2]
        if (newCVData.education[index] && field) {
          const educationItem = newCVData.education[index] as Record<string, unknown>
          educationItem[field] = updatedText
        }
      }
    } else if (section === "skills") {
      newCVData.skills = updatedText.split(",").map((skill) => skill.trim())
    } else if (section === "certifications") {
      const match = fieldPath.match(/certifications\[(\d+)\]\.(.+)/)
      if (match && newCVData.certifications) {
        const index = Number.parseInt(match[1])
        const field = match[2]
        if (newCVData.certifications[index] && field) {
          const certificationItem = newCVData.certifications[index] as Record<string, unknown>
          certificationItem[field] = updatedText
        }
      }
    }

    // Update the CV data
    setEditableCVData(newCVData)
    onUpdateCV(newCVData)

    // Mark as applied
    setAppliedChanges([...appliedChanges, changeId])
  }

  const handleDismissChange = (changeId: string) => {
    setDismissedChanges([...dismissedChanges, changeId])
  }

  const isChangeApplied = (changeId: string) => appliedChanges.includes(changeId)
  const isChangeDismissed = (changeId: string) => dismissedChanges.includes(changeId)

  if (!results) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Brain className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Results</h3>
          <p className="text-gray-600 mb-6">Please run an analysis first to see results.</p>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    )
  }

  if (!results.success || !results.results) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
          <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 text-white rounded-t-3xl">
            <h2 className="text-xl font-bold flex items-center">
              <AlertCircle className="w-6 h-6 mr-3" />
              Analysis Failed
            </h2>
            <p className="text-red-100 mt-2">Unable to analyze your CV</p>
          </div>

          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-gray-700">{results.error || "An unexpected error occurred"}</p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {onReanalyze && (
                <Button onClick={onReanalyze} className="bg-red-600 hover:bg-red-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { atsScore, contentQuality, lengthAnalysis, industryFit } = results.results

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Brain className="w-7 h-7 mr-3" />
                CV Analysis Results
              </h2>
              <p className="text-purple-100 mt-2">AI-powered insights to improve your CV</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20 rounded-full">
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b bg-gray-50 px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-purple-600 text-purple-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2 inline" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab("details")}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "details"
                  ? "border-purple-600 text-purple-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              <Eye className="w-4 h-4 mr-2 inline" />
              Detailed Analysis
            </button>
            <button
              onClick={() => setActiveTab("recommendations")}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "recommendations"
                  ? "border-purple-600 text-purple-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              <Lightbulb className="w-4 h-4 mr-2 inline" />
              Recommendations
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Debug Info Card */}
              {cvData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">📊 Analysis Data Source</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>
                      <strong>CV Name:</strong> {cvData.personalInfo?.name || "Not provided"}
                    </p>
                    <p>
                      <strong>Email:</strong> {cvData.personalInfo?.email || "Not provided"}
                    </p>
                    <p>
                      <strong>Experience Entries:</strong> {cvData.experience?.length || 0}
                    </p>
                    <p>
                      <strong>Skills:</strong> {cvData.skills?.length || 0}
                    </p>
                    <p>
                      <strong>Word Count:</strong> {lengthAnalysis?.wordCount || 0}
                    </p>
                  </div>
                </div>
              )}

              {/* Overall Scores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* ATS Score */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">ATS Score</h3>
                        <p className="text-sm text-gray-600">Applicant Tracking System</p>
                      </div>
                    </div>
                    {getPassRateIcon(atsScore.passRate)}
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl font-bold text-blue-600">{atsScore.overall}</span>
                      <span className="text-sm font-medium text-gray-600">/ 100</span>
                    </div>
                    <Progress value={atsScore.overall} className="h-3" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Pass Rate:</span>
                    <span className={`text-sm font-bold ${getScoreColor(atsScore.overall)}`}>{atsScore.passRate}</span>
                  </div>
                </div>

                {/* Content Quality */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Content Quality</h3>
                        <p className="text-sm text-gray-600">Grammar {"&"} Impact</p>
                      </div>
                    </div>
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl font-bold text-green-600">{contentQuality.overall}</span>
                      <span className="text-sm font-medium text-gray-600">/ 100</span>
                    </div>
                    <Progress value={contentQuality.overall} className="h-3" />
                  </div>
                  <div className="text-sm text-gray-600">
                    {contentQuality.grammar.issues.length} grammar issues found
                  </div>
                </div>

                {/* Length Analysis */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Length Analysis</h3>
                        <p className="text-sm text-gray-600">Word Count {"&"} Pages</p>
                      </div>
                    </div>
                    {lengthAnalysis.isOptimal ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Words:</span>
                      <span className="text-sm font-medium">{lengthAnalysis.wordCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pages:</span>
                      <span className="text-sm font-medium">{lengthAnalysis.pageEstimate}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">{lengthAnalysis.recommendation}</div>
                  </div>
                </div>
              </div>

              {/* Industry Fit (if available) */}
              {industryFit && (
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Industry Fit Analysis</h3>
                      <p className="text-sm text-gray-600">Keyword matching and relevance</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-orange-600 mb-1">{industryFit.score}</div>
                      <div className="text-sm text-gray-600">Industry Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600 mb-1">{industryFit.matchedKeywords.length}</div>
                      <div className="text-sm text-gray-600">Matched Keywords</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600 mb-1">{industryFit.missingKeywords.length}</div>
                      <div className="text-sm text-gray-600">Missing Keywords</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* ATS Breakdown */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  ATS Score Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {Object.entries(atsScore.breakdown).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div
                        className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${getScoreBackground(value)}`}
                      >
                        <span className={`text-lg font-bold ${getScoreColor(value)}`}>{value}</span>
                      </div>
                      <div className="text-sm font-medium text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Quality Details */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-green-600" />
                  Content Quality Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Grammar */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Grammar Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Score:</span>
                        <span className={`text-sm font-medium ${getScoreColor(contentQuality.grammar.score)}`}>
                          {contentQuality.grammar.score}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Issues:</span>
                        <span className="text-sm font-medium">{contentQuality.grammar.issues.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Impact */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Impact Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Score:</span>
                        <span className={`text-sm font-medium ${getScoreColor(contentQuality.impact.score)}`}>
                          {contentQuality.impact.score}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Weak Verbs:</span>
                        <span className="text-sm font-medium">{contentQuality.impact.weakVerbs.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Passive Voice:</span>
                        <span className="text-sm font-medium">{contentQuality.impact.passiveVoiceCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Clarity */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Clarity Analysis</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Score:</span>
                        <span className={`text-sm font-medium ${getScoreColor(contentQuality.clarity.score)}`}>
                          {contentQuality.clarity.score}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg Sentence:</span>
                        <span className="text-sm font-medium">{contentQuality.clarity.avgSentenceLength} words</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Readability:</span>
                        <span className="text-sm font-medium">{contentQuality.clarity.readabilityScore}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grammar Issues */}
              {contentQuality.grammar.issues.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                    Grammar Issues ({contentQuality.grammar.issues.length})
                  </h3>
                  <div className="space-y-3">
                    {contentQuality.grammar.issues.map((issue, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm mb-1">{issue.message}</div>
                            {issue.originalText && (
                              <div className="text-sm bg-red-50 p-2 rounded mb-1 border border-red-100">
                                <span className="font-medium">Original: </span>
                                {issue.originalText}
                              </div>
                            )}
                            {issue.correctedText && (
                              <div className="text-sm bg-green-50 p-2 rounded mb-1 border border-green-100">
                                <span className="font-medium">Corrected: </span>
                                {issue.correctedText}
                              </div>
                            )}
                            <div className="text-sm opacity-80">{issue.suggestion}</div>
                            {issue.location && (
                              <div className="text-xs text-gray-500 mt-1">Location: {issue.location}</div>
                            )}
                          </div>
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50 capitalize">
                            {issue.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weak Verbs */}
              {contentQuality.impact.weakVerbs.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-orange-600" />
                    Weak Verbs ({contentQuality.impact.weakVerbs.length})
                  </h3>
                  <div className="space-y-3">
                    {contentQuality.impact.weakVerbs.map((item, index) => {
                      // Handle both string and object formats
                      if (typeof item === "string") {
                        return (
                          <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="text-sm text-gray-700">{item}</div>
                          </div>
                        )
                      } else {
                        return (
                          <div key={index} className="p-4 rounded-lg border border-orange-200 bg-orange-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-sm mb-1">
                                  Weak verb: {'"'}
                                  {item.verb}
                                  {'"'}
                                </div>
                                <div className="text-sm bg-red-50 p-2 rounded mb-1 border border-red-100">
                                  <span className="font-medium">Original: </span>
                                  {item.originalSentence}
                                </div>
                                <div className="text-sm bg-green-50 p-2 rounded mb-1 border border-green-100">
                                  <span className="font-medium">Improved: </span>
                                  {item.improvedSentence}
                                </div>
                                {item.location && (
                                  <div className="text-xs text-gray-500 mt-1">Location: {item.location}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      }
                    })}
                  </div>
                </div>
              )}

              {/* Industry Keywords */}
              {industryFit && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-600" />
                    Industry Keywords
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Matched Keywords */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Matched Keywords ({industryFit.matchedKeywords.length})
                      </h4>
                      <div className="space-y-2">
                        {industryFit.matchedKeywords.map((item, index) => {
                          if (typeof item === "string") {
                            return (
                              <div
                                key={index}
                                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm inline-block mr-2 mb-2"
                              >
                                {item}
                              </div>
                            )
                          } else {
                            return (
                              <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200 mb-2">
                                <div className="font-medium text-sm text-green-800">{item.keyword}</div>
                                {item.context && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    Context: {'"'}
                                    {item.context}
                                    {'"'}
                                  </div>
                                )}
                                {item.relevance && (
                                  <div className="text-xs text-gray-600 mt-1">Relevance: {item.relevance}</div>
                                )}
                              </div>
                            )
                          }
                        })}
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                        Missing Keywords ({industryFit.missingKeywords.length})
                      </h4>
                      <div className="space-y-2">
                        {industryFit.missingKeywords.map((item, index) => {
                          if (typeof item === "string") {
                            return (
                              <div
                                key={index}
                                className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm inline-block mr-2 mb-2"
                              >
                                {item}
                              </div>
                            )
                          } else {
                            return (
                              <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-200 mb-2">
                                <div className="font-medium text-sm text-red-800">{item.keyword}</div>
                                {item.importance && (
                                  <div className="text-xs text-gray-600 mt-1">Importance: {item.importance}</div>
                                )}
                                {item.suggestedPlacement && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    Suggested placement: {item.suggestedPlacement}
                                  </div>
                                )}
                                {item.exampleUsage && (
                                  <div className="text-xs text-gray-700 mt-1 bg-white p-1 rounded">
                                    Example: {'"'}
                                    {item.exampleUsage}
                                    {'"'}
                                  </div>
                                )}
                              </div>
                            )
                          }
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === "recommendations" && (
            <div className="space-y-6">
              {/* ATS Recommendations */}
              {atsScore.recommendations.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-600" />
                    ATS Optimization Recommendations
                  </h3>
                  <div className="space-y-3">
                    {atsScore.recommendations.map((recommendation, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100"
                      >
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div className="text-sm text-gray-700">{recommendation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weak Verbs Improvements */}
              {contentQuality.impact.weakVerbs.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-orange-600" />
                    Replace Weak Verbs
                  </h3>
                  <div className="space-y-4">
                    {contentQuality.impact.weakVerbs.map((item, index) => {
                      if (typeof item === "string") {
                        return (
                          <div
                            key={index}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm inline-block mr-2"
                          >
                            {item}
                          </div>
                        )
                      } else {
                        const changeId = `weak-verb-${index}`
                        const isApplied = isChangeApplied(changeId)
                        const isDismissed = isChangeDismissed(changeId)

                        if (isApplied || isDismissed) {
                          return (
                            <div
                              key={index}
                              className={`p-4 rounded-lg border ${
                                isApplied ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50 opacity-60"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-sm">
                                  Replace weak verb:{" "}
                                  <span className="text-red-600">
                                    {'"'}
                                    {item.verb}
                                    {'"'}
                                  </span>
                                </h4>
                                <span
                                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    isApplied ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {isApplied ? "Applied" : "Dismissed"}
                                </span>
                              </div>
                              {isApplied && (
                                <div className="text-sm bg-green-100 p-2 rounded border border-green-200">
                                  {item.improvedSentence}
                                </div>
                              )}
                              {isDismissed && (
                                <div className="text-sm bg-gray-100 p-2 rounded border border-gray-200 line-through opacity-70">
                                  {item.originalSentence}
                                </div>
                              )}
                            </div>
                          )
                        }

                        return (
                          <div key={index} className="p-4 rounded-lg border border-orange-200 bg-orange-50">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm">
                                Replace weak verb:{" "}
                                <span className="text-red-600">
                                  {'"'}
                                  {item.verb}
                                  {'"'}
                                </span>
                              </h4>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs border-red-200 hover:bg-red-50"
                                  onClick={() => handleDismissChange(changeId)}
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Dismiss
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs border-green-200 hover:bg-green-50"
                                  onClick={() =>
                                    handleApplyChange(
                                      changeId,
                                      item.improvedSentence,
                                      item.location.split(".")[0],
                                      item.location,
                                    )
                                  }
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Apply
                                </Button>
                              </div>
                            </div>
                            <div className="text-sm bg-red-50 p-2 rounded mb-2 border border-red-100">
                              <span className="font-medium">Original: </span>
                              {item.originalSentence}
                            </div>
                            <div className="text-sm bg-green-50 p-2 rounded border border-green-100">
                              <span className="font-medium">Improved: </span>
                              {item.improvedSentence}
                            </div>
                            {item.location && (
                              <div className="text-xs text-gray-500 mt-2">Location: {item.location}</div>
                            )}
                          </div>
                        )
                      }
                    })}
                  </div>
                </div>
              )}

              {/* Missing Quantification */}
              {contentQuality.impact.missingQuantification.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Add Quantification
                  </h3>
                  <div className="space-y-4">
                    {contentQuality.impact.missingQuantification.map((item, index) => {
                      if (typeof item === "string") {
                        return (
                          <div key={index} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="text-sm text-gray-700">{item}</div>
                          </div>
                        )
                      } else {
                        const changeId = `quantification-${index}`
                        const isApplied = isChangeApplied(changeId)
                        const isDismissed = isChangeDismissed(changeId)

                        if (isApplied || isDismissed) {
                          return (
                            <div
                              key={index}
                              className={`p-4 rounded-lg border ${
                                isApplied ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50 opacity-60"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-sm">Add {item.metricType} metrics</h4>
                                <span
                                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    isApplied ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {isApplied ? "Applied" : "Dismissed"}
                                </span>
                              </div>
                              {isApplied && (
                                <div className="text-sm bg-green-100 p-2 rounded border border-green-200">
                                  {item.suggestedText}
                                </div>
                              )}
                              {isDismissed && (
                                <div className="text-sm bg-gray-100 p-2 rounded border border-gray-200 line-through opacity-70">
                                  {item.originalText}
                                </div>
                              )}
                            </div>
                          )
                        }

                        return (
                          <div key={index} className="p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm">Add {item.metricType} metrics</h4>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs border-red-200 hover:bg-red-50"
                                  onClick={() => handleDismissChange(changeId)}
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Dismiss
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs border-green-200 hover:bg-green-50"
                                  onClick={() =>
                                    handleApplyChange(
                                      changeId,
                                      item.suggestedText,
                                      item.location.split(".")[0],
                                      item.location,
                                    )
                                  }
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Apply
                                </Button>
                              </div>
                            </div>
                            <div className="text-sm bg-red-50 p-2 rounded mb-1 border border-red-100">
                              <span className="font-medium">Original: </span>
                              {item.originalText}
                            </div>
                            <div className="text-sm bg-green-50 p-2 rounded border border-green-100">
                              <span className="font-medium">Suggested: </span>
                              {item.suggestedText}
                            </div>
                            {item.location && (
                              <div className="text-xs text-gray-500 mt-2">Location: {item.location}</div>
                            )}
                          </div>
                        )
                      }
                    })}
                  </div>
                </div>
              )}

              {/* Industry Fit Recommendations */}
              {industryFit && industryFit.recommendations.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Industry Fit Improvements
                  </h3>
                  <div className="space-y-3">
                    {industryFit.recommendations.map((recommendation, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100"
                      >
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Lightbulb className="w-3 h-3 text-green-600" />
                        </div>
                        <div className="text-sm text-gray-700">{recommendation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Keywords */}
              {industryFit && industryFit.missingKeywords.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-red-600" />
                    Add Missing Keywords
                  </h3>
                  <div className="space-y-4">
                    {industryFit.missingKeywords.map((item, index) => {
                      if (typeof item === "string") {
                        return (
                          <div
                            key={index}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm inline-block mr-2"
                          >
                            {item}
                          </div>
                        )
                      } else {
                        const changeId = `keyword-${index}`
                        const isApplied = isChangeApplied(changeId)
                        const isDismissed = isChangeDismissed(changeId)

                        if (isApplied || isDismissed) {
                          return (
                            <div
                              key={index}
                              className={`p-4 rounded-lg border ${
                                isApplied ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50 opacity-60"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-sm">
                                  Add keyword:{" "}
                                  <span className="text-blue-600">
                                    {'"'}
                                    {item.keyword}
                                    {'"'}
                                  </span>
                                </h4>
                                <span
                                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    isApplied ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {isApplied ? "Applied" : "Dismissed"}
                                </span>
                              </div>
                              {isApplied && (
                                <div className="text-sm bg-green-100 p-2 rounded border border-green-200">
                                  {item.exampleUsage}
                                </div>
                              )}
                            </div>
                          )
                        }

                        return (
                          <div key={index} className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm">
                                Add keyword:{" "}
                                <span className="text-blue-600">
                                  {'"'}
                                  {item.keyword}
                                  {'"'}
                                </span>
                              </h4>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs border-red-200 hover:bg-red-50"
                                  onClick={() => handleDismissChange(changeId)}
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Dismiss
                                </Button>
                                {item.exampleUsage && item.suggestedPlacement && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs border-green-200 hover:bg-green-50"
                                    onClick={() =>
                                      handleApplyChange(
                                        changeId,
                                        item.exampleUsage,
                                        item.suggestedPlacement.split(".")[0],
                                        item.suggestedPlacement,
                                      )
                                    }
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    Apply
                                  </Button>
                                )}
                              </div>
                            </div>
                            {item.importance && (
                              <div className="text-xs text-gray-700 mb-2">
                                <span className="font-medium">Importance: </span>
                                {item.importance}
                              </div>
                            )}
                            {item.suggestedPlacement && (
                              <div className="text-xs text-gray-700 mb-2">
                                <span className="font-medium">Suggested placement: </span>
                                {item.suggestedPlacement}
                              </div>
                            )}
                            {item.exampleUsage && (
                              <div className="text-sm bg-white p-2 rounded border border-blue-100">
                                <span className="font-medium">Example: </span>
                                {'"'}
                                {item.exampleUsage}
                                {'"'}
                              </div>
                            )}
                          </div>
                        )
                      }
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">Analysis completed • Powered by AI</div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {onReanalyze && (
              <Button
                onClick={onReanalyze}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reanalyze
              </Button>
            )}
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { CVAnalysisModal }
export default CVAnalysisModal
