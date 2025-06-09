"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"

interface ATSScoreProps {
  cvText?: string
  className?: string
}

interface ScoreBreakdown {
  formatting: number
  keywords: number
  structure: number
  readability: number
  completeness: number
}

interface ScoreResult {
  overall: number
  breakdown: ScoreBreakdown
  recommendations: string[]
  grade: "A" | "B" | "C" | "D" | "F"
}

// Donut Chart Component
function DonutChart({ score, size = 90 }: { score: number; size?: number }) {
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (score / 100) * circumference

  // Color based on score
  const getColor = (score: number) => {
    if (score >= 90) return "#10b981" // green-500
    if (score >= 80) return "#22c55e" // green-400
    if (score >= 70) return "#84cc16" // lime-500
    if (score >= 60) return "#eab308" // yellow-500
    if (score >= 50) return "#f97316" // orange-500
    return "#ef4444" // red-500
  }

  const color = getColor(score)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e5e7eb" strokeWidth="8" fill="transparent" />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      {/* Score text in center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{Math.round(score)}</span>
      </div>
    </div>
  )
}

// ATS Scoring Logic
function calculateATSScore(cvText: string): ScoreResult {
  if (!cvText || cvText.trim().length === 0) {
    return {
      overall: 0,
      breakdown: {
        formatting: 0,
        keywords: 0,
        structure: 0,
        readability: 0,
        completeness: 0,
      },
      recommendations: ["Upload your CV to get an ATS compatibility score"],
      grade: "F",
    }
  }

  const text = cvText.toLowerCase()
  const lines = cvText.split("\n").filter((line) => line.trim())
  const words = text.split(/\s+/).filter((word) => word.length > 0)

  // Formatting Score (25%)
  let formattingScore = 0
  if (lines.length > 10) formattingScore += 20 // Good length
  if (!/[^\x00-\x7F]/.test(cvText)) formattingScore += 15 // ASCII characters
  if (cvText.includes("\t") || cvText.includes("  ")) formattingScore += 10 // Proper spacing
  if (lines.some((line) => line.match(/^[A-Z\s]+$/))) formattingScore += 20 // Section headers
  if (!cvText.includes("•") && !cvText.includes("*")) formattingScore += 10 // No special bullets
  formattingScore = Math.min(formattingScore, 100)

  // Keywords Score (30%)
  const commonKeywords = [
    "experience",
    "skills",
    "education",
    "work",
    "project",
    "team",
    "management",
    "development",
    "analysis",
    "communication",
    "leadership",
    "problem",
    "solution",
    "achievement",
    "result",
    "success",
    "improve",
    "increase",
    "develop",
    "create",
  ]
  const foundKeywords = commonKeywords.filter((keyword) => text.includes(keyword))
  const keywordsScore = Math.min((foundKeywords.length / commonKeywords.length) * 100, 100)

  // Structure Score (20%)
  let structureScore = 0
  const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(cvText)
  const hasPhone = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/.test(cvText)
  const hasExperience = /experience|work|employment|job/i.test(cvText)
  const hasEducation = /education|university|college|degree|school/i.test(cvText)
  const hasSkills = /skills|competenc|proficien/i.test(cvText)

  if (hasEmail) structureScore += 20
  if (hasPhone) structureScore += 20
  if (hasExperience) structureScore += 20
  if (hasEducation) structureScore += 20
  if (hasSkills) structureScore += 20

  // Readability Score (15%)
  const avgWordsPerLine = words.length / lines.length
  let readabilityScore = 0
  if (avgWordsPerLine >= 5 && avgWordsPerLine <= 15) readabilityScore += 40
  if (words.length >= 200) readabilityScore += 30 // Sufficient content
  if (lines.length >= 15) readabilityScore += 30 // Good structure
  readabilityScore = Math.min(readabilityScore, 100)

  // Completeness Score (10%)
  let completenessScore = 0
  if (words.length >= 300) completenessScore += 25 // Comprehensive
  if (lines.length >= 20) completenessScore += 25 // Detailed
  if (text.includes("summary") || text.includes("objective")) completenessScore += 25
  if (foundKeywords.length >= 10) completenessScore += 25
  completenessScore = Math.min(completenessScore, 100)

  // Calculate weighted overall score
  const overall = Math.round(
    formattingScore * 0.25 +
      keywordsScore * 0.3 +
      structureScore * 0.2 +
      readabilityScore * 0.15 +
      completenessScore * 0.1,
  )

  // Generate recommendations
  const recommendations: string[] = []
  if (formattingScore < 70) recommendations.push("Use simple formatting without special characters or complex layouts")
  if (keywordsScore < 70) recommendations.push("Include more industry-relevant keywords and action verbs")
  if (structureScore < 70)
    recommendations.push("Ensure all essential sections are present (contact, experience, education, skills)")
  if (readabilityScore < 70)
    recommendations.push("Improve readability with better structure and appropriate content length")
  if (completenessScore < 70) recommendations.push("Add more detailed descriptions and a professional summary")

  if (recommendations.length === 0) {
    recommendations.push("Excellent ATS compatibility! Your CV is well-optimized for applicant tracking systems.")
  }

  // Determine grade
  let grade: "A" | "B" | "C" | "D" | "F"
  if (overall >= 90) grade = "A"
  else if (overall >= 80) grade = "B"
  else if (overall >= 70) grade = "C"
  else if (overall >= 60) grade = "D"
  else grade = "F"

  return {
    overall,
    breakdown: {
      formatting: Math.round(formattingScore),
      keywords: Math.round(keywordsScore),
      structure: Math.round(structureScore),
      readability: Math.round(readabilityScore),
      completeness: Math.round(completenessScore),
    },
    recommendations,
    grade,
  }
}

export default function CVATSScore({ cvText = "", className = "" }: ATSScoreProps) {
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (cvText && cvText.trim().length > 0) {
      setIsAnalyzing(true)
      // Simulate analysis delay for better UX
      const timer = setTimeout(() => {
        const result = calculateATSScore(cvText)
        setScore(result)
        setIsAnalyzing(false)
      }, 1500)

      return () => clearTimeout(timer)
    } else {
      setScore(calculateATSScore(""))
    }
  }, [cvText])

  if (!score) return null

  const getScoreIcon = (grade: string) => {
    switch (grade) {
      case "A":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "B":
        return <TrendingUp className="w-4 h-4 text-blue-600" />
      case "C":
        return <Target className="w-4 h-4 text-yellow-600" />
      default:
        return <AlertTriangle className="w-4 h-4 text-red-600" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50 border-green-200"
    if (score >= 80) return "text-blue-600 bg-blue-50 border-blue-200"
    if (score >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    if (score >= 60) return "text-orange-600 bg-orange-50 border-orange-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  return (
    <div className={`relative ${className}`}>
      <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${getScoreColor(score.overall)} border-2`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {isAnalyzing ? (
                <div className="w-[80px] h-[80px] flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <DonutChart score={score.overall} size={80} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                {getScoreIcon(score.grade)}
                <Badge variant="outline" className="text-xs font-semibold">
                  Grade {score.grade}
                </Badge>
              </div>
              <p className="text-sm font-medium text-gray-900">ATS Compatibility</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown Modal/Dropdown */}
      {showDetails && score && !isAnalyzing && (
        <Card className="absolute top-full right-0 mt-2 w-80 z-50 shadow-xl border-2">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">ATS Score Breakdown</h3>
                <Badge variant="outline" className="font-bold">
                  {score.overall}/100
                </Badge>
              </div>

              <div className="space-y-3">
                {Object.entries(score.breakdown).map(([category, value]) => (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium text-gray-700">
                        {category.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span className="font-semibold">{value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${value}%`,
                          backgroundColor: value >= 70 ? "#10b981" : value >= 50 ? "#eab308" : "#ef4444",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t">
                <h4 className="font-medium text-gray-900 mb-2">Recommendations:</h4>
                <ul className="space-y-1">
                  {score.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start space-x-1">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
