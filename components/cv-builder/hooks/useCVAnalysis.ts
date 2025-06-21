import { useState } from "react"
import { type CVData } from "@/lib/cv-templates"

interface Recommendation {
  section: string
  recommendation: string
  impact: string
  type: string
}

export const useCVAnalysis = () => {
  const [jobDescription, setJobDescription] = useState("")
  const [isImproving, setIsImproving] = useState(false)
  const [improvementSuggestions, setImprovementSuggestions] = useState("")
  const [copySuccess, setCopySuccess] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const [showImplementModal, setShowImplementModal] = useState(false)
  const [recommendationsText, setRecommendationsText] = useState("")
  const [isImplementing, setIsImplementing] = useState(false)
  const [originalCVData, setOriginalCVData] = useState<CVData | null>(null)
  const [parsedRecommendations, setParsedRecommendations] = useState<Recommendation[]>([])
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([])
  const [showAISection, setShowAISection] = useState(false)

  // Improve CV with AI
  const handleImproveCV = async (generateCVText: () => string, setError: (error: string) => void, setSuccess: (success: string) => void) => {
    if (!jobDescription.trim()) {
      setError("Please add a job description to get AI-powered improvements")
      return
    }

    setIsImproving(true)
    setError("")

    try {
      const cvText = generateCVText()
      const response = await fetch("/api/improve-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvContent: cvText,
          jobDescription,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setImprovementSuggestions(data.improvedCV)
      setSuccess("AI analysis complete! Review the suggestions below.")
    } catch (error) {
      console.error("Error improving CV:", error)
      setError("Failed to analyze CV. Please try again.")
    } finally {
      setIsImproving(false)
    }
  }

  // Copy recommendations to clipboard
  const handleCopyRecommendations = async () => {
    if (!improvementSuggestions) return

    try {
      // Create a clean text version of the recommendations
      const cleanText = improvementSuggestions
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .replace(/&nbsp;/g, " ") // Replace HTML entities
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .trim()

      await navigator.clipboard.writeText(cleanText)
      setIsCopied(true)
      setCopySuccess("Recommendations copied to clipboard!")

      // Reset animation state after 2 seconds
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setCopySuccess("")
      }, 3000)
    } catch (error) {
      console.error("Failed to copy:", error)
      setCopySuccess("Failed to copy recommendations")
      setTimeout(() => {
        setCopySuccess("")
      }, 3000)
    }
  }

  const handleExportJobReport = (cvData: CVData) => {
    if (!improvementSuggestions || !jobDescription) return

    try {
      // Generate comprehensive job-specific optimization report
      const reportContent = `
JOB-SPECIFIC CV OPTIMIZATION REPORT
Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

CANDIDATE INFORMATION
Name: ${cvData?.personalInfo?.name || "Not provided"}
Email: ${cvData?.personalInfo?.email || "Not provided"}
Title: ${cvData?.personalInfo?.title || "Not provided"}

EXECUTIVE SUMMARY
This job-specific CV optimization analysis was performed using advanced AI algorithms to evaluate your resume against the specific requirements of your target position. The recommendations below are tailored to maximize your chances of passing ATS screening and impressing hiring managers for this particular role.

TARGET JOB ANALYSIS
${jobDescription.substring(0, 1000)}${jobDescription.length > 1000 ? "..." : ""}

OPTIMIZATION RECOMMENDATIONS
${improvementSuggestions
  .replace(/<[^>]*>/g, "") // Remove HTML tags
  .replace(/&nbsp;/g, " ") // Replace HTML entities
  .replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"')
  .trim()}

IMPLEMENTATION STRATEGY
1. Review each recommendation carefully and prioritize high-impact changes
2. Update your CV content to incorporate suggested keywords and phrases
3. Ensure all recommendations align with your actual experience and skills
4. Test your updated CV against ATS systems before submitting
5. Customize your cover letter to complement these CV optimizations

NEXT STEPS
1. Implement the high-priority recommendations first
2. Update your CV with job-specific keywords and phrases
3. Ensure consistency between your CV and the job requirements
4. Consider creating multiple CV versions for different types of roles
5. Track your application success rate to measure improvement

ABOUT THIS REPORT
This analysis was generated using JobsyAI's advanced job-specific optimization engine, which combines natural language processing, ATS simulation, and industry best practices to provide targeted recommendations for your specific job application.

For questions about this report or to get additional career advice, visit JobsyAI.com

Report ID: ${Date.now()}
Analysis Date: ${new Date().toISOString()}
Target Position: ${jobDescription.split("\n")[0] || "Position details in job description"}
    `.trim()

      // Import the function dynamically to avoid circular dependencies
      import("@/lib/pdf-generator").then(({ openPrintableVersion }) => {
        openPrintableVersion(
          reportContent,
          `Job-Specific CV Optimization Report - ${cvData?.personalInfo?.name || "Candidate"} - ${new Date().toLocaleDateString()}`,
        )
      })
    } catch (error) {
      console.error("Error generating job-specific report:", error)
      setErrorMessage("❌ Failed to generate report. Please try again.")
      setTimeout(() => setErrorMessage(""), 3000)
    }
  }

  // Handle showing implement modal and parsing recommendations
  const handleShowImplementModal = async (setError: (error: string) => void, setSuccess: (success: string) => void) => {
    if (!recommendationsText.trim()) {
      setError("Please paste your AI recommendations first")
      return
    }

    if (recommendationsText.trim().length < 50) {
      setError("Please provide a complete AI recommendations report (minimum 50 characters)")
      return
    }

    try {
      setIsImplementing(true)
      setError("") // Clear any previous errors

      // Parse recommendations using AI
      const response = await fetch("/api/parse-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendationsText }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP ${response.status}: Failed to parse recommendations`)
      }

      const { recommendations } = responseData

      if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
        throw new Error("No valid recommendations found in the provided text")
      }

      setParsedRecommendations(recommendations)
      setSelectedRecommendations(recommendations.map((_: Recommendation, index: number) => index.toString()))
      setShowImplementModal(true)
      setSuccess(`Successfully parsed ${recommendations.length} recommendations!`)
    } catch (err) {
      console.error("Error parsing recommendations:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"

      // Provide helpful error messages based on the error type
      if (errorMessage.includes("API key")) {
        setError("AI parsing service is temporarily unavailable. The system used fallback parsing instead.")
      } else if (errorMessage.includes("format")) {
        setError(
          "Invalid recommendations format. Please paste a complete AI recommendations report that includes specific, actionable suggestions.",
        )
      } else {
        setError(
          `Failed to parse recommendations: ${errorMessage}. Please try pasting a different recommendations report.`,
        )
      }
    } finally {
      setIsImplementing(false)
    }
  }

  // Handle implementing selected recommendations
  const handleImplementRecommendations = async (cvData: CVData, setCVData: (data: CVData) => void, setError: (error: string) => void, setSuccess: (success: string) => void, applyAll = false) => {
    if (!originalCVData) {
      setOriginalCVData(cvData) // Backup original data
    }

    setIsImplementing(true)
    setError("")

    try {
      const recommendationsToApply = applyAll
        ? parsedRecommendations
        : parsedRecommendations.filter((_, index) => selectedRecommendations.includes(index.toString()))

      const response = await fetch("/api/implement-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentCV: cvData,
          recommendations: recommendationsToApply,
          originalRecommendationsText: recommendationsText,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to implement recommendations")
      }

      const { updatedCV } = await response.json()
      setCVData(updatedCV)
      setShowImplementModal(false)
      setSuccess("AI recommendations implemented successfully! Review your updated CV and save when ready.")
    } catch (error) {
      console.error("Error implementing recommendations:", error)
      setError("Failed to implement recommendations. Please try again.")
    } finally {
      setIsImplementing(false)
    }
  }

  // Handle reverting to original CV
  const handleRevertToOriginal = (setCVData: (data: CVData) => void, setSuccess: (success: string) => void) => {
    if (originalCVData) {
      setCVData(originalCVData)
      setOriginalCVData(null)
      setSuccess("CV reverted to original version")
    }
  }

  // Handle recommendation selection
  const handleRecommendationToggle = (index: string) => {
    setSelectedRecommendations((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  return {
    jobDescription,
    setJobDescription,
    isImproving,
    improvementSuggestions,
    copySuccess,
    isCopied,
    errorMessage,
    showImplementModal,
    setShowImplementModal,
    recommendationsText,
    setRecommendationsText,
    isImplementing,
    originalCVData,
    parsedRecommendations,
    selectedRecommendations,
    setSelectedRecommendations,
    showAISection,
    setShowAISection,
    handleImproveCV,
    handleCopyRecommendations,
    handleExportJobReport,
    handleShowImplementModal,
    handleImplementRecommendations,
    handleRevertToOriginal,
    handleRecommendationToggle,
  }
} 