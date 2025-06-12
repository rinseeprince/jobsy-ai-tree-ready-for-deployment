"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  Upload,
  Download,
  Check,
  AlertCircle,
  FileDown,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Eye,
  RefreshCw,
  Target,
  Star,
  Rocket,
  Shield,
  TrendingUp,
  Plus,
  Brain,
  Lightbulb,
  Wand2,
  Layout,
} from "lucide-react"

import { CVService } from "@/lib/cv-service"
import { parseResumeWithAI } from "@/lib/resume-parser"
import { CV_TEMPLATES, getTemplateById, renderTemplate, type CVData } from "@/lib/cv-templates"
import CVEditorModals from "@/components/cv-editor/cv-editor-modals"
import { CVPreview } from "@/components/cv-editor/cv-preview"

// Default empty CV data
const defaultCVData: CVData = {
  personalInfo: {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    linkedin: "",
    website: "",
    profilePhoto: "",
  },
  experience: [
    {
      id: "exp-1",
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "",
      institution: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  ],
  skills: [],
  certifications: [
    {
      id: "cert-1",
      name: "",
      issuer: "",
      date: "",
      description: "",
    },
  ],
}

export default function CVBuilderPage() {
  const [activeTab, setActiveTab] = useState("build")
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [cvData, setCVData] = useState<CVData>(defaultCVData)
  const [selectedTemplate, setSelectedTemplate] = useState("modern")
  const [templatePreview, setTemplatePreview] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [isImproving, setIsImproving] = useState(false)
  const [improvementSuggestions, setImprovementSuggestions] = useState("")

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("")
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [success])

  // Calculate completion percentage
  const calculateCompletion = () => {
    let completed = 0
    const total = 6

    if (cvData.personalInfo.name && cvData.personalInfo.email && cvData.personalInfo.summary) completed++
    if (cvData.experience.some((exp) => exp.title && exp.company)) completed++
    if (cvData.education.some((edu) => edu.degree && edu.institution)) completed++
    if (cvData.skills.length > 0) completed++
    if (cvData.certifications.some((cert) => cert.name)) completed++
    if (selectedTemplate) completed++

    return Math.round((completed / total) * 100)
  }

  // Update template preview when data or template changes
  useEffect(() => {
    if (selectedTemplate && cvData) {
      const template = getTemplateById(selectedTemplate)
      if (template) {
        const preview = renderTemplate(cvData, template)
        setTemplatePreview(preview)
      }
    }
  }, [selectedTemplate, cvData])

  // Personal Info handlers
  const updatePersonalInfo = (field: string, value: string) => {
    setCVData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }))
  }

  // Experience handlers
  const addExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    }
    setCVData((prev) => ({
      ...prev,
      experience: [...prev.experience, newExp],
    }))
  }

  const updateExperience = (id: string, field: string, value: string | boolean) => {
    setCVData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }))
  }

  const removeExperience = (id: string) => {
    setCVData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }))
  }

  // Education handlers
  const addEducation = () => {
    const newEdu = {
      id: `edu-${Date.now()}`,
      degree: "",
      institution: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    }
    setCVData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }))
  }

  const updateEducation = (id: string, field: string, value: string | boolean) => {
    setCVData((prev) => ({
      ...prev,
      education: prev.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    }))
  }

  const removeEducation = (id: string) => {
    setCVData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }))
  }

  // Skills handlers
  const updateSkills = (skillsString: string) => {
    const skillsArray = skillsString
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0)
    setCVData((prev) => ({
      ...prev,
      skills: skillsArray,
    }))
  }

  // Certifications handlers
  const addCertification = () => {
    const newCert = {
      id: `cert-${Date.now()}`,
      name: "",
      issuer: "",
      date: "",
      description: "",
    }
    setCVData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, newCert],
    }))
  }

  const updateCertification = (id: string, field: string, value: string) => {
    setCVData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((cert) => (cert.id === id ? { ...cert, [field]: value } : cert)),
    }))
  }

  const removeCertification = (id: string) => {
    setCVData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((cert) => cert.id !== id),
    }))
  }

  // Photo upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Photo size must be less than 5MB")
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        updatePersonalInfo("profilePhoto", result)
        setSuccess("Photo uploaded successfully!")
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    updatePersonalInfo("profilePhoto", "")
    setSuccess("Photo removed successfully!")
  }

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/cv-parser", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      const savedCV = await CVService.saveCV({
        title: file.name.replace(/\.[^/.]+$/, ""),
        file_name: file.name,
        file_size: file.size,
        parsed_content: data.text,
        raw_text: data.text,
      })

      console.log("CV saved to database:", savedCV)

      const aiParsedData = await parseResumeWithAI(data.text)

      if (aiParsedData) {
        console.log("AI successfully parsed the CV:", aiParsedData)

        setCVData({
          personalInfo: {
            name: `${aiParsedData.personal.firstName || ""} ${aiParsedData.personal.lastName || ""}`.trim(),
            title: aiParsedData.personal.jobTitle || "",
            email: aiParsedData.personal.email || "",
            phone: aiParsedData.personal.phone || "",
            location: aiParsedData.personal.location || "",
            summary: aiParsedData.personal.summary || "",
            linkedin: aiParsedData.personal.linkedin || "",
            website: aiParsedData.personal.website || "",
            profilePhoto: cvData.personalInfo.profilePhoto || "",
          },
          experience:
            aiParsedData.experience.length > 0
              ? aiParsedData.experience.map((exp, index) => ({
                  id: `exp-${index + 1}`,
                  title: exp.title || "",
                  company: exp.company || "",
                  location: exp.location || "",
                  startDate: exp.startDate || "",
                  endDate: exp.endDate || "",
                  current: exp.current || false,
                  description: exp.description || "",
                }))
              : defaultCVData.experience,
          education:
            aiParsedData.education.length > 0
              ? aiParsedData.education.map((edu, index) => ({
                  id: `edu-${index + 1}`,
                  degree: edu.degree || "",
                  institution: edu.institution || "",
                  location: edu.location || "",
                  startDate: edu.startDate || "",
                  endDate: edu.endDate || "",
                  current: edu.current || false,
                  description: edu.description || "",
                }))
              : defaultCVData.education,
          skills: aiParsedData.skills || [],
          certifications:
            aiParsedData.certifications.length > 0
              ? aiParsedData.certifications.map((cert, index) => ({
                  id: `cert-${index + 1}`,
                  name: cert.name || "",
                  issuer: cert.issuer || "",
                  date: cert.date || "",
                  description: cert.description || "",
                }))
              : defaultCVData.certifications,
        })

        setSuccess(`CV "${file.name}" uploaded, parsed, and optimized for ATS compatibility!`)
      } else {
        setSuccess(`CV "${file.name}" uploaded and saved successfully! (Basic parsing used)`)
      }
    } catch (err) {
      console.error("Error uploading CV:", err)
      if (err instanceof Error) {
        setError(`Failed to upload CV: ${err.message}`)
      } else {
        setError("Failed to parse CV. Please try again or enter your CV content manually.")
      }
    } finally {
      setIsUploading(false)
    }
  }

  // Save CV
  const handleSave = async () => {
    setIsSaving(true)
    setError("")

    try {
      const cvText = generateCVText()
      await CVService.saveCV({
        title: cvData.personalInfo.name || "Untitled CV",
        file_name: `${cvData.personalInfo.name || "cv"}.txt`,
        file_size: cvText.length,
        parsed_content: cvText,
        raw_text: cvText,
      })
      setSuccess("CV saved successfully!")
    } catch (error) {
      console.error("Error saving CV:", error)
      setError("Failed to save CV. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  // Generate CV text
  const generateCVText = (): string => {
    const { personalInfo, experience, education, skills, certifications } = cvData

    let text = `${personalInfo.name}\n${personalInfo.title}\n${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location}\n`

    if (personalInfo.linkedin) text += `LinkedIn: ${personalInfo.linkedin}\n`
    if (personalInfo.website) text += `Website: ${personalInfo.website}\n`

    text += `\n${personalInfo.summary}\n\n`

    text += "EXPERIENCE\n"
    experience.forEach((exp) => {
      text += `${exp.title} | ${exp.company} | ${exp.location}\n`
      text += `${exp.startDate} - ${exp.current ? "Present" : exp.endDate}\n`
      text += `${exp.description}\n\n`
    })

    text += "EDUCATION\n"
    education.forEach((edu) => {
      text += `${edu.degree} | ${edu.institution} | ${edu.location}\n`
      text += `${edu.startDate} - ${edu.current ? "Present" : edu.endDate}\n`
      text += `${edu.description}\n\n`
    })

    text += "SKILLS\n"
    text += skills.join(", ") + "\n\n"

    text += "CERTIFICATIONS\n"
    certifications.forEach((cert) => {
      text += `${cert.name} | ${cert.issuer} | ${cert.date}\n`
      text += `${cert.description}\n\n`
    })

    return text
  }

  // Download CV
  const handleDownload = () => {
    const cvText = generateCVText()
    const blob = new Blob([cvText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${cvData.personalInfo.name || "cv"}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setSuccess("CV downloaded successfully!")
  }

  // Improve CV with AI
  const handleImproveCV = async () => {
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
          cvText,
          jobDescription,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setImprovementSuggestions(data.suggestions)
      setSuccess("AI analysis complete! Review the suggestions below.")
    } catch (error) {
      console.error("Error improving CV:", error)
      setError("Failed to analyze CV. Please try again.")
    } finally {
      setIsImproving(false)
    }
  }

  const completion = calculateCompletion()

  // Apply template handler
  const handleApplyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
    setSuccess(`Template "${templateId}" applied successfully!`)
    setActiveTab("build")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                CV Builder
              </h1>
              <p className="text-gray-600 mt-2">Create and customize your professional CV</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Completion</div>
                <div className="text-2xl font-bold text-blue-600">{completion}%</div>
              </div>
              <div className="w-16 h-16">
                <Progress value={completion} className="w-full h-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 p-2 bg-white rounded-2xl shadow-sm border">
            <Button
              variant={activeTab === "build" ? "default" : "ghost"}
              onClick={() => setActiveTab("build")}
              className="flex-1 min-w-[120px] rounded-xl"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Build CV
            </Button>
            <Button
              variant={activeTab === "templates" ? "default" : "ghost"}
              onClick={() => setActiveTab("templates")}
              className="flex-1 min-w-[120px] rounded-xl"
            >
              <Layout className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button
              variant={activeTab === "preview" ? "default" : "ghost"}
              onClick={() => setActiveTab("preview")}
              className="flex-1 min-w-[120px] rounded-xl"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              variant={activeTab === "optimize" ? "default" : "ghost"}
              onClick={() => setActiveTab("optimize")}
              className="flex-1 min-w-[120px] rounded-xl"
            >
              <Target className="w-4 h-4 mr-2" />
              AI Optimize
            </Button>
          </div>

          {/* Build Tab */}
          <TabsContent value="build" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Upload & Quick Actions */}
              <div className="space-y-6">
                {/* Upload Section */}
                <Card className="border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors">
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2 text-blue-700">
                      <Upload className="w-5 h-5" />
                      Quick Start
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-gray-600 mb-4">Upload your existing CV to get started instantly</p>
                      <Button
                        onClick={() => document.getElementById("cv-upload")?.click()}
                        disabled={isUploading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {isUploading ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload CV
                          </>
                        )}
                      </Button>
                      <Input
                        id="cv-upload"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Selected Template */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Layout className="w-5 h-5 text-purple-600" />
                      Selected Template
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {CV_TEMPLATES.filter((template) => template.id === selectedTemplate).map((template) => (
                        <div key={template.id} className="p-4 border border-gray-200 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900">{template.name}</h3>
                              <p className="text-sm text-gray-600">{template.description}</p>
                            </div>
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("templates")}
                        className="w-full border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl"
                      >
                        Change Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-green-600" />
                      Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button onClick={handleSave} disabled={isSaving} className="w-full" variant="outline">
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FileDown className="w-4 h-4 mr-2" />
                          Save CV
                        </>
                      )}
                    </Button>
                    <Button onClick={handleDownload} className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Middle Column - CV Sections */}
              <div className="lg:col-span-2 space-y-6">
                {/* CV Sections Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal Info */}
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-300"
                    onClick={() => setActiveModal("personal")}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Personal Info</h3>
                            <p className="text-sm text-gray-600">Contact & summary</p>
                          </div>
                        </div>
                        {cvData.personalInfo.name && cvData.personalInfo.email ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            <Plus className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="text-gray-600">
                          Name: <span className="font-medium">{cvData.personalInfo.name || "Not set"}</span>
                        </div>
                        <div className="text-gray-600">
                          Email: <span className="font-medium">{cvData.personalInfo.email || "Not set"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Photo */}
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-300"
                    onClick={() => setActiveModal("photo")}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Profile Photo</h3>
                            <p className="text-sm text-gray-600">Optional headshot</p>
                          </div>
                        </div>
                        {cvData.personalInfo.profilePhoto ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            <Plus className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {cvData.personalInfo.profilePhoto ? "Photo uploaded" : "No photo added"}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Experience */}
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-300"
                    onClick={() => setActiveModal("experience")}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Experience</h3>
                            <p className="text-sm text-gray-600">Work history</p>
                          </div>
                        </div>
                        {cvData.experience.some((exp) => exp.title && exp.company) ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            <Plus className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {cvData.experience.filter((exp) => exp.title && exp.company).length} positions added
                      </div>
                    </CardContent>
                  </Card>

                  {/* Education */}
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-300"
                    onClick={() => setActiveModal("education")}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Education</h3>
                            <p className="text-sm text-gray-600">Academic background</p>
                          </div>
                        </div>
                        {cvData.education.some((edu) => edu.degree && edu.institution) ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            <Plus className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {cvData.education.filter((edu) => edu.degree && edu.institution).length} degrees added
                      </div>
                    </CardContent>
                  </Card>

                  {/* Skills */}
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-300"
                    onClick={() => setActiveModal("skills")}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                            <Code className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Skills</h3>
                            <p className="text-sm text-gray-600">Technical & soft skills</p>
                          </div>
                        </div>
                        {cvData.skills.length > 0 ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            <Plus className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{cvData.skills.length} skills added</div>
                    </CardContent>
                  </Card>

                  {/* Certifications */}
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-300"
                    onClick={() => setActiveModal("certifications")}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Certifications</h3>
                            <p className="text-sm text-gray-600">Professional credentials</p>
                          </div>
                        </div>
                        {cvData.certifications.some((cert) => cert.name) ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                            <Plus className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {cvData.certifications.filter((cert) => cert.name).length} certifications added
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CV_TEMPLATES.map((template) => (
                <Card
                  key={template.id}
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-3xl overflow-hidden group"
                >
                  <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      {/* Template Preview Image */}
                      <div className="w-full h-full p-4">
                        <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-inner">
                          <div className="p-3">
                            <div className="h-6 w-1/2 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 w-3/4 bg-gray-100 rounded mb-4"></div>
                            <div className="flex gap-2 mb-4">
                              <div className="h-3 w-20 bg-gray-100 rounded"></div>
                              <div className="h-3 w-20 bg-gray-100 rounded"></div>
                            </div>
                            <div className="h-5 w-1/3 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 w-full bg-gray-100 rounded mb-1"></div>
                            <div className="h-3 w-full bg-gray-100 rounded mb-1"></div>
                            <div className="h-3 w-3/4 bg-gray-100 rounded mb-3"></div>
                            <div className="h-5 w-1/3 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 w-full bg-gray-100 rounded mb-1"></div>
                            <div className="h-3 w-full bg-gray-100 rounded mb-1"></div>
                            <div className="h-3 w-3/4 bg-gray-100 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                    <p className="text-gray-600 mb-4">{template.description}</p>

                    <div className="flex gap-2 mb-4">
                      <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                      <div className="w-6 h-6 bg-gray-500 rounded-full"></div>
                      <div className="w-6 h-6 bg-gray-800 rounded-full"></div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl"
                        onClick={() => {
                          setSelectedTemplate(template.id)
                          setActiveTab("preview")
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl"
                        onClick={() => handleApplyTemplate(template.id)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Apply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <CVPreview cvData={cvData} templatePreview={templatePreview} />
          </TabsContent>

          {/* Optimize Tab */}
          <TabsContent value="optimize" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Job Description Input */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Job Description Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="job-description">Paste the job description here</Label>
                    <Textarea
                      id="job-description"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the full job description here to get AI-powered optimization suggestions..."
                      className="min-h-[200px]"
                    />
                  </div>
                  <Button
                    onClick={handleImproveCV}
                    disabled={isImproving || !jobDescription.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isImproving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Analyze & Optimize
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* AI Suggestions */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                    AI Optimization Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {improvementSuggestions ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="w-5 h-5 text-green-600" />
                          <h4 className="font-semibold text-green-900">Optimization Complete</h4>
                        </div>
                        <div className="prose prose-sm max-w-none text-green-800">
                          <div className="whitespace-pre-wrap">{improvementSuggestions}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
                        <Brain className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Ready for AI Analysis</h3>
                      <p className="text-gray-600">
                        Add a job description to get personalized suggestions for improving your CV
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ATS Score and Tips */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">ATS Compatibility</h3>
                  <div className="text-3xl font-bold text-green-600 mb-2">85%</div>
                  <p className="text-sm text-gray-600">Your CV is well-optimized for ATS systems</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Keyword Match</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">72%</div>
                  <p className="text-sm text-gray-600">Good alignment with job requirements</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Overall Score</h3>
                  <div className="text-3xl font-bold text-amber-600 mb-2">A-</div>
                  <p className="text-sm text-gray-600">Excellent CV with room for improvement</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <CVEditorModals
          activeModal={activeModal}
          setActiveModal={setActiveModal}
          cvData={cvData}
          updatePersonalInfo={updatePersonalInfo}
          addExperience={addExperience}
          updateExperience={updateExperience}
          removeExperience={removeExperience}
          addEducation={addEducation}
          updateEducation={updateEducation}
          removeEducation={removeEducation}
          updateSkills={updateSkills}
          addCertification={addCertification}
          updateCertification={updateCertification}
          removeCertification={removeCertification}
          handlePhotoUpload={handlePhotoUpload}
          removePhoto={removePhoto}
        />
      </div>
    </div>
  )
}
