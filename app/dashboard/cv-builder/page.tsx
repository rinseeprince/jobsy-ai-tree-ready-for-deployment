"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Upload,
  Download,
  Check,
  AlertCircle,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  RefreshCw,
  Target,
  Star,
  Rocket,
  Shield,
  TrendingUp,
  Brain,
  Lightbulb,
  Wand2,
  Layout,
  ChevronRight,
  Edit3,
  Save,
} from "lucide-react"

import { CVService } from "@/lib/cv-service"
import { parseResumeWithAI } from "@/lib/resume-parser"
import { CV_TEMPLATES, getTemplateById, renderTemplate, type CVData } from "@/lib/cv-templates"
import CVEditorModals from "@/components/cv-editor/cv-editor-modals"
import { CVPreview } from "@/components/cv-editor/cv-preview"
import { ApplicationsService } from "@/lib/supabase"
import { CVAnalysisButton } from "@/components/cv-analysis-button"

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
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [cvTitle, setCvTitle] = useState("")

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
            setCvTitle(savedCV.title)
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

  // Show save modal
  const handleSaveClick = () => {
    // Generate a default title if none exists
    if (!cvTitle) {
      const defaultTitle = cvData.personalInfo.name ? `${cvData.personalInfo.name} - CV` : "My CV"
      setCvTitle(defaultTitle)
    }
    setShowSaveModal(true)
  }

  // Save CV
  const handleSave = async () => {
    if (!cvTitle.trim()) {
      setError("Please enter a title for your CV")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      console.log("🔍 Starting CV save process...")
      console.log("Current CV ID:", currentCVId)
      console.log("CV Title:", cvTitle)

      let savedCV
      if (currentCVId) {
        // Update existing CV
        savedCV = await ApplicationsService.updateSavedCV(currentCVId, {
          title: cvTitle.trim(),
          cv_data: cvData,
          template_id: selectedTemplate,
          status: "draft",
        })
        console.log("✅ CV updated successfully:", savedCV)
        setSuccess("CV updated successfully!")
      } else {
        // Create new CV
        savedCV = await ApplicationsService.saveCVData({
          title: cvTitle.trim(),
          cv_data: cvData,
          template_id: selectedTemplate,
          status: "draft",
        })
        console.log("✅ CV saved successfully:", savedCV)
        setCurrentCVId(savedCV.id)
        setSuccess("CV saved successfully! You can find it in 'My CVs'.")
      }

      setShowSaveModal(false)
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

  // Helper function to get section completion status
  const getSectionStatus = (section: string) => {
    switch (section) {
      case "personal":
        return cvData.personalInfo.name && cvData.personalInfo.email && cvData.personalInfo.summary
      case "photo":
        return !!cvData.personalInfo.profilePhoto
      case "experience":
        return cvData.experience.some((exp) => exp.title && exp.company)
      case "education":
        return cvData.education.some((edu) => edu.degree && edu.institution)
      case "skills":
        return cvData.skills.length > 0
      case "certifications":
        return cvData.certifications.some((cert) => cert.name)
      default:
        return false
    }
  }

  // Helper function to get section preview text
  const getSectionPreview = (section: string) => {
    switch (section) {
      case "personal":
        return cvData.personalInfo.name || "Add your personal information"
      case "photo":
        return cvData.personalInfo.profilePhoto ? "Professional photo uploaded" : "Add a professional headshot"
      case "experience":
        const firstExp = cvData.experience[0]
        return firstExp?.title && firstExp?.company
          ? `${firstExp.title} at ${firstExp.company}`
          : "Add your work experience"
      case "education":
        const firstEdu = cvData.education[0]
        return firstEdu?.degree && firstEdu?.institution
          ? `${firstEdu.degree} from ${firstEdu.institution}`
          : "Add your education"
      case "skills":
        return cvData.skills.length > 0 ? `${cvData.skills.length} skills added` : "Add your skills"
      case "certifications":
        const firstCert = cvData.certifications[0]
        return firstCert?.name ? firstCert.name : "Add your certifications"
      default:
        return "Click to edit"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screenbg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">CV Builder</h1>
              <p className="text-gray-600">Create and customize your professional CV</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Completion</div>
              <div className="text-2xl font-bold text-blue-600">{completion}%</div>
            </div>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${completion}%` }}></div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="mb-6">
          {/* Tab Navigation */}
          <div className="bg-white rounded-xl border shadow-md p-4 mb-6 flex items-center justify-between">
            <div className="flex-1">{/* Empty space or could add search functionality later */}</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("build")}
                className={`py-2 px-4 rounded-lg font-medium text-sm ${
                  activeTab === "build"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                Build CV
              </button>
              <button
                onClick={() => setActiveTab("templates")}
                className={`py-2 px-4 rounded-lg font-medium text-sm ${
                  activeTab === "templates"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                Templates
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`py-2 px-4 rounded-lg font-medium text-sm ${
                  activeTab === "preview"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setActiveTab("optimize")}
                className={`py-2 px-4 rounded-lg font-medium text-sm ${
                  activeTab === "optimize"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                AI Optimize
              </button>
            </div>
          </div>

          {/* Build Tab */}
          {activeTab === "build" && (
            <div className="p-6 bg-white border rounded-xl shadow-md">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Upload & Quick Actions */}
                <div className="space-y-6">
                  {/* Upload Section */}
                  <div className="border border-dashed border-blue-300 rounded-lg p-6 hover:border-blue-500 transition-colors shadow-md">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-medium text-blue-700 mb-2">Quick Start</h3>
                      <p className="text-gray-600 mb-4">Upload your existing CV to get started instantly</p>
                      <Button
                        onClick={() => document.getElementById("cv-upload")?.click()}
                        disabled={isUploading}
                        className="w-full bg-blue-600 hover:bg-blue-700"
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
                  </div>

                  {/* Selected Template */}
                  <div className="border rounded-lg p-6 shadow-md bg-white">
                    <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                      <Layout className="w-5 h-5 text-blue-600" />
                      Selected Template
                    </h3>
                    <div className="space-y-4">
                      {CV_TEMPLATES.filter((template) => template.id === selectedTemplate).map((template) => (
                        <div key={template.id} className="p-4 border border-gray-200 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{template.name}</h4>
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
                        className="w-full border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                      >
                        Change Template
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border rounded-lg p-6 shadow-md bg-white">
                    <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                      <Rocket className="w-5 h-5 text-blue-600" />
                      Actions
                    </h3>
                    <div className="space-y-3">
                      <Button
                        onClick={handleSaveClick}
                        disabled={isSaving}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {currentCVId ? "Update CV" : "Save CV"}
                      </Button>
                      <CVAnalysisButton cvData={cvData} className="w-full" variant="outline" />
                      <Button onClick={handleDownload} className="w-full" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Middle Column - Collapsible CV Sections */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Personal Information Section */}
                  <div
                    className="border rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all shadow-md bg-white"
                    onClick={() => setActiveModal("personal")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                          <p className="text-sm text-gray-600">{getSectionPreview("personal")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSectionStatus("personal") && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <Edit3 className="w-4 h-4 text-gray-400" />
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Profile Photo Section */}
                  <div
                    className="border rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all shadow-md bg-white"
                    onClick={() => setActiveModal("photo")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Profile Photo</h3>
                          <p className="text-sm text-gray-600">
                            {cvData.personalInfo.profilePhoto
                              ? "Professional photo uploaded"
                              : "Add a professional headshot (optional)"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {cvData.personalInfo.profilePhoto && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <Edit3 className="w-4 h-4 text-gray-400" />
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Experience Section */}
                  <div
                    className="border rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all shadow-md bg-white"
                    onClick={() => setActiveModal("experience")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
                          <p className="text-sm text-gray-600">{getSectionPreview("experience")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSectionStatus("experience") && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <Edit3 className="w-4 h-4 text-gray-400" />
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Education Section */}
                  <div
                    className="border rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all shadow-md bg-white"
                    onClick={() => setActiveModal("education")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Education</h3>
                          <p className="text-sm text-gray-600">{getSectionPreview("education")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSectionStatus("education") && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <Edit3 className="w-4 h-4 text-gray-400" />
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div
                    className="border rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all shadow-md bg-white"
                    onClick={() => setActiveModal("skills")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Code className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Skills</h3>
                          <p className="text-sm text-gray-600">{getSectionPreview("skills")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSectionStatus("skills") && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <Edit3 className="w-4 h-4 text-gray-400" />
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Certifications Section */}
                  <div
                    className="border rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all shadow-md bg-white"
                    onClick={() => setActiveModal("certifications")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Award className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Certifications</h3>
                          <p className="text-sm text-gray-600">{getSectionPreview("certifications")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSectionStatus("certifications") && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <Edit3 className="w-4 h-4 text-gray-400" />
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === "templates" && (
            <div className="p-6 bg-white border rounded-xl shadow-md">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Template</h2>
                <p className="text-gray-600">Select a professional template that matches your style</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CV_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className={`border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg shadow-md bg-white ${
                      selectedTemplate === template.id
                        ? "ring-2 ring-blue-500 border-blue-500 shadow-lg"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => handleApplyTemplate(template.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">{template.name}</h3>
                        {selectedTemplate === template.id && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{template.description}</p>

                      {/* Template Preview */}
                      <div className="bg-gray-50 rounded-lg p-2 mb-4 h-64 overflow-hidden relative">
                        <div
                          className="text-xs leading-tight text-gray-700 transform scale-50 origin-top-left w-[200%] h-[200%]"
                          style={{
                            fontSize: "6px",
                            lineHeight: "1.2",
                          }}
                          dangerouslySetInnerHTML={{
                            __html: renderTemplate(cvData, template),
                          }}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {template.features?.map((feature, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {feature}
                          </span>
                        )) || (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Professional</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === "preview" && (
            <div className="p-6 bg-white border rounded-xl shadow-md">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">CV Preview</h2>
                <p className="text-gray-600">See how your CV will look to employers</p>
              </div>

              <div className="bg-blue-600 text-white p-6 rounded-t-lg">
                <h3 className="text-xl font-medium flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Template Preview
                </h3>
                <p className="text-blue-100 mt-1">Live preview of your CV with the selected template</p>
              </div>

              <div className="border border-t-0 rounded-b-lg p-6 bg-white">
                <CVPreview cvData={cvData} templateId={selectedTemplate} />
              </div>
            </div>
          )}

          {/* AI Optimize Tab */}
          {activeTab === "optimize" && (
            <div className="p-6 bg-white border rounded-xl shadow-md">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                  <Brain className="w-6 h-6 text-blue-600" />
                  AI-Powered CV Optimization
                </h2>
                <p className="text-gray-600">Get personalized suggestions to improve your CV for specific job roles</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Job Description Input */}
                <div className="border rounded-lg p-6 shadow-md bg-white">
                  <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-blue-600" />
                    Job Description
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="job-description" className="mb-1 block">
                        Paste the job description you are applying for
                      </Label>
                      <Textarea
                        id="job-description"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the complete job description here..."
                        rows={12}
                      />
                    </div>
                    <Button
                      onClick={handleImproveCV}
                      disabled={isImproving || !jobDescription.trim()}
                      className="w-full bg-blue-600 hover:bg-blue-700"
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
                </div>

                {/* AI Suggestions */}
                <div className="border rounded-lg p-6 shadow-md bg-white">
                  <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    AI Suggestions
                  </h3>
                  {improvementSuggestions ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-800">AI Analysis Complete</span>
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
                      <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4">
                        <Brain className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for AI Analysis</h3>
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
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save CV Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white rounded-t-3xl">
                <h2 className="text-xl font-bold flex items-center">
                  <Save className="w-6 h-6 mr-3" />
                  {currentCVId ? "Update CV" : "Save CV"}
                </h2>
                <p className="text-blue-100 mt-2">Give your CV a descriptive name</p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cv-title" className="text-sm font-medium text-gray-700 mb-2 block">
                      CV Title *
                    </Label>
                    <Input
                      id="cv-title"
                      value={cvTitle}
                      onChange={(e) => setCvTitle(e.target.value)}
                      placeholder="e.g., Software Engineer CV - Tech Companies"
                      className="border-2 border-gray-200 focus:border-blue-400 rounded-xl p-3"
                      autoFocus
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 text-sm">
                      {"💡 "}
                      <strong>Tip:</strong>
                      {
                        ' Use descriptive names like "Marketing Manager CV - Healthcare" or "Data Scientist CV - Startups" to easily find your CVs later.'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveModal(false)}
                    className="px-6 py-2 rounded-xl"
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !cvTitle.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {currentCVId ? "Update CV" : "Save CV"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

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
