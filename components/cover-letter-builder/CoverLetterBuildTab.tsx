"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, RefreshCw, Wand2, FileText, Database, CheckCircle, Save, Download, Rocket } from "lucide-react"
import type { CoverLetterData } from "@/lib/cover-letter-templates"
import { ApplicationsService, type SavedCV } from "@/lib/supabase"
import type { CVData } from "@/lib/cv-templates"
import { generateCoverLetter } from "@/lib/ai-service"

interface CoverLetterBuildTabProps {
  coverLetterData: CoverLetterData
  updatePersonalInfo: (field: string, value: string) => void
  updateJobInfo: (field: string, value: string) => void
  updateContent: (field: "opening" | "body" | "closing", value: string) => void
  regenerateContent: () => void
  isRegenerating: boolean
  isLoading: boolean
  onSave: () => void
  onDownloadPDF: () => void
  isSaving?: boolean
}

export const CoverLetterBuildTab = ({
  coverLetterData,
  updatePersonalInfo,
  updateJobInfo,
  updateContent,
  regenerateContent,
  isRegenerating,
  isLoading,
  onSave,
  onDownloadPDF,
  isSaving = false,
}: CoverLetterBuildTabProps) => {
  const [selectedCVId, setSelectedCVId] = useState("")
  const [userCVs, setUserCVs] = useState<SavedCV[]>([])
  const [loadingCVs, setLoadingCVs] = useState(false)
  const [uploadingCV, setUploadingCV] = useState(false)
  const [generatingContent, setGeneratingContent] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  // Load user's CVs on component mount
  useEffect(() => {
    loadUserCVs()
  }, [])

  const loadUserCVs = async () => {
    setLoadingCVs(true)
    try {
      const cvs = await ApplicationsService.getUserSavedCVs()
      setUserCVs(cvs)
    } catch (error) {
      console.error("Error loading CVs:", error)
    } finally {
      setLoadingCVs(false)
    }
  }

  const handleLoadFromCV = async () => {
    if (!selectedCVId) return

    try {
      const cv = await ApplicationsService.getSavedCV(selectedCVId)
      if (cv) {
        // Convert CV data to text content for parsing
        const content = convertCVDataToText(cv.cv_data)

        // Try to extract name (usually first line or after "Name:")
        const nameMatch = content.match(/(?:Name[:\s]+)([^\n]+)/i) || content.match(/^([A-Z][a-z]+ [A-Z][a-z]+)/m)
        if (nameMatch) {
          updatePersonalInfo("name", nameMatch[1].trim())
        }

        // Try to extract email
        const emailMatch = content.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
        if (emailMatch) {
          updatePersonalInfo("email", emailMatch[1])
        }

        // Try to extract phone
        const phoneMatch =
          content.match(/(?:Phone[:\s]+|Tel[:\s]+|Mobile[:\s]+)([+\d\s\-$$$$]+)/i) ||
          content.match(/(\+?[\d\s\-$$$$]{10,})/i)
        if (phoneMatch) {
          updatePersonalInfo("phone", phoneMatch[1].trim())
        }

        // Try to extract location
        const locationMatch = content.match(/(?:Address[:\s]+|Location[:\s]+)([^\n]+)/i)
        if (locationMatch) {
          updatePersonalInfo("location", locationMatch[1].trim())
        }

        // Try to extract LinkedIn
        const linkedinMatch = content.match(/(linkedin\.com\/in\/[^\s]+)/i)
        if (linkedinMatch) {
          updatePersonalInfo("linkedin", linkedinMatch[1])
        }

        showNotification("Personal information loaded from CV successfully!")
      }
    } catch (error) {
      console.error("Error loading CV:", error)
      showNotification("Error loading CV. Please try again.")
    }
  }

  // Helper function to convert CV data to text for parsing
  const convertCVDataToText = (cvData: CVData): string => {
    let text = ""
    
    // Add personal info
    if (cvData.personalInfo) {
      const pi = cvData.personalInfo
      if (pi.name) text += `Name: ${pi.name}\n`
      if (pi.email) text += `Email: ${pi.email}\n`
      if (pi.phone) text += `Phone: ${pi.phone}\n`
      if (pi.location) text += `Location: ${pi.location}\n`
      if (pi.linkedin) text += `LinkedIn: ${pi.linkedin}\n`
      if (pi.website) text += `Website: ${pi.website}\n`
      if (pi.summary) text += `Summary: ${pi.summary}\n`
    }

    // Add experience
    if (cvData.experience && Array.isArray(cvData.experience)) {
      text += "\nExperience:\n"
      cvData.experience.forEach((exp) => {
        if (exp.title) text += `${exp.title}\n`
        if (exp.company) text += `${exp.company}\n`
        if (exp.description) text += `${exp.description}\n\n`
      })
    }

    // Add education
    if (cvData.education && Array.isArray(cvData.education)) {
      text += "\nEducation:\n"
      cvData.education.forEach((edu) => {
        if (edu.degree) text += `${edu.degree}\n`
        if (edu.institution) text += `${edu.institution}\n`
        if (edu.description) text += `${edu.description}\n\n`
      })
    }

    return text
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingCV(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/cv-parser", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        // For now, we'll skip saving uploaded CVs to the saved_cvs table
        // since the CV parser returns raw text, not structured CVData
        // The user can create a proper CV using the CV Builder instead
        showNotification("CV uploaded and parsed successfully! Please use the CV Builder to create a structured CV.")
      } else {
        showNotification(`Error: ${data.message || "Failed to parse CV"}`)
      }
    } catch (error) {
      console.error("Error uploading CV:", error)
      showNotification("Error uploading CV. Please try again.")
    } finally {
      setUploadingCV(false)
    }
  }

  const handleGenerateContent = async () => {
    if (!coverLetterData.jobInfo.jobPosting.trim()) {
      showNotification("Please provide a job description first.")
      return
    }

    // Get CV content from selected CV or use existing personal info
    let cvContent = ""
    if (selectedCVId) {
      try {
        const cv = await ApplicationsService.getSavedCV(selectedCVId)
        if (cv) {
          cvContent = convertCVDataToText(cv.cv_data)
        }
      } catch (error) {
        console.error("Error getting CV content:", error)
      }
    }

    // If no CV content, create basic content from personal info
    if (!cvContent) {
      cvContent = `
Name: ${coverLetterData.personalInfo.name}
Title: ${coverLetterData.personalInfo.title}
Email: ${coverLetterData.personalInfo.email}
Phone: ${coverLetterData.personalInfo.phone}
Location: ${coverLetterData.personalInfo.location}
LinkedIn: ${coverLetterData.personalInfo.linkedin}
Website: ${coverLetterData.personalInfo.website}
      `.trim()
    }

    setGeneratingContent(true)
    try {
      const fullCoverLetter = await generateCoverLetter(coverLetterData.jobInfo.jobPosting, cvContent)

      // Split the cover letter into sections
      const paragraphs = fullCoverLetter.split("\n\n").filter((p) => p.trim())

      if (paragraphs.length >= 3) {
        updateContent("opening", paragraphs[0])
        updateContent("body", paragraphs.slice(1, -1).join("\n\n"))
        updateContent("closing", paragraphs[paragraphs.length - 1])
      } else {
        // If we can't split properly, put everything in body
        updateContent("opening", "")
        updateContent("body", fullCoverLetter)
        updateContent("closing", "")
      }

      showNotification("Cover letter generated successfully!")
    } catch (error) {
      console.error("Error generating cover letter:", error)
      showNotification("Error generating cover letter. Please try again.")
    } finally {
      setGeneratingContent(false)
    }
  }

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 5000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Notification */}
      {notification && (
        <div className="lg:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <span className="text-blue-800">{notification}</span>
        </div>
      )}

      {/* Left Column - Input Forms */}
      <div className="space-y-6">
        {/* Upload CV */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload CV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Choose from My CVs */}
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
                <Database className="w-4 h-4" />
                Choose from My CVs
              </Label>
              <div className="space-y-3">
                <Select value={selectedCVId} onValueChange={setSelectedCVId} disabled={loadingCVs}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingCVs ? "Loading CVs..." : "Select a saved CV"} />
                  </SelectTrigger>
                  <SelectContent>
                    {userCVs.map((cv) => (
                      <SelectItem key={cv.id} value={cv.id}>
                        {cv.title || "Untitled CV"}
                      </SelectItem>
                    ))}
                    {userCVs.length === 0 && !loadingCVs && (
                      <SelectItem value="" disabled>
                        No CVs found - upload one below
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleLoadFromCV}
                  disabled={!selectedCVId || isLoading}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? "Loading..." : "Load Personal Information"}
                </Button>
              </div>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
                OR
              </div>
            </div>

            {/* Upload New CV */}
            <div>
              <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4" />
                Upload New CV
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="cv-upload"
                  disabled={uploadingCV}
                />
                <label htmlFor="cv-upload" className="cursor-pointer">
                  <div className="space-y-2">
                    {uploadingCV ? (
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    )}
                    <p className="text-sm text-gray-600">
                      {uploadingCV ? "Processing..." : "Click to upload CV (PDF, DOC, DOCX)"}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="bg-white rounded-xl border shadow-md p-6">
          <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
            <Rocket className="w-5 h-5 text-blue-600" />
            Actions
          </h3>
          <div className="space-y-3">
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Cover Letter
            </Button>
            <Button
              onClick={regenerateContent}
              disabled={isRegenerating}
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
            <Button onClick={onDownloadPDF} className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column - Job Info and Content Editor */}
      <div className="space-y-6">
        {/* Job Information - Now moved above Cover Letter Content */}
        <Card>
          <CardHeader>
            <CardTitle>Job Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={coverLetterData.jobInfo.jobTitle}
                onChange={(e) => updateJobInfo("jobTitle", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={coverLetterData.jobInfo.companyName}
                onChange={(e) => updateJobInfo("companyName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="hiringManager">Hiring Manager (Optional)</Label>
              <Input
                id="hiringManager"
                value={coverLetterData.jobInfo.hiringManager}
                onChange={(e) => updateJobInfo("hiringManager", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="jobPosting">Job Description</Label>
              <Textarea
                id="jobPosting"
                placeholder="Paste the job description here to help generate a tailored cover letter..."
                value={coverLetterData.jobInfo.jobPosting}
                onChange={(e) => updateJobInfo("jobPosting", e.target.value)}
                className="h-[200px] overflow-y-scroll resize-none"
              />
            </div>
            <Button
              onClick={handleGenerateContent}
              disabled={generatingContent || !coverLetterData.jobInfo.jobPosting.trim()}
              className="w-full"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {generatingContent ? "Generating..." : "Generate Cover Letter"}
            </Button>
          </CardContent>
        </Card>

        {/* Cover Letter Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Cover Letter Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="opening">Opening Paragraph</Label>
              <Textarea
                id="opening"
                value={coverLetterData.content.opening}
                onChange={(e) => updateContent("opening", e.target.value)}
                placeholder="Write your opening paragraph..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="body">Body Paragraphs</Label>
              <Textarea
                id="body"
                value={coverLetterData.content.body}
                onChange={(e) => updateContent("body", e.target.value)}
                placeholder="Write your main body paragraphs..."
                rows={8}
              />
            </div>
            <div>
              <Label htmlFor="closing">Closing Paragraph</Label>
              <Textarea
                id="closing"
                value={coverLetterData.content.closing}
                onChange={(e) => updateContent("closing", e.target.value)}
                placeholder="Write your closing paragraph..."
                rows={4}
              />
            </div>
            <div className="text-sm text-gray-500">
              <p>💡 Tip: Use the Generate button to create AI-powered content based on your job description.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CoverLetterBuildTab
