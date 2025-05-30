"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  FileText,
  Wand2,
  Download,
  ArrowLeft,
  CheckCircle,
  Copy,
  RefreshCw,
  Sparkles,
  Target,
  AlertCircle,
  Info,
  Type,
  FileX,
  Star,
  ArrowRight,
} from "lucide-react"
import { generateCoverLetter, improveCv } from "@/lib/ai-service"

type Step = 1 | 2 | 3 | 4

// Component to format CV recommendations with better styling
function FormattedCVRecommendations({ text }: { text: string }) {
  const formatText = (text: string) => {
    // Split text into lines
    const lines = text.split("\n").filter((line) => line.trim())

    return lines
      .map((line, index) => {
        const trimmedLine = line.trim()

        // Check for section headers (lines that end with colon or are all caps)
        if (trimmedLine.endsWith(":") || (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 3)) {
          return (
            <h3 key={index} className="text-lg font-bold text-purple-800 mt-6 mb-3 flex items-center">
              <Star className="w-5 h-5 mr-2 text-purple-600" />
              {trimmedLine}
            </h3>
          )
        }

        // Check for numbered recommendations (1., 2., etc.)
        if (/^\d+\./.test(trimmedLine)) {
          const [number, ...rest] = trimmedLine.split(".")
          const content = rest.join(".").trim()
          return (
            <div key={index} className="mb-4 p-4 bg-white/60 rounded-lg border-l-4 border-purple-400">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {number}
                </div>
                <p className="text-gray-800 font-medium leading-relaxed">{content}</p>
              </div>
            </div>
          )
        }

        // Check for bullet points (-, •, *, etc.)
        if (/^[-•*]/.test(trimmedLine)) {
          const content = trimmedLine.substring(1).trim()
          return (
            <div key={index} className="mb-3 flex items-start space-x-3">
              <ArrowRight className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
              <p className="text-gray-700 leading-relaxed">{content}</p>
            </div>
          )
        }

        // Check for keywords to emphasize (common CV recommendation terms)
        const keywords = [
          "Keywords",
          "Skills",
          "Experience",
          "Achievements",
          "Quantify",
          "Results",
          "Action verbs",
          "Metrics",
          "Accomplishments",
          "Certifications",
          "Education",
          "Summary",
          "Objective",
          "Professional",
          "Leadership",
          "Management",
          "Technical",
          "Add",
          "Include",
          "Highlight",
          "Emphasize",
          "Improve",
          "Update",
          "Remove",
        ]

        let formattedLine = trimmedLine
        keywords.forEach((keyword) => {
          const regex = new RegExp(`\\b${keyword}\\b`, "gi")
          formattedLine = formattedLine.replace(regex, `<strong class="text-purple-700 font-semibold">$&</strong>`)
        })

        // Regular paragraphs
        if (trimmedLine.length > 0) {
          return (
            <p
              key={index}
              className="text-gray-700 leading-relaxed mb-3"
              dangerouslySetInnerHTML={{ __html: formattedLine }}
            />
          )
        }

        return null
      })
      .filter(Boolean)
  }

  return <div className="space-y-2">{formatText(text)}</div>
}

export function CoverLetterGenerator() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [jobPosting, setJobPosting] = useState("")
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvText, setCvText] = useState("")
  const [coverLetter, setCoverLetter] = useState("")
  const [cvRecommendations, setCvRecommendations] = useState("")
  const [progress, setProgress] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null)

  // Simple notification system
  const showNotification = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 8000)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCvFile(file)
      setIsUploading(true)

      try {
        // Create form data to send the file
        const formData = new FormData()
        formData.append("file", file)

        showNotification("Processing your file... This may take a moment.", "info")

        // Send to our API route for parsing
        const response = await fetch("/api/cv-parser", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (response.ok) {
          setCvText(data.text)
          showNotification(
            `${file.type === "application/pdf" ? "PDF" : "Document"} uploaded and parsed successfully! Your CV text is ready for processing.`,
          )
        } else {
          // Handle different error types
          if (data.error === "PDF_PARSING_UNAVAILABLE") {
            showNotification(
              "PDF parsing is temporarily unavailable. Please convert your PDF to Word format or paste your CV text manually below.",
              "error",
            )
          } else if (data.alternatives) {
            showNotification(`${data.message} Please try: ${data.alternatives.join(", ")}`, "error")
          } else {
            showNotification(
              data.message || data.error || "Could not process your file. Please try pasting your CV text manually.",
              "error",
            )
          }
        }
      } catch (error) {
        console.error("Error parsing CV:", error)
        showNotification("File upload failed. Please try pasting your CV text manually below.", "error")
      } finally {
        setIsUploading(false)
      }
    }
  }

  const handleGenerate = async () => {
    if (!jobPosting || !cvText.trim()) {
      showNotification("Please provide both a job posting and your CV content.", "error")
      return
    }

    setIsGenerating(true)
    setCurrentStep(3)
    setProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Generate cover letter and CV improvements
      const [coverLetterResult, cvImprovements] = await Promise.all([
        generateCoverLetter(jobPosting, cvText),
        improveCv(jobPosting, cvText),
      ])

      clearInterval(progressInterval)
      setProgress(100)

      setTimeout(() => {
        setCoverLetter(coverLetterResult)
        setCvRecommendations(cvImprovements)
        setCurrentStep(4)
        setIsGenerating(false)
        showNotification("Application package ready! Your cover letter and CV recommendations have been generated.")
      }, 500)
    } catch (error) {
      console.error("Error generating content:", error)
      setIsGenerating(false)
      setCurrentStep(2) // Go back to step 2
      showNotification("Generation failed. There was an error generating your application. Please try again.", "error")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showNotification("Content has been copied to your clipboard.")
  }

  const downloadAsText = (content: string, filename: string) => {
    const element = document.createElement("a")
    const file = new Blob([content], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const resetGenerator = () => {
    setCurrentStep(1)
    setJobPosting("")
    setCvFile(null)
    setCvText("")
    setCoverLetter("")
    setCvRecommendations("")
    setProgress(0)
    setIsGenerating(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl backdrop-blur-sm border max-w-md ${
              notification.type === "success"
                ? "bg-green-500/90 text-white border-green-400"
                : notification.type === "error"
                  ? "bg-red-500/90 text-white border-red-400"
                  : "bg-blue-500/90 text-white border-blue-400"
            } animate-in slide-in-from-right duration-300`}
          >
            <div className="flex items-start space-x-2">
              {notification.type === "success" ? (
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              ) : notification.type === "error" ? (
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              ) : (
                <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
              )}
              <span className="font-medium text-sm leading-relaxed">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-12">
          <Button variant="ghost" onClick={() => (window.location.href = "/")} className="mb-6 hover:bg-white/50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Button>

          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
              AI Cover Letter Generator
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform any job posting into your perfect application in just 30 seconds
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-16">
          <div className="flex items-center space-x-6">
            {[
              { num: 1, icon: FileText, label: "Job Posting" },
              { num: 2, icon: Upload, label: "Upload CV" },
              { num: 3, icon: Wand2, label: "AI Magic" },
              { num: 4, icon: Target, label: "Results" },
            ].map((step, index) => (
              <div key={step.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      currentStep >= step.num
                        ? "bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg scale-110"
                        : "bg-white text-gray-400 border-2 border-gray-200"
                    }`}
                  >
                    {currentStep > step.num ? <CheckCircle className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      currentStep >= step.num ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < 3 && (
                  <div
                    className={`w-20 h-1 mx-4 rounded-full transition-all duration-300 ${
                      currentStep > step.num ? "bg-gradient-to-r from-blue-600 to-teal-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Job Posting */}
        {currentStep === 1 && (
          <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden rounded-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white -m-6 mx-0 mb-0 p-6 rounded-t-lg">
              <CardTitle className="flex items-center text-2xl">
                <FileText className="w-6 h-6 mr-3" />
                Step 1: Paste the Job Posting
              </CardTitle>
              <p className="text-blue-100 mt-2">Copy the complete job description to get the most accurate results</p>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div>
                <Label htmlFor="job-posting" className="text-lg font-semibold text-gray-900">
                  Job Posting
                </Label>
                <p className="text-gray-600 mb-4">
                  Include job title, requirements, responsibilities, and company information
                </p>
                <Textarea
                  id="job-posting"
                  placeholder="Paste the complete job posting here..."
                  value={jobPosting}
                  onChange={(e) => setJobPosting(e.target.value)}
                  rows={12}
                  className="mt-2 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                />
              </div>
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!jobPosting.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-lg py-6 shadow-lg"
                size="lg"
              >
                Continue to CV Upload
                <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: CV Upload */}
        {currentStep === 2 && (
          <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden rounded-lg">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white -m-6 mx-0 mb-0 p-6 rounded-t-lg">
              <CardTitle className="flex items-center text-2xl">
                <Upload className="w-6 h-6 mr-3" />
                Step 2: Upload Your CV
              </CardTitle>
              <p className="text-blue-100 mt-2">
                Upload your CV (Word document recommended) or paste the text - wen will analyze it against the job
                requirements
              </p>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {/* PDF Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FileX className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">📄 PDF Support Temporarily Unavailable</p>
                    <p className="text-amber-700">
                      Due to a technical issue, PDF parsing is currently disabled. Please use Word documents (.docx) or
                      paste your CV text manually for the best experience.
                    </p>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <Label htmlFor="cv-upload" className="text-lg font-semibold text-gray-900">
                  Upload CV File (Word Documents Only)
                </Label>
                <div className="mt-4 border-3 border-dashed border-blue-300 rounded-xl p-12 text-center hover:border-blue-500 transition-all duration-300 bg-gradient-to-br from-blue-50 to-teal-50 hover:from-blue-100 hover:to-teal-100">
                  <input
                    id="cv-upload"
                    type="file"
                    accept=".doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <label htmlFor="cv-upload" className="cursor-pointer">
                    <div className="p-4 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      {isUploading ? (
                        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Upload className="w-10 h-10 text-white" />
                      )}
                    </div>
                    <p className="text-gray-700 text-xl font-semibold">
                      {isUploading ? (
                        <span className="text-blue-600">Processing your file...</span>
                      ) : cvFile ? (
                        <span className="text-green-600 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          {cvFile.name}
                        </span>
                      ) : (
                        "Click to upload your CV or drag and drop"
                      )}
                    </p>
                    <p className="text-gray-500 mt-3">
                      {isUploading
                        ? "Please wait while we extract your CV text..."
                        : "Supports Word documents (.docx, .doc) up to 10MB"}
                    </p>
                  </label>
                </div>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center px-6 py-2 rounded-full bg-gray-100 text-gray-600 font-medium">
                  <span>OR (Recommended)</span>
                </div>
              </div>

              {/* Text Input - Always show */}
              <div>
                <Label htmlFor="cv-text" className="text-lg font-semibold text-gray-900 flex items-center">
                  <Type className="w-5 h-5 mr-2" />
                  Paste Your CV Text
                </Label>
                <p className="text-gray-600 mb-4">For the best results, paste your CV content directly here</p>
                <Textarea
                  id="cv-text"
                  placeholder="Paste your CV content here..."
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  rows={10}
                  className="mt-2 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 border-2 border-gray-300 hover:border-gray-400"
                  size="lg"
                  disabled={isUploading}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={!cvText.trim() || isGenerating || isUploading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-lg py-6 shadow-lg"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Wand2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Magic...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Perfect Application
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Generating */}
        {currentStep === 3 && (
          <Card className="max-w-4xl mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-16 text-center">
              <div className="space-y-8">
                <div className="relative">
                  <div className="p-6 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 w-32 h-32 mx-auto flex items-center justify-center shadow-2xl">
                    <Wand2 className="w-16 h-16 text-white animate-spin" />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 opacity-20 animate-ping"></div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
                    AI is crafting your perfect application...
                  </h3>
                  <p className="text-xl text-gray-600 mb-8">
                    Analyzing job requirements and optimizing your application for maximum impact
                  </p>
                </div>
                <div className="max-w-md mx-auto space-y-4">
                  <Progress value={progress} className="h-3 bg-gray-200" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{progress}% complete</span>
                    <span className="font-medium">Almost ready...</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Results */}
        {currentStep === 4 && (
          <div className="space-y-8">
            {/* Cover Letter */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white -m-6 mx-0 mb-0 p-6 rounded-t-lg">
                <CardTitle className="flex items-center justify-between text-2xl">
                  <span className="flex items-center">
                    <FileText className="w-6 h-6 mr-3" />
                    Your Tailored Cover Letter
                  </span>
                  <div className="flex space-x-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => copyToClipboard(coverLetter)}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => downloadAsText(coverLetter, "cover-letter.txt")}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardTitle>
                <p className="text-green-100 mt-2">Perfectly tailored to match the job requirements</p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-xl border-2 border-green-200">
                  <pre className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed text-lg">
                    {coverLetter}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* CV Recommendations - Now with enhanced formatting */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white -m-6 mx-0 mb-0 p-6 rounded-t-lg">
                <CardTitle className="flex items-center justify-between text-2xl">
                  <span className="flex items-center">
                    <Target className="w-6 h-6 mr-3" />
                    CV Optimization Recommendations
                  </span>
                  <div className="flex space-x-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => copyToClipboard(cvRecommendations)}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => downloadAsText(cvRecommendations, "cv-recommendations.txt")}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardTitle>
                <p className="text-purple-100 mt-2">Specific improvements to maximize your chances</p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-xl border-2 border-purple-200">
                  <FormattedCVRecommendations text={cvRecommendations} />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-6 pt-8">
              <Button
                variant="outline"
                onClick={resetGenerator}
                size="lg"
                className="border-2 border-gray-300 hover:border-gray-400 px-8 py-4"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Create Another Application
              </Button>
              <Button
                onClick={() =>
                  downloadAsText(
                    `COVER LETTER:\n\n${coverLetter}\n\n\nCV RECOMMENDATIONS:\n\n${cvRecommendations}`,
                    "complete-application-package.txt",
                  )
                }
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 px-8 py-4 shadow-lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Complete Package
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
