"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import {
  Upload,
  Edit,
  Download,
  Eye,
  Save,
  RefreshCw,
  Lock,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Trash2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Loader2,
  Crown,
  Check,
  Palette,
} from "lucide-react"

// Define types for resume data
export interface ResumeData {
  personal: {
    firstName: string
    lastName: string
    jobTitle: string
    email: string
    phone: string
    location: string
    website: string
    linkedin: string
    github?: string
    twitter?: string
    summary: string
  }
  experience: Array<{
    title: string
    company: string
    location: string
    startDate: string
    endDate: string
    current: boolean
    description: string
  }>
  education: Array<{
    degree: string
    institution: string
    location: string
    startDate: string
    endDate: string
    current: boolean
    description: string
  }>
  skills: string[]
  certifications: Array<{
    name: string
    issuer: string
    date: string
    description: string
  }>
}

// Define types for resume score
export interface ResumeScore {
  overall: number
  sections: {
    content: number
    formatting: number
    keywords: number
    achievements: number
  }
  improvements: string[]
  strengths: string[]
}

// Mock resume parser function
async function parseResume(file: File): Promise<ResumeData> {
  console.log("Parsing resume file:", file.name)
  await new Promise((resolve) => setTimeout(resolve, 2000))

  return {
    personal: {
      firstName: "John",
      lastName: "Doe",
      jobTitle: "Software Engineer",
      email: "john.doe@email.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      website: "",
      linkedin: "",
      summary: "Experienced software engineer with 5+ years of experience in full-stack development.",
    },
    experience: [
      {
        title: "Senior Software Engineer",
        company: "Tech Corp",
        location: "San Francisco, CA",
        startDate: "2020-01",
        endDate: "",
        current: true,
        description:
          "• Led development of web applications\n• Improved system performance by 40%\n• Mentored junior developers",
      },
    ],
    education: [
      {
        degree: "Bachelor of Computer Science",
        institution: "University of California",
        location: "Berkeley, CA",
        startDate: "2016-09",
        endDate: "2020-05",
        current: false,
        description: "Graduated with honors",
      },
    ],
    skills: ["JavaScript", "React", "Node.js", "Python", "SQL"],
    certifications: [],
  }
}

// Mock resume scorer function
async function scoreResume(): Promise<ResumeScore> {
  console.log("Scoring resume data")
  await new Promise((resolve) => setTimeout(resolve, 1500))

  return {
    overall: 78,
    sections: {
      content: 85,
      formatting: 75,
      keywords: 70,
      achievements: 82,
    },
    improvements: [
      "Add more quantifiable achievements",
      "Include industry-specific keywords",
      "Improve formatting consistency",
    ],
    strengths: ["Strong technical skills", "Clear work experience", "Good education background"],
  }
}

export function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState<string>("upload")
  const [resumeData, setResumeData] = useState<ResumeData | null>(null)
  const [resumeScore, setResumeScore] = useState<ResumeScore | null>(null)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isScoring, setIsScoring] = useState<boolean>(false)
  const [isParsing, setIsParsing] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isProUser] = useState<boolean>(false)
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false)
  const [showTailorModal, setShowTailorModal] = useState<boolean>(false)
  const { toast } = useToast()

  // Handle file upload
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setIsUploading(true)
      setIsParsing(true)

      try {
        const parsedData = await parseResume(file)
        setResumeData(parsedData)

        setIsScoring(true)
        const score = await scoreResume()
        setResumeScore(score)

        setActiveTab("edit")

        toast({
          title: "Resume uploaded successfully",
          description: "Your resume has been parsed and is ready for editing.",
        })
      } catch {
        console.error("Error processing resume")
        toast({
          title: "Error processing resume",
          description: "There was an error processing your resume. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
        setIsParsing(false)
        setIsScoring(false)
      }
    },
    [toast],
  )

  const handleSaveResume = async () => {
    setIsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast({
        title: "Resume saved successfully",
        description: "Your resume has been saved to your account.",
      })
    } catch {
      toast({
        title: "Error saving resume",
        description: "There was an error saving your resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadResume = () => {
    if (!isProUser) {
      setShowDownloadModal(true)
      return
    }
    toast({
      title: "Resume downloaded",
      description: "Your resume has been downloaded successfully.",
    })
  }

  const handleTailorResume = () => {
    setShowTailorModal(true)
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Resume Builder</h1>
        <p className="text-gray-600">
          Create, edit, and optimize your resume to stand out to employers and ATS systems.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("upload")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "upload"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Upload className="h-4 w-4 inline mr-2" />
            Upload
          </button>
          <button
            onClick={() => setActiveTab("edit")}
            disabled={!resumeData}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "edit"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } ${!resumeData ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Edit className="h-4 w-4 inline mr-2" />
            Edit
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            disabled={!resumeData}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "preview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } ${!resumeData ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Eye className="h-4 w-4 inline mr-2" />
            Preview
          </button>
        </nav>
      </div>

      {/* Action Buttons */}
      {resumeData && (
        <div className="flex items-center gap-3 justify-end">
          <Button variant="outline" size="sm" onClick={handleTailorResume}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tailor to Job
            <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
              New
            </Badge>
          </Button>

          <Button variant="outline" size="sm" onClick={handleSaveResume} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>

          <Button size="sm" onClick={handleDownloadResume}>
            {!isProUser && <Lock className="h-3 w-3 mr-2" />}
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      )}

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "upload" && <ResumeUploader onDrop={onDrop} isUploading={isUploading} isParsing={isParsing} />}

        {activeTab === "edit" && resumeData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ResumeEditor resumeData={resumeData} setResumeData={setResumeData} />
            </div>
            <div className="space-y-6">
              <ResumeScoreCard score={resumeScore} isScoring={isScoring} />
              <ResumeTemplateSelector isProUser={isProUser} setShowDownloadModal={setShowDownloadModal} />
              {!isProUser && <ProPlanUpgradeCard />}
            </div>
          </div>
        )}

        {activeTab === "preview" && resumeData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ResumePreviewer resumeData={resumeData} />
            </div>
            <div className="space-y-6">
              <ResumeScoreCard score={resumeScore} isScoring={isScoring} />
              {!isProUser && <ProPlanUpgradeCard />}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showDownloadModal && (
        <ResumeDownloadModal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} />
      )}

      {showTailorModal && (
        <ResumeJobTailorModal
          isOpen={showTailorModal}
          onClose={() => setShowTailorModal(false)}
          resumeData={resumeData}
          setResumeData={setResumeData}
          isProUser={isProUser}
        />
      )}
    </div>
  )
}

// File uploader component
function ResumeUploader({
  onDrop,
  isUploading,
  isParsing,
}: {
  onDrop: (files: File[]) => void
  isUploading: boolean
  isParsing: boolean
}) {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      onDrop(Array.from(files))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Your Resume</CardTitle>
        <CardDescription>Upload your existing resume to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          {isParsing ? (
            <div className="space-y-4">
              <Loader2 className="h-8 w-8 mx-auto text-blue-600 animate-spin" />
              <p>Parsing your resume...</p>
            </div>
          ) : isUploading ? (
            <div className="space-y-4">
              <Loader2 className="h-8 w-8 mx-auto text-blue-600 animate-spin" />
              <p>Uploading...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <p className="text-lg font-medium">Drop your resume here</p>
                <p className="text-gray-500">or click to browse</p>
              </div>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  Choose File
                </label>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Score card component
function ResumeScoreCard({ score, isScoring }: { score: ResumeScore | null; isScoring: boolean }) {
  if (isScoring) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            ATS Score Analysis
          </CardTitle>
          <CardDescription>Analyzing your resume for ATS compatibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 mx-auto text-blue-600 animate-spin" />
              <p className="text-sm text-gray-600">Scoring your resume...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!score) {
    return (
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            ATS Score Analysis
          </CardTitle>
          <CardDescription>Upload a resume to see your ATS compatibility score</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No resume uploaded yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    return "Needs Improvement"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          ATS Score Analysis
        </CardTitle>
        <CardDescription>Your resume compatibility with Applicant Tracking Systems</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <div className={`text-4xl font-bold ${getScoreColor(score.overall)}`}>{score.overall}/100</div>
          <Badge variant={score.overall >= 80 ? "default" : score.overall >= 60 ? "secondary" : "destructive"}>
            {getScoreBadge(score.overall)}
          </Badge>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-900">Section Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Content Quality</span>
              <span className={getScoreColor(score.sections.content)}>{score.sections.content}%</span>
            </div>
            <Progress value={score.sections.content} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Formatting</span>
              <span className={getScoreColor(score.sections.formatting)}>{score.sections.formatting}%</span>
            </div>
            <Progress value={score.sections.formatting} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Keywords</span>
              <span className={getScoreColor(score.sections.keywords)}>{score.sections.keywords}%</span>
            </div>
            <Progress value={score.sections.keywords} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Achievements</span>
              <span className={getScoreColor(score.sections.achievements)}>{score.sections.achievements}%</span>
            </div>
            <Progress value={score.sections.achievements} className="h-2" />
          </div>
        </div>

        {score.strengths.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Strengths
            </h4>
            <ul className="space-y-1">
              {score.strengths.slice(0, 3).map((strength, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {score.improvements.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-900 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              Improvements
            </h4>
            <ul className="space-y-1">
              {score.improvements.slice(0, 3).map((improvement, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                  <AlertCircle className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Editor component
function ResumeEditor({
  resumeData,
  setResumeData,
}: {
  resumeData: ResumeData
  setResumeData: (data: ResumeData) => void
}) {
  const [activeSection, setActiveSection] = useState("personal")

  const updatePersonal = (field: string, value: string) => {
    setResumeData({
      ...resumeData,
      personal: {
        ...resumeData.personal,
        [field]: value,
      },
    })
  }

  const addSkill = (skill: string) => {
    if (skill.trim() && !resumeData.skills.includes(skill.trim())) {
      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, skill.trim()],
      })
    }
  }

  const removeSkill = (index: number) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter((_, i) => i !== index),
    })
  }

  const sections = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Wrench },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSection(section.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {section.label}
            </Button>
          )
        })}
      </div>

      {activeSection === "personal" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Your basic contact information and professional summary</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={resumeData.personal.firstName}
                  onChange={(e) => updatePersonal("firstName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={resumeData.personal.lastName}
                  onChange={(e) => updatePersonal("lastName", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={resumeData.personal.jobTitle}
                onChange={(e) => updatePersonal("jobTitle", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea
                id="summary"
                rows={4}
                value={resumeData.personal.summary}
                onChange={(e) => updatePersonal("summary", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === "skills" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Skills
            </CardTitle>
            <CardDescription>Your technical and professional skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSkill(index)}
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill..."
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addSkill(e.currentTarget.value)
                    e.currentTarget.value = ""
                  }
                }}
              />
              <Button
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement
                  addSkill(input.value)
                  input.value = ""
                }}
              >
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Preview component
function ResumePreviewer({ resumeData }: { resumeData: ResumeData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white border rounded-lg p-8 min-h-[600px]">
          <div className="text-center border-b pb-4 mb-6">
            <h1 className="text-2xl font-bold">
              {resumeData.personal.firstName} {resumeData.personal.lastName}
            </h1>
            <p className="text-lg text-gray-600">{resumeData.personal.jobTitle}</p>
            <div className="text-sm text-gray-500 mt-2">
              {resumeData.personal.email} • {resumeData.personal.phone} • {resumeData.personal.location}
            </div>
          </div>

          {resumeData.personal.summary && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2 border-b border-gray-200 pb-1">Professional Summary</h2>
              <p className="text-gray-700">{resumeData.personal.summary}</p>
            </div>
          )}

          {resumeData.experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2 border-b border-gray-200 pb-1">Experience</h2>
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium">{exp.title}</h3>
                    <span className="text-sm text-gray-500">
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{exp.company}</p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{exp.description}</p>
                </div>
              ))}
            </div>
          )}

          {resumeData.skills.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2 border-b border-gray-200 pb-1">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Template selector
function ResumeTemplateSelector({
  isProUser,
  setShowDownloadModal,
}: {
  isProUser: boolean
  setShowDownloadModal: (show: boolean) => void
}) {
  const templates = [
    { id: "modern", name: "Modern", isPro: false },
    { id: "classic", name: "Classic", isPro: true },
    { id: "creative", name: "Creative", isPro: true },
  ]

  const handleTemplateSelect = (template: { isPro: boolean }) => {
    if (template.isPro && !isProUser) {
      setShowDownloadModal(true)
      return
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Resume Templates
        </CardTitle>
        <CardDescription>Choose a professional template for your resume</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {templates.map((template) => (
          <Button
            key={template.id}
            variant="outline"
            className="w-full flex items-center justify-between h-auto p-3"
            onClick={() => handleTemplateSelect(template)}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-10 bg-gradient-to-b from-gray-100 to-gray-200 rounded border" />
              <span>{template.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {template.isPro && (
                <Badge variant="secondary" className="text-xs">
                  Pro
                </Badge>
              )}
              {template.isPro && !isProUser && <Lock className="h-4 w-4 text-gray-400" />}
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}

// Upgrade card
function ProPlanUpgradeCard() {
  const features = [
    "Download in PDF, DOCX, and TXT formats",
    "Premium resume templates",
    "AI-powered job tailoring",
    "Advanced ATS optimization",
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-600" />
          Upgrade to Pro
        </CardTitle>
        <CardDescription>Unlock premium features to enhance your resume</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-600" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        <div className="text-center space-y-2 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
          <div className="text-2xl font-bold">$9.99/month</div>
          <p className="text-sm text-gray-600">Cancel anytime • 7-day free trial</p>
        </div>
        <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
          <Crown className="h-4 w-4 mr-2" />
          Upgrade Now
        </Button>
      </CardContent>
    </Card>
  )
}

// Download modal
function ResumeDownloadModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  const features = [
    "Download in PDF, DOCX, and TXT formats",
    "Premium resume templates",
    "AI-powered job tailoring",
    "Advanced ATS optimization",
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              Upgrade to Pro
              <Badge className="bg-yellow-500 text-white">Required</Badge>
            </h3>
            <p className="text-gray-600 mt-2">
              Download functionality is available with our Pro plan. Upgrade now to access all premium features.
            </p>
          </div>
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          <div className="text-center space-y-2 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
            <div className="text-2xl font-bold">$9.99/month</div>
            <p className="text-sm text-gray-600">Cancel anytime • 7-day free trial</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Maybe Later
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tailor modal
function ResumeJobTailorModal({
  isOpen,
  onClose,
  isProUser,
}: {
  isOpen: boolean
  onClose: () => void
  resumeData: ResumeData | null
  setResumeData: (data: ResumeData) => void
  isProUser: boolean
}) {
  const [jobDescription, setJobDescription] = useState("")

  if (!isOpen) return null

  if (!isProUser) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Pro Feature
                <Badge className="bg-yellow-500 text-white">Upgrade Required</Badge>
              </h3>
              <p className="text-gray-600 mt-2">
                AI-powered job tailoring is available with our Pro plan. Upgrade to optimize your resume for specific
                job postings.
              </p>
            </div>
            <div className="text-center space-y-2 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
              <div className="text-2xl font-bold">$9.99/month</div>
              <p className="text-sm text-gray-600">Cancel anytime • 7-day free trial</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Maybe Later
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Tailor Resume to Job
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                AI-Powered
              </Badge>
            </h3>
            <p className="text-gray-600 mt-2">
              Paste the job description below and our AI will optimize your resume to match the requirements.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the job description here..."
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1" disabled={!jobDescription.trim()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tailor Resume
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Make sure we have a default export
export default ResumeBuilder
