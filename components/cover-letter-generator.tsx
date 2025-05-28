"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, Wand2, Download, ArrowLeft, CheckCircle, Copy, RefreshCw } from "lucide-react"
import { generateCoverLetter, improveCv } from "@/lib/ai-service"

type Step = 1 | 2 | 3 | 4

export function CoverLetterGenerator() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [jobPosting, setJobPosting] = useState("")
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvText, setCvText] = useState("")
  const [coverLetter, setCoverLetter] = useState("")
  const [cvRecommendations, setCvRecommendations] = useState("")
  const [progress, setProgress] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // Simple notification system
  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCvFile(file)

      try {
        // Create form data to send the file
        const formData = new FormData()
        formData.append("file", file)

        // Send to our API route for parsing
        const response = await fetch("/api/cv-parser", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (response.ok) {
          setCvText(data.text)
          showNotification("CV uploaded successfully! Your CV has been parsed and is ready for processing.")
        } else {
          throw new Error(data.error || "Failed to parse CV")
        }
      } catch (error) {
        console.error("Error parsing CV:", error)
        showNotification(
          "Error parsing CV. We couldn't extract text from your CV. Please try pasting it manually.",
          "error",
        )
      }
    }
  }

  const handleGenerate = async () => {
    if (!jobPosting || (!cvFile && !cvText)) return

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => (window.location.href = "/")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Button>

        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Cover Letter Generator</h1>
          <p className="text-xl text-gray-600">
            Upload your CV and job posting to get a perfect application in 30 seconds
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center space-x-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
              </div>
              {step < 4 && <div className={`w-16 h-0.5 mx-2 ${currentStep > step ? "bg-blue-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Job Posting */}
      {currentStep === 1 && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Step 1: Paste Job Posting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="job-posting">Job Posting</Label>
              <Textarea
                id="job-posting"
                placeholder="Paste the complete job posting here, including job title, requirements, responsibilities, and company information..."
                value={jobPosting}
                onChange={(e) => setJobPosting(e.target.value)}
                rows={12}
                className="mt-2"
              />
            </div>
            <Button onClick={() => setCurrentStep(2)} disabled={!jobPosting.trim()} className="w-full" size="lg">
              Continue to CV Upload
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: CV Upload */}
      {currentStep === 2 && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Step 2: Upload Your CV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div>
              <Label htmlFor="cv-upload">Upload CV (PDF, DOC, DOCX)</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  id="cv-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="cv-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">
                    {cvFile ? cvFile.name : "Click to upload your CV or drag and drop"}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Supports PDF, DOC, DOCX up to 10MB</p>
                </label>
              </div>
            </div>

            <div className="text-center text-gray-500 font-medium">OR</div>

            {/* Text Input */}
            <div>
              <Label htmlFor="cv-text">Paste Your CV Text</Label>
              <Textarea
                id="cv-text"
                placeholder="Paste your CV content here as an alternative to file upload..."
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                rows={10}
                className="mt-2"
              />
            </div>

            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1" size="lg">
                Back
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={(!cvFile && !cvText.trim()) || isGenerating}
                className="flex-1"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Application
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Generating */}
      {currentStep === 3 && (
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-12 text-center">
            <div className="space-y-6">
              <Wand2 className="w-16 h-16 text-blue-600 mx-auto animate-spin" />
              <h3 className="text-2xl font-semibold text-gray-900">AI is crafting your perfect application...</h3>
              <p className="text-gray-600">Analyzing job requirements and optimizing your application</p>
              <div className="max-w-md mx-auto">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-gray-500 mt-2">{progress}% complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Results */}
      {currentStep === 4 && (
        <div className="space-y-8">
          {/* Cover Letter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Your Tailored Cover Letter
                </span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(coverLetter)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadAsText(coverLetter, "cover-letter.txt")}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg border">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">{coverLetter}</pre>
              </div>
            </CardContent>
          </Card>

          {/* CV Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Wand2 className="w-5 h-5 mr-2" />
                  CV Optimization Recommendations
                </span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(cvRecommendations)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadAsText(cvRecommendations, "cv-recommendations.txt")}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                  {cvRecommendations}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={resetGenerator} size="lg">
              <RefreshCw className="w-4 h-4 mr-2" />
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
            >
              <Download className="w-4 h-4 mr-2" />
              Download Complete Package
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
