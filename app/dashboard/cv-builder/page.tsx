"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
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
import { ApplicationsService } from "@/lib/supabase"

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

// Sample CV data for template previews
const sampleCVData: CVData = {
  personalInfo: {
    name: "John Smith",
    title: "Senior Software Engineer",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    summary:
      "Experienced software engineer with 8+ years developing scalable web applications and leading cross-functional teams.",
    linkedin: "linkedin.com/in/johnsmith",
    website: "johnsmith.dev",
    profilePhoto: "",
  },
  experience: [
    {
      id: "exp-1",
      title: "Senior Software Engineer",
      company: "Tech Corp",
      location: "San Francisco, CA",
      startDate: "2021",
      endDate: "Present",
      current: true,
      description:
        "Led development of microservices architecture serving 10M+ users. Mentored junior developers and improved deployment efficiency by 40%.",
    },
    {
      id: "exp-2",
      title: "Software Engineer",
      company: "StartupXYZ",
      location: "San Francisco, CA",
      startDate: "2019",
      endDate: "2021",
      current: false,
      description:
        "Built full-stack web applications using React and Node.js. Implemented CI/CD pipelines and reduced bug reports by 60%.",
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "Bachelor of Science in Computer Science",
      institution: "University of California",
      location: "Berkeley, CA",
      startDate: "2015",
      endDate: "2019",
      current: false,
      description: "Graduated Magna Cum Laude. Relevant coursework: Data Structures, Algorithms, Software Engineering.",
    },
  ],
  skills: ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker", "PostgreSQL", "Git"],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2022",
      description: "Professional-level certification demonstrating expertise in designing distributed systems on AWS.",
    },
  ],
}

export default function CVBuilderPage() {
  const searchParams = useSearchParams()
  const cvId = searchParams.get("cv")

  const [activeTab, setActiveTab] = useState("build")
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [cvData, setCVData] = useState<CVData>(defaultCVData)
  const [selectedTemplate, setSelectedTemplate] = useState("modern")
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [isImproving, setIsImproving] = useState(false)
  const [improvementSuggestions, setImprovementSuggestions] = useState("")
  const [currentCVId, setCurrentCVId] = useState<string | null>(null)

  // Load CV data if editing existing CV
  useEffect(() => {
    const loadCVData = async () => {
      if (cvId) {
        setIsLoading(true)
        try {
          console.log("🔍 Loading CV data for ID:", cvId)
          const savedCV = await ApplicationsService.getSavedCV(cvId)
          if (savedCV) {
            console.log("✅ Loaded CV data:", savedCV)
            setCVData(savedCV.cv_data)
            setSelectedTemplate(savedCV.template_id || "modern")
            setCurrentCVId(savedCV.id)
            setSuccess("CV loaded successfully!")
          } else {
            setError("CV not found")
          }
        } catch (error) {
          console.error("❌ Error loading CV:", error)
          setError("Failed to load CV data")
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadCVData()
  }, [cvId])

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
      getTemplateById(selectedTemplate)
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
      console.log("🔍 Starting CV save process...")
      console.log("Current CV ID:", currentCVId)
      console.log("CV Data to save:", {
        personalInfo: cvData.personalInfo,
        experienceCount: cvData.experience?.length || 0,
        educationCount: cvData.education?.length || 0,
        skillsCount: cvData.skills?.length || 0,
        certificationsCount: cvData.certifications?.length || 0,
        selectedTemplate,
      })

      let savedCV
      if (currentCVId) {
        // Update existing CV
        savedCV = await ApplicationsService.updateSavedCV(currentCVId, {
          title: cvData.personalInfo.name ? `${cvData.personalInfo.name} - CV` : "My CV",
          cv_data: cvData,
          template_id: selectedTemplate,
          status: "draft",
        })
        console.log("✅ CV updated successfully:", savedCV)
        setSuccess("CV updated successfully!")
      } else {
        // Create new CV
        savedCV = await ApplicationsService.saveCVData({
          title: cvData.personalInfo.name ? `${cvData.personalInfo.name} - CV` : "My CV",
          cv_data: cvData,
          template_id: selectedTemplate,
          status: "draft",
        })
        console.log("✅ CV saved successfully:", savedCV)
        setCurrentCVId(savedCV.id)
        setSuccess("CV saved successfully! You can find it in 'My CVs'.")
      }
    } catch (error) {
      console.error("❌ Error saving CV:", error)
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg">Loading CV data...</p>
          </div>
        </div>
      </div>
    )
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
                {currentCVId ? "Edit CV" : "CV Builder"}
              </h1>
              <p className="text-gray-600 mt-2">
                {currentCVId ? "Update your professional CV" : "Create and customize your professional CV"}
              </p>
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
                          {currentCVId ? "Update CV" : "Save CV"}
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
                {/* Personal Information */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={cvData.personalInfo.name}
                          onChange={(e) => updatePersonalInfo("name", e.target.value)}
                          placeholder="John Smith"
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="title">Professional Title *</Label>
                        <Input
                          id="title"
                          value={cvData.personalInfo.title}
                          onChange={(e) => updatePersonalInfo("title", e.target.value)}
                          placeholder="Senior Software Engineer"
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={cvData.personalInfo.email}
                          onChange={(e) => updatePersonalInfo("email", e.target.value)}
                          placeholder="john@example.com"
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={cvData.personalInfo.phone}
                          onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={cvData.personalInfo.location}
                          onChange={(e) => updatePersonalInfo("location", e.target.value)}
                          placeholder="San Francisco, CA"
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={cvData.personalInfo.linkedin}
                          onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                          placeholder="linkedin.com/in/johnsmith"
                          className="rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Profile Photo */}
                    <div>
                      <Label>Profile Photo (Optional)</Label>
                      <div className="flex items-center gap-4 mt-2">
                        {cvData.personalInfo.profilePhoto ? (
                          <div className="flex items-center gap-4">
                            <img
                              src={cvData.personalInfo.profilePhoto || "/placeholder.svg"}
                              alt="Profile"
                              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                            />
                            <Button onClick={removePhoto} variant="outline" size="sm">
                              Remove Photo
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="w-8 h-8 text-gray-400" />
                            </div>
                            <Button
                              onClick={() => document.getElementById("photo-upload")?.click()}
                              variant="outline"
                              size="sm"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Photo
                            </Button>
                            <Input
                              id="photo-upload"
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Professional Summary */}
                    <div>
                      <Label htmlFor="summary">Professional Summary *</Label>
                      <Textarea
                        id="summary"
                        value={cvData.personalInfo.summary}
                        onChange={(e) => updatePersonalInfo("summary", e.target.value)}
                        placeholder="Experienced software engineer with 8+ years developing scalable web applications..."
                        rows={4}
                        className="rounded-xl"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Experience Section */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-green-600" />
                        Work Experience
                      </div>
                      <Button onClick={addExperience} size="sm" variant="outline" className="rounded-xl">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Experience
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {cvData.experience.map((exp, index) => (
                      <div key={exp.id} className="p-4 border border-gray-200 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900">Experience {index + 1}</h4>
                          {cvData.experience.length > 1 && (
                            <Button
                              onClick={() => removeExperience(exp.id)}
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Job Title</Label>
                            <Input
                              value={exp.title}
                              onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                              placeholder="Senior Software Engineer"
                              className="rounded-xl"
                            />
                          </div>
                          <div>
                            <Label>Company</Label>
                            <Input
                              value={exp.company}
                              onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                              placeholder="Tech Corp"
                              className="rounded-xl"
                            />
                          </div>
                          <div>
                            <Label>Location</Label>
                            <Input
                              value={exp.location}
                              onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                              placeholder="San Francisco, CA"
                              className="rounded-xl"
                            />
                          </div>
                          <div>
                            <Label>Start Date</Label>
                            <Input
                              value={exp.startDate}
                              onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                              placeholder="2021"
                              className="rounded-xl"
                            />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input
                              value={exp.endDate}
                              onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                              placeholder="Present"
                              disabled={exp.current}
                              className="rounded-xl"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`current-${exp.id}`}
                              checked={exp.current}
                              onChange={(e) => updateExperience(exp.id, "current", e.target.checked)}
                              className="rounded"
                            />
                            <Label htmlFor={`current-${exp.id}`}>Currently working here</Label>
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                            placeholder="Led development of microservices architecture serving 10M+ users..."
                            rows={3}
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Education Section */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-purple-600" />
                        Education
                      </div>
                      <Button onClick={addEducation} size="sm" variant="outline" className="rounded-xl">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Education
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {cvData.education.map((edu, index) => (
                      <div key={edu.id} className="p-4 border border-gray-200 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900">Education {index + 1}</h4>
                          {cvData.education.length > 1 && (
                            <Button
                              onClick={() => removeEducation(edu.id)}
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Degree</Label>
                            <Input
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                              placeholder="Bachelor of Science in Computer Science"
                              className="rounded-xl"
                            />
                          </div>
                          <div>
                            <Label>Institution</Label>
                            <Input
                              value={edu.institution}
                              onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                              placeholder="University of California"
                              className="rounded-xl"
                            />
                          </div>
                          <div>
                            <Label>Location</Label>
                            <Input
                              value={edu.location}
                              onChange={(e) => updateEducation(edu.id, "location", e.target.value)}
                              placeholder="Berkeley, CA"
                              className="rounded-xl"
                            />
                          </div>
                          <div>
                            <Label>Start Date</Label>
                            <Input
                              value={edu.startDate}
                              onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                              placeholder="2015"
                              className="rounded-xl"
                            />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input
                              value={edu.endDate}
                              onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                              placeholder="2019"
                              disabled={edu.current}
                              className="rounded-xl"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`current-edu-${edu.id}`}
                              checked={edu.current}
                              onChange={(e) => updateEducation(edu.id, "current", e.target.checked)}
                              className="rounded"
                            />
                            <Label htmlFor={`current-edu-${edu.id}`}>Currently studying</Label>
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={edu.description}
                            onChange={(e) => updateEducation(edu.id, "description", e.target.value)}
                            placeholder="Graduated Magna Cum Laude. Relevant coursework: Data Structures, Algorithms..."
                            rows={2}
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Skills Section */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5 text-orange-600" />
                      Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label htmlFor="skills">Skills (comma-separated)</Label>
                      <Textarea
                        id="skills"
                        value={cvData.skills.join(", ")}
                        onChange={(e) => updateSkills(e.target.value)}
                        placeholder="JavaScript, React, Node.js, Python, AWS, Docker, PostgreSQL, Git"
                        rows={3}
                        className="rounded-xl"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Separate each skill with a comma. Example: JavaScript, React, Node.js
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Certifications Section */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-600" />
                        Certifications
                      </div>
                      <Button onClick={addCertification} size="sm" variant="outline" className="rounded-xl">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Certification
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {cvData.certifications.map((cert, index) => (
                      <div key={cert.id} className="p-4 border border-gray-200 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900">Certification {index + 1}</h4>
                          {cvData.certifications.length > 1 && (
                            <Button
                              onClick={() => removeCertification(cert.id)}
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Certification Name</Label>
                            <Input
                              value={cert.name}
                              onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                              placeholder="AWS Certified Solutions Architect"
                              className="rounded-xl"
                            />
                          </div>
                          <div>
                            <Label>Issuer</Label>
                            <Input
                              value={cert.issuer}
                              onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                              placeholder="Amazon Web Services"
                              className="rounded-xl"
                            />
                          </div>
                          <div>
                            <Label>Date</Label>
                            <Input
                              value={cert.date}
                              onChange={(e) => updateCertification(cert.id, "date", e.target.value)}
                              placeholder="2022"
                              className="rounded-xl"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={cert.description}
                            onChange={(e) => updateCertification(cert.id, "description", e.target.value)}
                            placeholder="Professional-level certification demonstrating expertise in designing distributed systems..."
                            rows={2}
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Template</h2>
              <p className="text-gray-600">Select a professional template that matches your style</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CV_TEMPLATES.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedTemplate === template.id
                      ? "ring-2 ring-blue-500 border-blue-500 shadow-lg"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => handleApplyTemplate(template.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {selectedTemplate === template.id && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </CardHeader>
                  <CardContent>
                    {/* Template Preview */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 h-64 overflow-hidden">
                      <div
                        className="text-xs leading-relaxed text-gray-700 transform scale-75 origin-top-left"
                        dangerouslySetInnerHTML={{
                          __html: renderTemplate(sampleCVData, template),
                        }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {template.features.map((feature: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">CV Preview</h2>
              <p className="text-gray-600">See how your CV will look to employers</p>
            </div>

            <CVPreview cvData={cvData} templateId={selectedTemplate} />
          </TabsContent>

          {/* AI Optimize Tab */}
          <TabsContent value="optimize" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <Brain className="w-6 h-6 text-purple-600" />
                AI-Powered CV Optimization
              </h2>
              <p className="text-gray-600">Get personalized suggestions to improve your CV for specific job roles</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Job Description Input */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Job Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="job-description">Paste the job description you are applying for</Label>
                      <Textarea
                        id="job-description"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the complete job description here..."
                        rows={12}
                        className="rounded-xl"
                      />
                    </div>
                    <Button
                      onClick={handleImproveCV}
                      disabled={isImproving || !jobDescription.trim()}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {isImproving ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing CV...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="w-4 h-4 mr-2" />
                          Get AI Suggestions
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* AI Suggestions */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    AI Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {improvementSuggestions ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-800">AI Analysis Complete</span>
                        </div>
                        <p className="text-green-700 text-sm">
                          Your CV has been analyzed against the job requirements. Review the suggestions below.
                        </p>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <div
                          className="text-gray-700 whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: improvementSuggestions }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-purple-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
                        <Brain className="w-8 h-8 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready for AI Analysis</h3>
                      <p className="text-gray-600 mb-4">
                        Add a job description to get personalized suggestions for improving your CV
                      </p>
                      <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          ATS Optimization
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Keyword Matching
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Impact Enhancement
                        </div>
                      </div>
                    </div>
                  )}
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
