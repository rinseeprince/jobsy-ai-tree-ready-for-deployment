"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  Loader2,
  Zap,
  X,
  Target,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  BarChart3,
  Award,
  Eye,
  Download,
  RefreshCw,
  Check,
  XCircle,
  Monitor,
  Edit,
  MapPin,
} from "lucide-react"
import type { CVData } from "@/lib/cv-templates"
import { CVPreview } from "@/components/cv-editor/cv-preview"
import { openPrintableVersion } from "@/lib/pdf-generator"

interface CVAnalysisButtonProps {
  cvData: CVData
  disabled?: boolean
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  onUpdateCV?: (updatedCV: CVData) => void
  onCVUpdate?: (updatedCV: CVData) => void
}

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

export function CVAnalysisButton({
  cvData,
  disabled = false,
  variant = "default",
  size = "default",
  className = "",
  onClick,
  onUpdateCV,
  onCVUpdate,
}: CVAnalysisButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "recommendations" | "preview">("overview")
  const [editableCVData, setEditableCVData] = useState<CVData | undefined>(cvData)
  const [appliedChanges, setAppliedChanges] = useState<string[]>([])
  const [dismissedChanges, setDismissedChanges] = useState<string[]>([])
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedTemplate] = useState("modern")
  const cvPreviewRef = useRef<HTMLDivElement>(null)
  const [appliedChangesHistory, setAppliedChangesHistory] = useState<
    Record<string, { originalText: string; section: string; fieldPath: string }>
  >({})

  const handleAnalysis = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e)
    }

    if (!cvData || isAnalyzing) return

    setIsAnalyzing(true)

    try {
      const response = await fetch("/api/ai-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvData,
          analysisTypes: ["ats_score", "content_quality", "length_analysis"],
        }),
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`)
      }

      const results: AnalysisResults = await response.json()
      setAnalysisResults(results)
      setShowModal(true)
      setEditableCVData(cvData)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Analysis failed"
      setAnalysisResults({
        success: false,
        error: errorMessage,
      })
      setShowModal(true)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReanalyze = () => {
    setShowModal(false)
    handleAnalysis({} as React.MouseEvent<HTMLButtonElement>)
  }

  // Function to highlight and scroll to text in CV preview
  const highlightTextInCV = (originalText: string, isApplied = false) => {
    // Switch to preview tab if not already there
    if (activeTab !== "preview") {
      setActiveTab("preview")
    }

    // Wait for tab switch to complete, then scroll to highlighted text
    setTimeout(() => {
      if (cvPreviewRef.current && originalText) {
        const previewElement = cvPreviewRef.current

        // Clean the original text for better matching
        const cleanOriginalText = originalText.trim().toLowerCase()

        // Clear any existing highlights first (but keep applied changes)
        const existingHighlights = previewElement.querySelectorAll("[data-ai-highlight]:not([data-ai-applied])")
        existingHighlights.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.removeAttribute("data-ai-highlight")
            el.style.backgroundColor = ""
            el.style.border = ""
            el.style.borderRadius = ""
            el.style.padding = ""
            el.style.boxShadow = ""
          }
        })

        // Function to create a highlight span around specific text
        const highlightTextInElement = (element: Element, searchText: string): boolean => {
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null)

          const textNodes: Text[] = []
          let node
          while ((node = walker.nextNode())) {
            if (node.textContent && node.textContent.trim().length > 0) {
              textNodes.push(node as Text)
            }
          }

          // Try to find exact matches first
          for (const textNode of textNodes) {
            const textContent = textNode.textContent?.toLowerCase() || ""
            const cleanSearchText = searchText.toLowerCase()

            if (textContent.includes(cleanSearchText)) {
              const parent = textNode.parentElement
              if (parent && parent instanceof HTMLElement) {
                // Create a more precise highlight by wrapping just the matching text
                const originalText = textNode.textContent || ""
                const lowerOriginal = originalText.toLowerCase()
                const startIndex = lowerOriginal.indexOf(cleanSearchText)

                if (startIndex !== -1) {
                  const endIndex = startIndex + cleanSearchText.length

                  // Split the text into three parts: before, match, after
                  const beforeText = originalText.substring(0, startIndex)
                  const matchText = originalText.substring(startIndex, endIndex)
                  const afterText = originalText.substring(endIndex)

                  // Create highlight span with appropriate styling
                  const highlightSpan = document.createElement("span")
                  highlightSpan.setAttribute("data-ai-highlight", "true")

                  if (isApplied) {
                    // Green highlighting for applied changes
                    highlightSpan.setAttribute("data-ai-applied", "true")
                    highlightSpan.style.backgroundColor = "#dcfce7"
                    highlightSpan.style.border = "2px solid #16a34a"
                    highlightSpan.style.borderRadius = "4px"
                    highlightSpan.style.padding = "2px 4px"
                    highlightSpan.style.boxShadow = "0 0 0 2px rgba(22, 163, 74, 0.2)"
                    highlightSpan.style.transition = "all 0.3s ease"
                    highlightSpan.title = "✅ Applied change"
                  } else {
                    // Orange highlighting for suggestions
                    highlightSpan.style.backgroundColor = "#fef3c7"
                    highlightSpan.style.border = "2px solid #f59e0b"
                    highlightSpan.style.borderRadius = "4px"
                    highlightSpan.style.padding = "2px 4px"
                    highlightSpan.style.boxShadow = "0 0 0 2px rgba(245, 158, 11, 0.2)"
                    highlightSpan.style.transition = "all 0.3s ease"
                    highlightSpan.title = "💡 Suggested change"
                  }

                  highlightSpan.textContent = matchText

                  // Create document fragment to replace the text node
                  const fragment = document.createDocumentFragment()
                  if (beforeText) fragment.appendChild(document.createTextNode(beforeText))
                  fragment.appendChild(highlightSpan)
                  if (afterText) fragment.appendChild(document.createTextNode(afterText))

                  // Replace the original text node
                  textNode.parentNode?.replaceChild(fragment, textNode)

                  // Scroll to the highlighted element
                  highlightSpan.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "nearest",
                  })

                  // Only remove highlight after 8 seconds if it's not an applied change
                  if (!isApplied) {
                    setTimeout(() => {
                      if (highlightSpan.parentNode) {
                        const textContent = highlightSpan.textContent || ""
                        highlightSpan.parentNode.replaceChild(document.createTextNode(textContent), highlightSpan)
                      }
                    }, 8000)
                  }

                  return true
                }
              }
            }
          }

          return false
        }

        // Try to find and highlight the exact text
        let found = highlightTextInElement(previewElement, cleanOriginalText)

        // If exact match not found, try partial matching with key words
        if (!found) {
          const words = cleanOriginalText.split(/\s+/).filter((word) => word.length > 2)

          for (const word of words) {
            if (highlightTextInElement(previewElement, word)) {
              found = true
              break
            }
          }
        }

        if (!found) {
          console.warn("Could not find matching text in CV preview:", originalText)
        }
      }
    }, 300)
  }

  // Function to highlight applied changes in green
  const highlightAppliedChange = (changeId: string, updatedText: string) => {
    // Find the change details to get the original text for highlighting
    const weakVerbItem = analysisResults?.results?.contentQuality?.impact?.weakVerbs?.find(
      (_, index) => changeId === `weak-verb-${index}`,
    )

    const quantificationItem = analysisResults?.results?.contentQuality?.impact?.missingQuantification?.find(
      (_, index) => changeId === `quantification-${index}`,
    )

    // Highlight the updated text in green
    if (weakVerbItem && typeof weakVerbItem === "object") {
      // For weak verbs, highlight the improved sentence
      highlightTextInCV(updatedText, true)
    } else if (quantificationItem && typeof quantificationItem === "object") {
      // For quantification, highlight the suggested text
      highlightTextInCV(updatedText, true)
    }
  }

  const handleApplyChange = (changeId: string, updatedText: string, section: string, fieldPath: string) => {
    if (!editableCVData) return

    // Deep clone the CV data
    const newCVData = JSON.parse(JSON.stringify(editableCVData)) as CVData

    try {
      console.log("🔄 Applying change:", { changeId, section, fieldPath, updatedText })

      // Get the original change details for better matching
      let originalText = ""
      let targetLocation = ""

      if (changeId.includes("weak-verb")) {
        const weakVerbItem = analysisResults?.results?.contentQuality?.impact?.weakVerbs?.find(
          (_, index) => changeId === `weak-verb-${index}`,
        )
        if (weakVerbItem && typeof weakVerbItem === "object") {
          originalText = weakVerbItem.originalSentence || ""
          targetLocation = weakVerbItem.location || ""
        }
      } else if (changeId.includes("quantification")) {
        const quantificationItem = analysisResults?.results?.contentQuality?.impact?.missingQuantification?.find(
          (_, index) => changeId === `quantification-${index}`,
        )
        if (quantificationItem && typeof quantificationItem === "object") {
          originalText = quantificationItem.originalText || ""
          targetLocation = quantificationItem.location || ""
        }
      }

      console.log("🎯 Target matching:", { originalText, targetLocation })

      // Store the original value before making changes
      let currentValue = ""

      // Enhanced experience matching logic
      if (newCVData.experience && originalText) {
        let foundMatch = false

        // First, try to find exact text match in experience descriptions
        for (let i = 0; i < newCVData.experience.length; i++) {
          const exp = newCVData.experience[i]
          const description = exp.description || ""

          // Check if this experience contains the original text
          if (description.toLowerCase().includes(originalText.toLowerCase())) {
            console.log(`✅ Found exact match in experience ${i + 1}: ${exp.title} at ${exp.company}`)

            // Store current value for undo
            currentValue = description

            if (changeId.includes("weak-verb")) {
              // Replace the original sentence with the improved one
              const updatedDescription = description.replace(originalText, updatedText)
              newCVData.experience[i].description = updatedDescription
            } else if (changeId.includes("quantification")) {
              // Replace the original text with the quantified version
              const updatedDescription = description.replace(originalText, updatedText)
              newCVData.experience[i].description = updatedDescription
            }

            foundMatch = true
            break
          }
        }

        // If no exact match, try partial matching with key phrases
        if (!foundMatch && originalText.length > 10) {
          const keyPhrases = originalText
            .toLowerCase()
            .split(/[.,;!?]/)
            .map((phrase) => phrase.trim())
            .filter((phrase) => phrase.length > 5)
            .slice(0, 3) // Take first 3 key phrases

          for (let i = 0; i < newCVData.experience.length; i++) {
            const exp = newCVData.experience[i]
            const description = exp.description?.toLowerCase() || ""

            // Check if description contains any key phrases
            const matchingPhrases = keyPhrases.filter((phrase) => description.includes(phrase))

            if (matchingPhrases.length > 0) {
              console.log(`✅ Found partial match in experience ${i + 1}: ${exp.title} at ${exp.company}`)
              console.log(`📝 Matching phrases:`, matchingPhrases)

              // Store current value for undo
              currentValue = exp.description || ""

              // Try to replace the most similar sentence
              const sentences = (exp.description || "").split(/[.!?]+/).filter((s) => s.trim())
              let bestMatchIndex = -1
              let bestMatchScore = 0

              sentences.forEach((sentence, idx) => {
                const sentenceLower = sentence.toLowerCase()
                const matchScore = keyPhrases.reduce((score, phrase) => {
                  return score + (sentenceLower.includes(phrase) ? 1 : 0)
                }, 0)

                if (matchScore > bestMatchScore) {
                  bestMatchScore = matchScore
                  bestMatchIndex = idx
                }
              })

              if (bestMatchIndex >= 0) {
                sentences[bestMatchIndex] = " " + updatedText
                newCVData.experience[i].description = sentences.join(".").trim()
              } else {
                // Append if no good sentence match
                const currentDesc = exp.description || ""
                newCVData.experience[i].description =
                  currentDesc + (currentDesc.endsWith(".") ? " " : ". ") + updatedText
              }

              foundMatch = true
              break
            }
          }
        }

        // If still no match, try matching by job title or company from location hint
        if (!foundMatch && targetLocation) {
          const locationLower = targetLocation.toLowerCase()

          for (let i = 0; i < newCVData.experience.length; i++) {
            const exp = newCVData.experience[i]
            const titleMatch =
              exp.title?.toLowerCase().includes(locationLower) || locationLower.includes(exp.title?.toLowerCase() || "")
            const companyMatch =
              exp.company?.toLowerCase().includes(locationLower) ||
              locationLower.includes(exp.company?.toLowerCase() || "")

            if (titleMatch || companyMatch) {
              console.log(`✅ Found location match in experience ${i + 1}: ${exp.title} at ${exp.company}`)

              // Store current value for undo
              currentValue = exp.description || ""

              const currentDesc = exp.description || ""
              newCVData.experience[i].description = currentDesc + (currentDesc.endsWith(".") ? " " : ". ") + updatedText
              foundMatch = true
              break
            }
          }
        }

        // Last resort: add to most relevant experience based on content similarity
        if (!foundMatch && newCVData.experience.length > 0) {
          console.log("⚠️ No specific match found, using content similarity matching")

          // Find experience with most similar content
          let bestMatch = 0
          let bestScore = 0

          const searchTerms = updatedText
            .toLowerCase()
            .split(/\s+/)
            .filter((word) => word.length > 3)

          newCVData.experience.forEach((exp, idx) => {
            const expText = `${exp.title} ${exp.company} ${exp.description}`.toLowerCase()
            const score = searchTerms.reduce((acc, term) => acc + (expText.includes(term) ? 1 : 0), 0)

            if (score > bestScore) {
              bestScore = score
              bestMatch = idx
            }
          })

          console.log(
            `✅ Applying to most similar experience ${bestMatch + 1}: ${newCVData.experience[bestMatch].title}`,
          )

          // Store current value for undo
          currentValue = newCVData.experience[bestMatch].description || ""

          const currentDesc = newCVData.experience[bestMatch].description || ""
          newCVData.experience[bestMatch].description =
            currentDesc + (currentDesc.endsWith(".") ? " " : ". ") + updatedText
        }
      } else {
        // Handle non-experience sections (personal info, skills, etc.)
        if (section === "personalInfo") {
          if (fieldPath === "summary" || !fieldPath) {
            currentValue = newCVData.personalInfo.summary
            newCVData.personalInfo.summary = updatedText
          } else {
            const personalInfo = newCVData.personalInfo as Record<string, string>
            currentValue = personalInfo[fieldPath] || ""
            personalInfo[fieldPath] = updatedText
          }
          console.log("✅ Updated personal info")
        } else if (section === "skills") {
          currentValue = newCVData.skills.join(", ")
          newCVData.skills = updatedText.split(",").map((skill) => skill.trim())
          console.log("✅ Updated skills")
        }
      }

      // Store the original value for undo functionality
      setAppliedChangesHistory((prev) => ({
        ...prev,
        [changeId]: {
          originalText: currentValue,
          section,
          fieldPath,
        },
      }))

      // Update the CV data
      setEditableCVData(newCVData)

      // Call both possible callback functions for backward compatibility
      if (onUpdateCV) onUpdateCV(newCVData)
      if (onCVUpdate) onCVUpdate(newCVData)

      // Mark as applied
      setAppliedChanges([...appliedChanges, changeId])

      // Show success notification
      setSuccessMessage(`✅ Change applied successfully! Your CV has been updated.`)

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000)

      // Highlight the applied change in green after a short delay to allow CV to update
      setTimeout(() => {
        highlightAppliedChange(changeId, updatedText)
      }, 500)

      console.log("✅ Change applied successfully")
    } catch (error) {
      console.error("❌ Error applying change:", error)
      setErrorMessage("❌ Failed to apply change. Please try again.")
      setTimeout(() => setErrorMessage(""), 3000)
    }
  }

  const handleDismissChange = (changeId: string) => {
    setDismissedChanges([...dismissedChanges, changeId])
  }

  const isChangeApplied = (changeId: string) => appliedChanges.includes(changeId)
  const isChangeDismissed = (changeId: string) => dismissedChanges.includes(changeId)

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

  // Helper function to calculate word count locally as backup
  const calculateLocalWordCount = (cvData: CVData): number => {
    let text = ""

    // Extract all text content
    if (cvData.personalInfo) {
      const personal = cvData.personalInfo
      text +=
        [personal.name, personal.title, personal.summary, personal.email, personal.phone, personal.location]
          .filter(Boolean)
          .join(" ") + " "
    }

    if (cvData.experience?.length) {
      cvData.experience.forEach((exp) => {
        text += [exp.title, exp.company, exp.location, exp.description].filter(Boolean).join(" ") + " "
      })
    }

    if (cvData.education?.length) {
      cvData.education.forEach((edu) => {
        text += [edu.degree, edu.institution, edu.location, edu.description].filter(Boolean).join(" ") + " "
      })
    }

    if (cvData.skills?.length) {
      text += cvData.skills.join(" ") + " "
    }

    if (cvData.certifications?.length) {
      cvData.certifications.forEach((cert) => {
        text += [cert.name, cert.issuer, cert.description].filter(Boolean).join(" ") + " "
      })
    }

    return text
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.trim().length > 0).length
  }

  const handleUndoChange = (changeId: string) => {
    if (!editableCVData || !appliedChangesHistory[changeId]) return

    const { originalText, section, fieldPath } = appliedChangesHistory[changeId]

    // Deep clone the CV data
    const newCVData = JSON.parse(JSON.stringify(editableCVData)) as CVData

    try {
      console.log("↩️ Undoing change:", { changeId, section, fieldPath, originalText })

      // Restore the original value based on section and field path
      if (section === "personalInfo") {
        if (fieldPath === "summary" || !fieldPath) {
          newCVData.personalInfo.summary = originalText
        } else {
          const personalInfo = newCVData.personalInfo as Record<string, string>
          personalInfo[fieldPath] = originalText
        }
      } else if (section === "skills") {
        newCVData.skills = originalText
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill.length > 0)
      } else if (section === "experience") {
        // For experience, we need to find the right experience entry and restore the description
        // This is more complex since we need to identify which experience was modified

        // Get the original change details to find the right experience
        let targetLocation = ""
        if (changeId.includes("weak-verb")) {
          const weakVerbItem = analysisResults?.results?.contentQuality?.impact?.weakVerbs?.find(
            (_, index) => changeId === `weak-verb-${index}`,
          )
          if (weakVerbItem && typeof weakVerbItem === "object") {
            targetLocation = weakVerbItem.location || ""
          }
        } else if (changeId.includes("quantification")) {
          const quantificationItem = analysisResults?.results?.contentQuality?.impact?.missingQuantification?.find(
            (_, index) => changeId === `quantification-${index}`,
          )
          if (quantificationItem && typeof quantificationItem === "object") {
            targetLocation = quantificationItem.location || ""
          }
        }

        // Find the experience that was modified and restore it
        if (targetLocation) {
          const locationLower = targetLocation.toLowerCase()
          for (let i = 0; i < newCVData.experience.length; i++) {
            const exp = newCVData.experience[i]
            const titleMatch =
              exp.title?.toLowerCase().includes(locationLower) || locationLower.includes(exp.title?.toLowerCase() || "")
            const companyMatch =
              exp.company?.toLowerCase().includes(locationLower) ||
              locationLower.includes(exp.company?.toLowerCase() || "")

            if (titleMatch || companyMatch) {
              newCVData.experience[i].description = originalText
              break
            }
          }
        } else {
          // Fallback: restore the first experience entry (this is a limitation)
          if (newCVData.experience.length > 0) {
            newCVData.experience[0].description = originalText
          }
        }
      }
    } catch (error) {
      console.error("Error during undo operation:", error)
    }

    // Update the CV data
    setEditableCVData(newCVData)

    // Call both possible callback functions for backward compatibility
    if (onUpdateCV) onUpdateCV(newCVData)
    if (onCVUpdate) onCVUpdate(newCVData)

    // Remove from applied changes
    setAppliedChanges((prev) => prev.filter((id) => id !== changeId))

    // Remove from history
    setAppliedChangesHistory((prev) => {
      const newHistory = { ...prev }
      delete newHistory[changeId]
      return newHistory
    })

    // Show success notification
    setSuccessMessage(`↩️ Change undone successfully! Your CV has been restored.`)

    // Auto-hide success message after 3 seconds
    setTimeout(() => setSuccessMessage(""), 3000)

    console.log("✅ Change undone successfully")
  }

  const handleExportReport = () => {
    if (!analysisResults?.results) return

    const { atsScore, contentQuality, lengthAnalysis, industryFit } = analysisResults.results

    // Generate comprehensive report content
    const reportContent = `
CV ANALYSIS REPORT
Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

CANDIDATE INFORMATION
Name: ${cvData?.personalInfo?.name || "Not provided"}
Email: ${cvData?.personalInfo?.email || "Not provided"}
Title: ${cvData?.personalInfo?.title || "Not provided"}

EXECUTIVE SUMMARY
This comprehensive CV analysis was performed using advanced AI algorithms to evaluate your resume across multiple dimensions including ATS compatibility, content quality, and industry fit.

OVERALL SCORES
• ATS Score: ${atsScore?.overall || 0}/100 (${atsScore?.passRate || "Unknown"} pass rate)
• Content Quality: ${contentQuality?.overall || 0}/100
• Word Count: ${lengthAnalysis?.wordCount || 0} words (${lengthAnalysis?.pageEstimate || 0} pages)
• Industry Fit: ${industryFit?.score || "N/A"}/100

DETAILED ANALYSIS

1. ATS COMPATIBILITY ANALYSIS
Overall Score: ${atsScore?.overall || 0}/100
Pass Rate: ${atsScore?.passRate || "Unknown"}

Breakdown:
• Formatting: ${atsScore?.breakdown?.formatting || 0}/100
• Keywords: ${atsScore?.breakdown?.keywords || 0}/100
• Structure: ${atsScore?.breakdown?.structure || 0}/100
• Readability: ${atsScore?.breakdown?.readability || 0}/100
• File Format: ${atsScore?.breakdown?.fileFormat || 0}/100

Key Recommendations:
${atsScore?.recommendations?.map((rec, i) => `${i + 1}. ${rec}`).join("\n") || "No specific recommendations available"}

2. CONTENT QUALITY ANALYSIS
Overall Score: ${contentQuality?.overall || 0}/100

Grammar Analysis:
• Score: ${contentQuality?.grammar?.score || 0}/100
• Issues Found: ${contentQuality?.grammar?.issues?.length || 0}

${
  contentQuality?.grammar?.issues?.length > 0
    ? `
Top Grammar Issues:
${contentQuality.grammar.issues
  .slice(0, 5)
  .map(
    (issue, i) => `${i + 1}. ${issue.message} (${issue.severity} severity)
   Suggestion: ${issue.suggestion}`,
  )
  .join("\n")}
`
    : "No significant grammar issues found."
}

Impact Analysis:
• Score: ${contentQuality?.impact?.score || 0}/100
• Weak Verbs Found: ${contentQuality?.impact?.weakVerbs?.length || 0}
• Missing Quantification: ${contentQuality?.impact?.missingQuantification?.length || 0}
• Passive Voice Count: ${contentQuality?.impact?.passiveVoiceCount || 0}

${
  contentQuality?.impact?.weakVerbs?.length > 0
    ? `
Weak Verbs to Replace:
${contentQuality.impact.weakVerbs
  .map((item, i) => {
    if (typeof item === "string") return `${i + 1}. ${item}`
    return `${i + 1}. Replace "${item.verb}" in: "${item.originalSentence}"
   Improved: "${item.improvedSentence}"`
  })
  .join("\n")}
`
    : "No weak verbs identified."
}

${
  contentQuality?.impact?.missingQuantification?.length > 0
    ? `
Quantification Opportunities:
${contentQuality.impact.missingQuantification
  .map((item, i) => {
    if (typeof item === "string") return `${i + 1}. ${item}`
    return `${i + 1}. Add ${item.metricType} metrics to: "${item.originalText}"
   Suggested: "${item.suggestedText}"`
  })
  .join("\n")}
`
    : "Good use of quantification throughout."
}

Clarity Analysis:
• Score: ${contentQuality?.clarity?.score || 0}/100
• Average Sentence Length: ${contentQuality?.clarity?.avgSentenceLength || 0} words
• Readability Score: ${contentQuality?.clarity?.readabilityScore || 0}

3. LENGTH ANALYSIS
Word Count: ${lengthAnalysis?.wordCount || 0} words
Page Estimate: ${lengthAnalysis?.pageEstimate || 0} pages
Optimal Length: ${lengthAnalysis?.isOptimal ? "Yes" : "No"}

Recommendation: ${lengthAnalysis?.recommendation || "No specific recommendation"}

${
  lengthAnalysis?.sectionsAnalysis
    ? `
Section Analysis:
• Sections too long: ${lengthAnalysis.sectionsAnalysis.tooLong?.join(", ") || "None"}
• Sections too short: ${lengthAnalysis.sectionsAnalysis.tooShort?.join(", ") || "None"}
• Suggestions: ${lengthAnalysis.sectionsAnalysis.suggestions?.join("; ") || "None"}
`
    : ""
}

${
  industryFit
    ? `
4. INDUSTRY FIT ANALYSIS
Overall Score: ${industryFit.score}/100
Matched Keywords: ${industryFit.matchedKeywords?.length || 0}
Missing Keywords: ${industryFit.missingKeywords?.length || 0}

${
  industryFit.matchedKeywords?.length > 0
    ? `
Matched Keywords:
${industryFit.matchedKeywords
  .map((item) => {
    if (typeof item === "string") return `• ${item}`
    return `• ${item.keyword} (${item.relevance})`
  })
  .join("\n")}
`
    : ""
}

${
  industryFit.missingKeywords?.length > 0
    ? `
Missing Keywords to Consider:
${industryFit.missingKeywords
  .map((item) => {
    if (typeof item === "string") return `• ${item}`
    return `• ${item.keyword} (${item.importance} importance)
   Suggested placement: ${item.suggestedPlacement}
   Example: "${item.exampleUsage}"`
  })
  .join("\n")}
`
    : ""
}

${
  industryFit.recommendations?.length > 0
    ? `
Industry Fit Recommendations:
${industryFit.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join("\n")}
`
    : ""
}
`
    : ""
}

NEXT STEPS
1. Address high-priority grammar and formatting issues
2. Replace weak verbs with stronger action words
3. Add quantifiable metrics to achievements
4. Optimize keyword usage for your target industry
5. Ensure ATS compatibility by following formatting guidelines

ABOUT THIS REPORT
This analysis was generated using JobsyAI's advanced CV analysis engine, which combines natural language processing, ATS simulation, and industry best practices to provide comprehensive feedback on your resume.

For questions about this report or to get personalized career advice, visit JobsyAI.com

Report ID: ${Date.now()}
Analysis Date: ${new Date().toISOString()}
  `.trim()

    // Generate PDF using the existing PDF generator
    try {
      openPrintableVersion(
        reportContent,
        `CV Analysis Report - ${cvData?.personalInfo?.name || "Candidate"} - ${new Date().toLocaleDateString()}`,
      )
    } catch (error) {
      console.error("Error generating PDF report:", error)
      setErrorMessage("❌ Failed to generate PDF report. Please try again.")
      setTimeout(() => setErrorMessage(""), 3000)
    }
  }

  const renderModal = () => {
    if (!showModal) return null

    if (!analysisResults) {
      return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Brain className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Results</h3>
            <p className="text-gray-600 mb-6">Please run an analysis first to see results.</p>
            <Button onClick={() => setShowModal(false)} className="w-full">
              Close
            </Button>
          </div>
        </div>
      )
    }

    if (!analysisResults.success || !analysisResults.results) {
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
                <p className="text-gray-700">{analysisResults.error || "An unexpected error occurred"}</p>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Close
                </Button>
                <Button onClick={handleReanalyze} className="bg-red-600 hover:bg-red-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    const { atsScore, contentQuality, lengthAnalysis, industryFit } = analysisResults.results

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full h-[95vh] flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center">
                  <Brain className="w-7 h-7 mr-3" />
                  CV Analysis Results
                </h2>
                <p className="text-purple-100 mt-2">AI-powered insights to improve your CV</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>

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
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "preview"
                    ? "border-purple-600 text-purple-600 bg-white"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                <Monitor className="w-4 h-4 mr-2 inline" />
                Live Preview
              </button>
            </div>
          </div>

          {/* Notifications */}
          {successMessage && (
            <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 text-sm font-medium">{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 text-sm font-medium">{errorMessage}</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto min-h-0">
            {/* NEW: Live Preview Tab */}
            {activeTab === "preview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {/* Left Side - Quick Apply Recommendations */}
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                      <Edit className="w-5 h-5 mr-2" />
                      Apply Recommendations
                    </h3>
                    <p className="text-sm text-blue-800">
                      Apply AI recommendations and see changes instantly in the live preview on the right. Click the
                      location icon to highlight the text in your CV.
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-amber-200 border border-amber-400 rounded"></div>
                        <span className="text-amber-700">Suggested changes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-200 border border-green-400 rounded"></div>
                        <span className="text-green-700">Applied changes</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Apply Weak Verbs */}
                  {contentQuality?.impact?.weakVerbs && contentQuality.impact.weakVerbs.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-orange-600" />
                        Replace Weak Verbs
                      </h3>
                      <div className="space-y-4 max-h-[500px] overflow-y-auto">
                        {contentQuality.impact.weakVerbs.map((item, index) => {
                          if (typeof item === "string") {
                            return (
                              <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                <div className="text-sm text-gray-700">{item}</div>
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
                                      <span className="text-red-600">&quot;{item.verb || "N/A"}&quot;</span>
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                                          isApplied ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                        }`}
                                      >
                                        {isApplied ? "Applied" : "Dismissed"}
                                      </span>
                                      {isApplied && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 px-2 text-xs border-orange-200 hover:bg-orange-50"
                                          onClick={() => handleUndoChange(changeId)}
                                        >
                                          <RefreshCw className="w-3 h-3 mr-1" />
                                          Undo
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                  {isApplied && (
                                    <div className="text-sm bg-green-100 p-2 rounded border border-green-200">
                                      {item.improvedSentence || "No improved sentence available"}
                                    </div>
                                  )}
                                  {isDismissed && (
                                    <div className="text-sm bg-gray-100 p-2 rounded border border-gray-200 line-through opacity-70">
                                      {item.originalSentence || "No original sentence available"}
                                    </div>
                                  )}
                                </div>
                              )
                            }

                            return (
                              <div key={index} className="p-4 rounded-lg border border-orange-200 bg-orange-50">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-sm flex items-center gap-2">
                                    Replace weak verb:{" "}
                                    <span className="text-red-600">&quot;{item.verb || "N/A"}&quot;</span>
                                    {item.originalSentence && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
                                        onClick={() => highlightTextInCV(item.originalSentence, false)}
                                        title="Show in CV"
                                      >
                                        <MapPin className="w-3 h-3" />
                                      </Button>
                                    )}
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
                                          item.improvedSentence || "",
                                          "experience",
                                          item.location || "Experience 1",
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
                                  {item.originalSentence || "No original sentence available"}
                                </div>
                                <div className="text-sm bg-green-50 p-2 rounded border border-green-100">
                                  <span className="font-medium">Improved: </span>
                                  {item.improvedSentence || "No improved sentence available"}
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

                  {/* Quick Apply Quantification */}
                  {contentQuality?.impact?.missingQuantification &&
                    contentQuality.impact.missingQuantification.length > 0 && (
                      <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                          Add Quantification
                        </h3>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto">
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
                                      isApplied
                                        ? "border-green-200 bg-green-50"
                                        : "border-gray-200 bg-gray-50 opacity-60"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="font-medium text-sm">Add {item.metricType || "metric"} metrics</h4>
                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                                            isApplied ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                          }`}
                                        >
                                          {isApplied ? "Applied" : "Dismissed"}
                                        </span>
                                        {isApplied && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 px-2 text-xs border-orange-200 hover:bg-orange-50"
                                            onClick={() => handleUndoChange(changeId)}
                                          >
                                            <RefreshCw className="w-3 h-3 mr-1" />
                                            Undo
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                    {isApplied && (
                                      <div className="text-sm bg-green-100 p-2 rounded border border-green-200">
                                        {item.suggestedText || "No suggested text available"}
                                      </div>
                                    )}
                                    {isDismissed && (
                                      <div className="text-sm bg-gray-100 p-2 rounded border border-gray-200 line-through opacity-70">
                                        {item.originalText || "No original text available"}
                                      </div>
                                    )}
                                  </div>
                                )
                              }

                              return (
                                <div key={index} className="p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium text-sm flex items-center gap-2">
                                      Add {item.metricType || "metric"} metrics
                                      {item.originalText && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
                                          onClick={() => highlightTextInCV(item.originalText, false)}
                                          title="Show in CV"
                                        >
                                          <MapPin className="w-3 h-3" />
                                        </Button>
                                      )}
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
                                            item.suggestedText || "",
                                            "experience",
                                            item.location || "Experience 1",
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
                                    {item.originalText || "No original text available"}
                                  </div>
                                  <div className="text-sm bg-green-50 p-2 rounded border border-green-100">
                                    <span className="font-medium">Suggested: </span>
                                    {item.suggestedText || "No suggested text available"}
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
                </div>

                {/* Right Side - Live CV Preview */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-green-900 mb-2 flex items-center">
                      <Monitor className="w-5 h-5 mr-2" />
                      Live CV Preview
                    </h3>
                    <p className="text-sm text-green-800">
                      This preview updates in real-time as you apply recommendations. Click the{" "}
                      <MapPin className="w-3 h-3 inline mx-1" /> icon to highlight specific text. Applied changes stay
                      highlighted in green.
                    </p>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                    <div className="bg-gray-50 border-b border-gray-200 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600 ml-2">CV Preview</span>
                      </div>
                      <div className="text-xs text-gray-500">Live Updates</div>
                    </div>
                    <div ref={cvPreviewRef} className="p-4 max-h-[600px] overflow-y-auto bg-white">
                      {editableCVData && <CVPreview cvData={editableCVData} templateId={selectedTemplate} />}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EXISTING: Overview Tab */}
            {activeTab === "overview" && (
              <div className="p-6 space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">📊 Analysis Data Source</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>
                      <strong>CV Name:</strong> {cvData?.personalInfo?.name || "Not provided"}
                    </p>
                    <p>
                      <strong>Email:</strong> {cvData?.personalInfo?.email || "Not provided"}
                    </p>
                    <p>
                      <strong>Experience Entries:</strong> {cvData?.experience?.length || 0}
                    </p>
                    <p>
                      <strong>Skills:</strong> {cvData?.skills?.length || 0}
                    </p>
                    <p>
                      <strong>Word Count:</strong> {lengthAnalysis?.wordCount || calculateLocalWordCount(cvData)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      {getPassRateIcon(atsScore?.passRate || "")}
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl font-bold text-blue-600">{atsScore?.overall || 0}</span>
                        <span className="text-sm font-medium text-gray-600">/ 100</span>
                      </div>
                      <Progress value={atsScore?.overall || 0} className="h-3" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Pass Rate:</span>
                      <span className={`text-sm font-bold ${getScoreColor(atsScore?.overall || 0)}`}>
                        {atsScore?.passRate || "Unknown"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Content Quality</h3>
                          <p className="text-sm text-gray-600">Grammar & Impact</p>
                        </div>
                      </div>
                      <Award className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl font-bold text-green-600">{contentQuality?.overall || 0}</span>
                        <span className="text-sm font-medium text-gray-600">/ 100</span>
                      </div>
                      <Progress value={contentQuality?.overall || 0} className="h-3" />
                    </div>
                    <div className="text-sm text-gray-600">
                      {contentQuality?.grammar?.issues?.length || 0} grammar issues found
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Length Analysis</h3>
                          <p className="text-sm text-gray-600">Word Count & Pages</p>
                        </div>
                      </div>
                      {lengthAnalysis?.isOptimal ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-600" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Words:</span>
                        <span className="text-sm font-medium">{lengthAnalysis?.wordCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pages:</span>
                        <span className="text-sm font-medium">{lengthAnalysis?.pageEstimate || 0}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {lengthAnalysis?.recommendation || "No recommendation available"}
                      </div>
                    </div>
                  </div>
                </div>

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
                        <div className="text-2xl font-bold text-orange-600 mb-1">{industryFit.score || 0}</div>
                        <div className="text-sm text-gray-600">Industry Score</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {industryFit.matchedKeywords?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Matched Keywords</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600 mb-1">
                          {industryFit.missingKeywords?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Missing Keywords</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* EXISTING: Details Tab */}
            {activeTab === "details" && (
              <div className="p-6 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-600" />
                    ATS Score Breakdown
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {Object.entries(atsScore?.breakdown || {}).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <div
                          className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${getScoreBackground(
                            value,
                          )}`}
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

                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-green-600" />
                    Content Quality Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Grammar Analysis</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Score:</span>
                          <span className={`text-sm font-medium ${getScoreColor(contentQuality?.grammar?.score || 0)}`}>
                            {contentQuality?.grammar?.score || 0}/100
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Issues:</span>
                          <span className="text-sm font-medium">{contentQuality?.grammar?.issues?.length || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Impact Analysis</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Score:</span>
                          <span className={`text-sm font-medium ${getScoreColor(contentQuality?.impact?.score || 0)}`}>
                            {contentQuality?.impact?.score || 0}/100
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Weak Verbs:</span>
                          <span className="text-sm font-medium">{contentQuality?.impact?.weakVerbs?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Passive Voice:</span>
                          <span className="text-sm font-medium">{contentQuality?.impact?.passiveVoiceCount || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Clarity Analysis</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Score:</span>
                          <span className={`text-sm font-medium ${getScoreColor(contentQuality?.clarity?.score || 0)}`}>
                            {contentQuality?.clarity?.score || 0}/100
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Avg Sentence:</span>
                          <span className="text-sm font-medium">
                            {contentQuality?.clarity?.avgSentenceLength || 0} words
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Readability:</span>
                          <span className="text-sm font-medium">{contentQuality?.clarity?.readabilityScore || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {contentQuality?.grammar?.issues && contentQuality.grammar.issues.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                      Grammar Issues ({contentQuality.grammar.issues.length})
                    </h3>
                    <div className="space-y-3">
                      {contentQuality.grammar.issues.slice(0, 5).map((issue, index) => (
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
                      {contentQuality.grammar.issues.length > 5 && (
                        <div className="text-center text-sm text-gray-500">
                          And {contentQuality.grammar.issues.length - 5} more issues...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {contentQuality?.impact?.weakVerbs && contentQuality.impact.weakVerbs.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-orange-600" />
                      Weak Verbs ({contentQuality.impact.weakVerbs.length})
                    </h3>
                    <div className="space-y-3">
                      {contentQuality.impact.weakVerbs.map((item, index) => {
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
                                    Replace weak verb: &quot;{item.verb}&quot;
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

                {industryFit && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Target className="w-5 h-5 mr-2 text-green-600" />
                      Industry Keywords
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          Matched Keywords ({industryFit.matchedKeywords?.length || 0})
                        </h4>
                        <div className="space-y-2">
                          {industryFit.matchedKeywords?.map((item, index) => {
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
                                      Context: &quot;{item.context}&quot;
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

                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                          Missing Keywords ({industryFit.missingKeywords?.length || 0})
                        </h4>
                        <div className="space-y-2">
                          {industryFit.missingKeywords?.map((item, index) => {
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
                                      Example: &quot;{item.exampleUsage}&quot;
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

            {/* EXISTING: Recommendations Tab */}
            {activeTab === "recommendations" && (
              <div className="p-6 space-y-6">
                {atsScore?.recommendations && atsScore.recommendations.length > 0 && (
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

                {contentQuality?.impact?.weakVerbs && contentQuality.impact.weakVerbs.length > 0 && (
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
                                    <span className="text-red-600">&quot;{item.verb || "N/A"}&quot;</span>
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                                        isApplied ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {isApplied ? "Applied" : "Dismissed"}
                                    </span>
                                    {isApplied && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 px-2 text-xs border-orange-200 hover:bg-orange-50"
                                        onClick={() => handleUndoChange(changeId)}
                                      >
                                        <RefreshCw className="w-3 h-3 mr-1" />
                                        Undo
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                {isApplied && (
                                  <div className="text-sm bg-green-100 p-2 rounded border border-green-200">
                                    {item.improvedSentence || "No improved sentence available"}
                                  </div>
                                )}
                                {isDismissed && (
                                  <div className="text-sm bg-gray-100 p-2 rounded border border-gray-200 line-through opacity-70">
                                    {item.originalSentence || "No original sentence available"}
                                  </div>
                                )}
                              </div>
                            )
                          }

                          return (
                            <div key={index} className="p-4 rounded-lg border border-orange-200 bg-orange-50">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-sm flex items-center gap-2">
                                  Replace weak verb:{" "}
                                  <span className="text-red-600">&quot;{item.verb || "N/A"}&quot;</span>
                                  {item.originalSentence && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
                                      onClick={() => highlightTextInCV(item.originalSentence, false)}
                                      title="Show in CV"
                                    >
                                      <MapPin className="w-3 h-3" />
                                    </Button>
                                  )}
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
                                        item.improvedSentence || "",
                                        "experience",
                                        item.location || "Experience 1",
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
                                {item.originalSentence || "No original sentence available"}
                              </div>
                              <div className="text-sm bg-green-50 p-2 rounded border border-green-100">
                                <span className="font-medium">Improved: </span>
                                {item.improvedSentence || "No improved sentence available"}
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

                {contentQuality?.impact?.missingQuantification &&
                  contentQuality.impact.missingQuantification.length > 0 && (
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
                                    <h4 className="font-medium text-sm">Add {item.metricType || "metric"} metrics</h4>
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                                          isApplied ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                        }`}
                                      >
                                        {isApplied ? "Applied" : "Dismissed"}
                                      </span>
                                      {isApplied && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 px-2 text-xs border-orange-200 hover:bg-orange-50"
                                          onClick={() => handleUndoChange(changeId)}
                                        >
                                          <RefreshCw className="w-3 h-3 mr-1" />
                                          Undo
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                  {isApplied && (
                                    <div className="text-sm bg-green-100 p-2 rounded border border-green-200">
                                      {item.suggestedText || "No suggested text available"}
                                    </div>
                                  )}
                                  {isDismissed && (
                                    <div className="text-sm bg-gray-100 p-2 rounded border border-gray-200 line-through opacity-70">
                                      {item.originalText || "No original text available"}
                                    </div>
                                  )}
                                </div>
                              )
                            }

                            return (
                              <div key={index} className="p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-sm flex items-center gap-2">
                                    Add {item.metricType || "metric"} metrics
                                    {item.originalText && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
                                        onClick={() => highlightTextInCV(item.originalText, false)}
                                        title="Show in CV"
                                      >
                                        <MapPin className="w-3 h-3" />
                                      </Button>
                                    )}
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
                                          item.suggestedText || "",
                                          "experience",
                                          item.location || "Experience 1",
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
                                  {item.originalText || "No original text available"}
                                </div>
                                <div className="text-sm bg-green-50 p-2 rounded border border-green-100">
                                  <span className="font-medium">Suggested: </span>
                                  {item.suggestedText || "No suggested text available"}
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

                {industryFit && industryFit.recommendations && industryFit.recommendations.length > 0 && (
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
              </div>
            )}
          </div>

          <div className="border-t bg-gray-50 px-6 py-4 flex justify-between items-center flex-shrink-0">
            <div className="text-sm text-gray-600">Analysis completed • Powered by AI</div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Close
              </Button>
              <Button
                onClick={handleReanalyze}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reanalyze
              </Button>
              <Button
                onClick={handleExportReport}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-4 py-2 max-w-fit sm:max-w-36 lg:max-w-40 whitespace-nowrap"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={handleAnalysis}
        disabled={disabled || isAnalyzing}
        variant={variant}
        size={size}
        className={`${className} ${
          variant === "default"
            ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            : ""
        }`}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing CV...
          </>
        ) : (
          <>
            <Brain className="w-4 h-4 mr-2" />
            <Zap className="w-3 h-3 mr-1" />
            AI Analysis
          </>
        )}
      </Button>

      {renderModal()}
    </>
  )
}
