"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, RefreshCw, Wand2 } from "lucide-react"
import type { CoverLetterData } from "@/lib/cover-letter-templates"

interface CoverLetterBuildTabProps {
  coverLetterData: CoverLetterData
  updatePersonalInfo: (field: string, value: string) => void
  updateJobInfo: (field: string, value: string) => void
  updateContent: (field: "opening" | "body" | "closing", value: string) => void
  loadFromCV: (cvId: string) => void
  regenerateContent: () => void
  isRegenerating: boolean
  isLoading: boolean
}

export const CoverLetterBuildTab = ({
  coverLetterData,
  updatePersonalInfo,
  updateJobInfo,
  updateContent,
  loadFromCV,
  regenerateContent,
  isRegenerating,
  isLoading,
}: CoverLetterBuildTabProps) => {
  const [selectedCVId, setSelectedCVId] = useState("")

  const handleLoadFromCV = () => {
    if (selectedCVId) {
      loadFromCV(selectedCVId)
    }
  }

  const handleGenerateContent = () => {
    // This will use the job description and personal info to generate content
    regenerateContent()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Input Forms */}
      <div className="space-y-6">
        {/* CV Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Load from CV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cv-select">Select from My CVs</Label>
              <Select value={selectedCVId} onValueChange={setSelectedCVId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a saved CV" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cv1">Software Engineer CV</SelectItem>
                  <SelectItem value="cv2">Marketing Manager CV</SelectItem>
                  <SelectItem value="cv3">Data Analyst CV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleLoadFromCV} disabled={!selectedCVId || isLoading} className="w-full">
              {isLoading ? "Loading..." : "Load Personal Information"}
            </Button>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={coverLetterData.personalInfo.name}
                onChange={(e) => updatePersonalInfo("name", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="title">Professional Title</Label>
              <Input
                id="title"
                value={coverLetterData.personalInfo.title}
                onChange={(e) => updatePersonalInfo("title", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={coverLetterData.personalInfo.email}
                onChange={(e) => updatePersonalInfo("email", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={coverLetterData.personalInfo.phone}
                onChange={(e) => updatePersonalInfo("phone", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={coverLetterData.personalInfo.location}
                onChange={(e) => updatePersonalInfo("location", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn (Optional)</Label>
              <Input
                id="linkedin"
                value={coverLetterData.personalInfo.linkedin}
                onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                value={coverLetterData.personalInfo.website}
                onChange={(e) => updatePersonalInfo("website", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Job Information */}
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
                rows={4}
              />
            </div>
            <Button onClick={handleGenerateContent} disabled={isRegenerating} className="w-full">
              <Wand2 className="w-4 h-4 mr-2" />
              {isRegenerating ? "Generating..." : "Generate Cover Letter"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Content Editor */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Cover Letter Content
              <Button variant="outline" size="sm" onClick={regenerateContent} disabled={isRegenerating}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
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

export default CoverLetterBuildTab;
