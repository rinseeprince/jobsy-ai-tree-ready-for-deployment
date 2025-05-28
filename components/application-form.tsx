"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Wand2, Download, ArrowLeft } from "lucide-react"
import { generateCoverLetter, improveCv } from "@/lib/ai-service"

export function ApplicationForm() {
  const [step, setStep] = useState(1)
  const [jobPosting, setJobPosting] = useState("")
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvText, setCvText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [cvSuggestions, setCvSuggestions] = useState("")

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setCvFile(file)
      // In a real app, you'd extract text from the PDF/DOC file
      setCvText("Sample CV content would be extracted here...")
    }
  }

  const handleGenerate = async () => {
    if (!jobPosting || (!cvFile && !cvText)) return

    setIsGenerating(true)
    try {
      // Generate cover letter and CV improvements
      const [coverLetterResult, cvImprovements] = await Promise.all([
        generateCoverLetter(jobPosting, cvText),
        improveCv(jobPosting, cvText),
      ])

      setCoverLetter(coverLetterResult)
      setCvSuggestions(cvImprovements)
      setStep(3)
    } catch (error) {
      console.error("Error generating content:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => window.history.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Perfect Application</h1>
        <p className="text-gray-600">Upload your CV and job posting to get AI-powered improvements and cover letter</p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= num ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {num}
              </div>
              {num < 3 && <div className={`w-16 h-0.5 mx-2 ${step > num ? "bg-blue-600" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Step 1: Job Posting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="job-posting">Paste the job posting here</Label>
              <Textarea
                id="job-posting"
                placeholder="Copy and paste the full job posting, including requirements, responsibilities, and company information..."
                value={jobPosting}
                onChange={(e) => setJobPosting(e.target.value)}
                rows={10}
                className="mt-2"
              />
            </div>
            <Button onClick={() => setStep(2)} disabled={!jobPosting.trim()} className="w-full">
              Continue to CV Upload
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Step 2: Upload Your CV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="cv-upload">Upload CV (PDF, DOC, DOCX)</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  id="cv-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="cv-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">{cvFile ? cvFile.name : "Click to upload your CV or drag and drop"}</p>
                  <p className="text-sm text-gray-500 mt-2">Supports PDF, DOC, DOCX up to 10MB</p>
                </label>
              </div>
            </div>

            <div className="text-center text-gray-500">or</div>

            <div>
              <Label htmlFor="cv-text">Paste your CV text</Label>
              <Textarea
                id="cv-text"
                placeholder="Paste your CV content here as an alternative to file upload..."
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                rows={8}
                className="mt-2"
              />
            </div>

            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={(!cvFile && !cvText.trim()) || isGenerating}
                className="flex-1"
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

      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Generated Cover Letter
                </span>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">{coverLetter}</pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wand2 className="w-5 h-5 mr-2" />
                CV Improvement Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">{cvSuggestions}</pre>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              Start New Application
            </Button>
            <Button className="flex-1">Save & Download All</Button>
          </div>
        </div>
      )}
    </div>
  )
}
