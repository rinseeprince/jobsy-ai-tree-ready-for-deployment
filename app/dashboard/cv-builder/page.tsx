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
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Pencil,
  Eye,
  ArrowLeft,
  RefreshCw,
  Target,
  Star,
  Rocket,
  Shield,
  TrendingUp,
  Plus,
  X,
  Zap,
  Brain,
  CheckCircle,
  Info,
  Lightbulb,
  ArrowRight,
  Clock,
  Users,
  BarChart3,
} from "lucide-react"

import { CVService } from "@/lib/cv-service"
import { parseResumeWithAI } from "@/lib/resume-parser"
import CVATSScore from "@/components/cv-ats-score"
import { CV_TEMPLATES, getTemplateById, renderTemplate, type CVData } from "@/lib/cv-templates"

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
  skills: [""],
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
  const [activeTab, setActiveTab] = useState("upload")
  const [parsedCvText, setParsedCvText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [cvData, setCvData] = useState<CVData>(defaultCVData)
  const [aiRecommendations, setAiRecommendations] = useState("")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("ats-optimized")
  const [templatePreview, setTemplatePreview] = useState<string>("")
  const [activeModal, setActiveModal] = useState<string | null>(null)

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("")
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [success])

  const handleTabChange = (newTab: string) => {
    if (newTab === "upload") {
      setSuccess("")
      setError("")
      setParsedCvText("")
    }
    setActiveTab(newTab)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, etc.)")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image file size must be less than 5MB")
      return
    }

    try {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64String = event.target?.result as string
        updatePersonalInfo("profilePhoto", base64String)
        setSuccess("Profile photo uploaded successfully!")
      }
      reader.onerror = () => {
        setError("Failed to upload image. Please try again.")
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error("Error processing image:", err)
      setError("Failed to process image. Please try again.")
    }
  }

  const removePhoto = () => {
    updatePersonalInfo("profilePhoto", "")
    setSuccess("Profile photo removed")
  }

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (
      file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
      file.type !== "application/msword"
    ) {
      setError("Please upload a Word document (.docx or .doc)")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

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

      console.log("✅ CV saved to database:", savedCV)

      setProgress(20)
      const aiParsedData = await parseResumeWithAI(data.text)

      if (aiParsedData) {
        console.log("✅ AI successfully parsed the CV:", aiParsedData)
        setProgress(60)

        setCvData({
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
          skills: aiParsedData.skills || [""],
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

        setProgress(90)
        setParsedCvText(data.text)
        setProgress(100)
        setSuccess(`CV "${file.name}" uploaded, parsed, and optimized for ATS compatibility!`)
      } else {
        setProgress(70)
        attemptBasicParsing(data.text)
        setParsedCvText(data.text)
        setProgress(100)
        setSuccess(`CV "${file.name}" uploaded and saved successfully! (Basic parsing used)`)
      }

      setActiveTab("edit")
    } catch (err) {
      console.error("Error uploading CV:", err)
      if (err instanceof Error) {
        setError(`Failed to upload CV: ${err.message}`)
      } else {
        setError("Failed to parse CV. Please try again or enter your CV content manually.")
      }
    } finally {
      setLoading(false)
    }
  }

  const attemptBasicParsing = (text: string) => {
    const newCVData = { ...defaultCVData }
    const lines = text.split("\n").filter((line) => line.trim())
    if (lines.length > 0) {
      newCVData.personalInfo.name = lines[0].trim()
    }

    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
    if (emailMatch) {
      newCVData.personalInfo.email = emailMatch[0]
    }

    const phoneMatch = text.match(/(\+?[0-9]{1,3}[-\s]?)?($$)?[0-9]{3}($$)?[-\s]?[0-9]{3}[-\s]?[0-9]{4}/)
    if (phoneMatch) {
      newCVData.personalInfo.phone = phoneMatch[0]
    }

    newCVData.personalInfo.summary = text.substring(0, 500)
    setCvData(newCVData)
  }

  const getAiRecommendations = async () => {
    if (!parsedCvText) {
      setError("Please upload or enter your CV content first")
      return
    }

    if (!jobDescription) {
      setError("Please enter a job description to tailor your CV")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")
    setProgress(0)

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      const response = await fetch("/api/improve-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvContent: parsedCvText,
          jobDescription,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      const recommendations = data.improvedCV

      clearInterval(progressInterval)
      setProgress(100)
      setAiRecommendations(recommendations)
      setActiveTab("recommendations")
      setSuccess("ATS-optimized recommendations generated successfully!")
    } catch (err) {
      console.error("Error getting AI recommendations:", err)
      setError("Failed to generate recommendations. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const updatePersonalInfo = (field: string, value: string) => {
    setCvData({
      ...cvData,
      personalInfo: {
        ...cvData.personalInfo,
        [field]: value,
      },
    })
  }

  const addExperience = () => {
    setCvData({
      ...cvData,
      experience: [
        ...cvData.experience,
        {
          id: `exp-${Date.now()}`,
          title: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
        },
      ],
    })
  }

  const updateExperience = (id: string, field: string, value: string | boolean) => {
    setCvData({
      ...cvData,
      experience: cvData.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    })
  }

  const removeExperience = (id: string) => {
    setCvData({
      ...cvData,
      experience: cvData.experience.filter((exp) => exp.id !== id),
    })
  }

  const addEducation = () => {
    setCvData({
      ...cvData,
      education: [
        ...cvData.education,
        {
          id: `edu-${Date.now()}`,
          degree: "",
          institution: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
        },
      ],
    })
  }

  const updateEducation = (id: string, field: string, value: string | boolean) => {
    setCvData({
      ...cvData,
      education: cvData.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    })
  }

  const removeEducation = (id: string) => {
    setCvData({
      ...cvData,
      education: cvData.education.filter((edu) => edu.id !== id),
    })
  }

  const updateSkills = (skillsString: string) => {
    const skillsArray = skillsString
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean)
    setCvData({
      ...cvData,
      skills: skillsArray,
    })
  }

  const addCertification = () => {
    setCvData({
      ...cvData,
      certifications: [
        ...cvData.certifications,
        {
          id: `cert-${Date.now()}`,
          name: "",
          issuer: "",
          date: "",
          description: "",
        },
      ],
    })
  }

  const updateCertification = (id: string, field: string, value: string) => {
    setCvData({
      ...cvData,
      certifications: cvData.certifications.map((cert) => (cert.id === id ? { ...cert, [field]: value } : cert)),
    })
  }

  const removeCertification = (id: string) => {
    setCvData({
      ...cvData,
      certifications: cvData.certifications.filter((cert) => cert.id !== id),
    })
  }

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
      if (cert.description) text += `${cert.description}\n`
      text += "\n"
    })

    return text
  }

  const downloadCV = () => {
    const cvText = generateCVText()
    const element = document.createElement("a")
    const file = new Blob([cvText], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = "my-ats-optimized-cv.txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const downloadCVAsPDF = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      setError("Pop-up blocked. Please allow pop-ups to download as PDF.")
      return
    }

    const template = getTemplateById(selectedTemplate)
    if (!template) {
      setError("Template not found.")
      return
    }

    const templateHTML = renderTemplate(cvData, template)

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ATS-Optimized CV</title>
          <meta charset="utf-8">
          <style>
            @page { margin: 0.5in; size: A4; }
            @media print { 
              body { margin: 0; padding: 0; } 
              .no-print { display: none; } 
            }
            .print-instructions { 
              background: #f0f8ff; 
              border: 1px solid #0066cc; 
              padding: 15px; 
              margin-bottom: 20px; 
              border-radius: 5px; 
              font-size: 11pt; 
            }
            .print-button { 
              background: #0066cc; 
              color: white; 
              border: none; 
              padding: 10px 20px; 
              border-radius: 5px; 
              cursor: pointer; 
              font-size: 12pt; 
              margin-right: 10px; 
            }
            .print-button:hover { background: #0052a3; }
          </style>
        </head>
        <body>
          <div class="print-instructions no-print">
            <strong>📄 ATS-Optimized CV - Save as PDF Instructions:</strong><br>
            1. Click "Print" below or press Ctrl+P (Cmd+P on Mac)<br>
            2. Choose "Save as PDF" or "Microsoft Print to PDF" as your printer<br>
            3. Click "Save" to download your ATS-friendly PDF<br><br>
            <button class="print-button" onclick="window.print()">🖨️ Print / Save as PDF</button>
            <button class="print-button" onclick="window.close()">❌ Close</button>
          </div>
          
          ${templateHTML}
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        

        {/* Enhanced Navigation */}
        {activeTab !== "upload" && (
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2 p-2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleTabChange("upload")}
                className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl transition-all duration-200 px-4 py-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="font-medium">Upload</span>
              </Button>

              <div className="w-px h-6 bg-gray-200" />

              <Button
                variant={activeTab === "edit" && viewMode === "edit" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setActiveTab("edit")
                  setViewMode("edit")
                }}
                className={`flex items-center rounded-xl transition-all duration-200 px-4 py-2 ${
                  activeTab === "edit" && viewMode === "edit"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "hover:bg-gray-100/80 text-gray-600 hover:text-gray-900"
                }`}
              >
                <Pencil className="w-4 h-4 mr-2" />
                <span className="font-medium">Edit</span>
              </Button>

              <Button
                variant={activeTab === "edit" && viewMode === "preview" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setActiveTab("edit")
                  setViewMode("preview")
                }}
                className={`flex items-center rounded-xl transition-all duration-200 px-4 py-2 ${
                  activeTab === "edit" && viewMode === "preview"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "hover:bg-gray-100/80 text-gray-600 hover:text-gray-900"
                }`}
              >
                <Eye className="w-4 h-4 mr-2" />
                <span className="font-medium">Preview</span>
              </Button>

              <div className="w-px h-6 bg-gray-200" />

              <Button
                variant={activeTab === "templates" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("templates")}
                className={`flex items-center rounded-xl transition-all duration-200 px-4 py-2 ${
                  activeTab === "templates"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "hover:bg-gray-100/80 text-gray-600 hover:text-gray-900"
                }`}
              >
                <FileText className="w-4 h-4 mr-2" />
                <span className="font-medium">Templates</span>
              </Button>

              <Button
                variant={activeTab === "recommendations" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("recommendations")}
                disabled={!jobDescription}
                className={`flex items-center rounded-xl transition-all duration-200 px-4 py-2 ${
                  activeTab === "recommendations"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "hover:bg-gray-100/80 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                }`}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="font-medium">AI Optimize</span>
              </Button>

              <Button
                variant={activeTab === "download" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("download")}
                className={`flex items-center rounded-xl transition-all duration-200 px-4 py-2 ${
                  activeTab === "download"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "hover:bg-gray-100/80 text-gray-600 hover:text-gray-900"
                }`}
              >
                <FileDown className="w-4 h-4 mr-2" />
                <span className="font-medium">Download</span>
              </Button>
            </div>

            {parsedCvText && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-2">
                <CVATSScore cvText={parsedCvText || generateCVText()} className="w-auto" />
              </div>
            )}
          </div>
        )}

        {/* Enhanced Messages */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-2xl flex items-center text-red-700 shadow-lg backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Error Occurred</h4>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-2xl flex items-center text-emerald-700 shadow-lg backdrop-blur-sm animate-in slide-in-from-top-2 duration-500">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-4">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">Success!</h4>
              <p className="text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            {/* Upload Tab */}

            <TabsContent value="upload" currentValue={activeTab}>
              <div className="space-y-8">
                {/* Header Section - matching My CVs style */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                          <Rocket className="w-6 h-6 text-white" />
                        </div>
                        AI-Powered CV Builder
                      </h1>
                      <p className="text-gray-600 mt-2">
                        Create professional, ATS-optimized CVs that get past applicant tracking systems and land you
                        interviews.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature Cards - matching My CVs stats cards style */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-emerald-600">AI-Powered Analysis</p>
                          <p className="text-sm text-emerald-700 mt-1">Advanced algorithms parse and optimize your CV content for maximum ATS compatibility</p>
                        </div>
                        <div className="p-3 bg-emerald-100 rounded-2xl">
                          <Brain className="w-6 h-6 text-emerald-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-cyan-50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Keyword Optimization</p>
                          <p className="text-sm text-blue-700 mt-1">Match job descriptions with precision keyword analysis</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-2xl">
                          <Target className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-purple-600">ATS Score Tracking</p>
                          <p className="text-sm text-purple-700 mt-1">Real-time compatibility scoring to ensure your CV passes automated screening</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-2xl">
                          <BarChart3 className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Upload Card */}
                <Card className="border-0 shadow-lg bg-white rounded-3xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
                    <CardTitle className="flex items-center text-2xl">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                        <Upload className="w-6 h-6" />
                      </div>
                      Upload Your CV for AI Analysis
                    </CardTitle>
                    <p className="text-blue-100 mt-2">
                      Upload your existing CV and let our AI transform it into an ATS-optimized masterpiece
                    </p>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    {/* Instructions */}
                    <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                            <Info className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-blue-900 mb-3 text-lg">How It Works</h3>
                            <div className="space-y-2 text-blue-800">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  1
                                </div>
                                <p className="text-sm">Upload your CV in Word format (.docx or .doc)</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  2
                                </div>
                                <p className="text-sm">Our AI extracts and structures your information</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  3
                                </div>
                                <p className="text-sm">Add job description for targeted optimization</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  4
                                </div>
                                <p className="text-sm">Get ATS-optimized CV with keyword matching</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {loading ? (
                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-12 text-center">
                          <div className="relative mb-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
                            <div className="relative w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto flex items-center justify-center">
                              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          </div>
                          <h3 className="text-2xl font-bold text-blue-900 mb-3">AI Processing Your CV</h3>
                          <p className="text-blue-700 mb-6 text-lg">
                            Analyzing content, extracting data, and optimizing for ATS compatibility...
                          </p>
                          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm max-w-md mx-auto">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between text-blue-800 mb-3">
                                <span className="font-medium">Processing Progress</span>
                                <span className="font-bold text-lg">{progress}%</span>
                              </div>
                              <div className="w-full bg-blue-200 rounded-full h-4 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-4 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                                  style={{ width: `${progress}%` }}
                                >
                                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                                </div>
                              </div>
                              <div className="mt-3 text-xs text-blue-600">
                                {progress < 30 && "Uploading and parsing document..."}
                                {progress >= 30 && progress < 70 && "AI analyzing content structure..."}
                                {progress >= 70 && progress < 95 && "Optimizing for ATS compatibility..."}
                                {progress >= 95 && "Finalizing optimization..."}
                              </div>
                            </CardContent>
                          </Card>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 group">
                        <CardContent className="p-12 text-center">
                          <div className="relative mb-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-75 transition-opacity duration-300"></div>
                            <div className="relative w-20 h-20 bg-gradient-to-r from-gray-400 to-blue-400 group-hover:from-blue-600 group-hover:to-purple-600 rounded-2xl mx-auto flex items-center justify-center transition-all duration-300">
                              <Upload className="w-10 h-10 text-white" />
                            </div>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">Upload Your CV</h3>
                          <p className="text-gray-600 mb-6 text-lg">Drag & drop or click to select your CV file</p>
                          <div className="relative">
                            <Input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                              <Star className="w-5 h-5 mr-2" />
                              Choose CV File
                            </Button>
                          </div>
                          <p className="text-gray-500 text-sm mt-4">
                            Supported formats: .docx, .doc (Word documents work best for ATS optimization)
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="h-px bg-gray-300 flex-1"></div>
                        <span className="text-gray-500 font-medium">OR</span>
                        <div className="h-px bg-gray-300 flex-1"></div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("edit")}
                        className="border-2 border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50 px-8 py-4 text-lg rounded-2xl transition-all duration-300 group"
                      >
                        <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                        Create CV From Scratch
                      </Button>
                    </div>

                    {/* Job Description Section */}
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-6 space-y-6">
                        <Card className="border-0 shadow-sm bg-gradient-to-r from-amber-50 to-orange-50">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                                <Lightbulb className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-amber-900 mb-2 text-lg">
                                  Pro Tip: Job Description Analysis
                                </h3>
                                <p className="text-amber-800 mb-3">
                                  Adding the job description enables our AI to perform advanced keyword matching,
                                  optimize your CV for specific requirements, and significantly increase your ATS score.
                                </p>
                                <Card className="border-0 shadow-sm bg-white/60">
                                  <CardContent className="p-3">
                                    <p className="text-amber-900 text-sm font-medium">
                                      ✨ With job description: 85-95% ATS compatibility
                                      <br />📄 Without job description: 60-75% ATS compatibility
                                    </p>
                                  </CardContent>
                                </Card>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="space-y-4">
                          <Label
                            htmlFor="job-description"
                            className="text-lg font-semibold text-gray-800 flex items-center gap-2"
                          >
                            <Target className="w-5 h-5 text-blue-600" />
                            Target Job Description (Highly Recommended)
                          </Label>
                          <Textarea
                            id="job-description"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the complete job description here. Include requirements, responsibilities, and preferred qualifications for best results..."
                            className="min-h-[200px] border-2 border-gray-200 focus:border-blue-400 rounded-2xl p-4 text-base transition-all duration-300 resize-none"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="border-0 shadow-sm bg-green-50">
                              <CardContent className="p-4">
                                <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4" />
                                  What to Include
                                </h4>
                                <ul className="text-green-800 text-sm space-y-1">
                                  <li>• Complete job posting text</li>
                                  <li>• Required skills and qualifications</li>
                                  <li>• Preferred experience levels</li>
                                  <li>• Company culture keywords</li>
                                </ul>
                              </CardContent>
                            </Card>
                            <Card className="border-0 shadow-sm bg-blue-50">
                              <CardContent className="p-4">
                                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                  <Zap className="w-4 h-4" />
                                  AI Will Optimize
                                </h4>
                                <ul className="text-blue-800 text-sm space-y-1">
                                  <li>• Keyword density and placement</li>
                                  <li>• Skills section alignment</li>
                                  <li>• Experience descriptions</li>
                                  <li>• ATS-friendly formatting</li>
                                </ul>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            {/* Edit Tab */}
            <TabsContent value="edit" currentValue={activeTab}>
              {viewMode === "edit" ? (
                <div className="space-y-6">
                  {/* Instructions Header */}
                  <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                          <Pencil className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-indigo-900 mb-2 text-lg">CV Editor Instructions</h3>
                          <p className="text-indigo-800 mb-3">
                            Click on any section below to edit your CV content. Each section is optimized for ATS
                            compatibility and includes helpful tips to maximize your chances of getting past automated
                            screening.
                          </p>
                          <div className="flex items-center gap-4 text-sm text-indigo-700">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>Auto-saves changes</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>Live preview available</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              <span>ATS-optimized formatting</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Section Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card
                      className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50 group"
                      onClick={() => setActiveModal("personal")}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                            <p className="text-gray-600 text-sm mb-3">
                              Contact details, professional title, and summary
                            </p>
                            <div className="flex items-center gap-2 text-xs text-blue-600">
                              <ArrowRight className="w-3 h-3" />
                              <span>Click to edit contact info & summary</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-l-green-500 bg-gradient-to-br from-white to-green-50 group"
                      onClick={() => setActiveModal("photo")}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">Profile Photo</h3>
                            <p className="text-gray-600 text-sm mb-3">Professional headshot to add to your CV (optional)</p>
                            <div className="flex items-center gap-2 text-xs text-green-600">
                              <ArrowRight className="w-3 h-3" />
                              <span>Upload professional image</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-l-purple-500 bg-gradient-to-br from-white to-purple-50 group"
                      onClick={() => setActiveModal("experience")}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Briefcase className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">Work Experience</h3>
                            <p className="text-gray-600 text-sm mb-3">Professional history with achievements</p>
                            <div className="flex items-center gap-2 text-xs text-purple-600">
                              <ArrowRight className="w-3 h-3" />
                              <span>Add roles, companies & achievements</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-l-indigo-500 bg-gradient-to-br from-white to-indigo-50 group"
                      onClick={() => setActiveModal("education")}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <GraduationCap className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">Education</h3>
                            <p className="text-gray-600 text-sm mb-3">Academic background and qualifications</p>
                            <div className="flex items-center gap-2 text-xs text-indigo-600">
                              <ArrowRight className="w-3 h-3" />
                              <span>Add degrees, schools & achievements</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-l-emerald-500 bg-gradient-to-br from-white to-emerald-50 group"
                      onClick={() => setActiveModal("skills")}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Code className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">Skills & Competencies</h3>
                            <p className="text-gray-600 text-sm mb-3">Technical and soft skills</p>
                            <div className="flex items-center gap-2 text-xs text-emerald-600">
                              <ArrowRight className="w-3 h-3" />
                              <span>List relevant skills & technologies</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className="cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-l-orange-500 bg-gradient-to-br from-white to-orange-50 group"
                      onClick={() => setActiveModal("certifications")}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">Certifications</h3>
                            <p className="text-gray-600 text-sm mb-3">Professional credentials and licenses</p>
                            <div className="flex items-center gap-2 text-xs text-orange-600">
                              <ArrowRight className="w-3 h-3" />
                              <span>Add certificates & credentials</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Enhanced Modal */}
                  {activeModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                          <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center">
                              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
                                {activeModal === "personal" && <User className="w-5 h-5" />}
                                {activeModal === "photo" && <User className="w-5 h-5" />}
                                {activeModal === "experience" && <Briefcase className="w-5 h-5" />}
                                {activeModal === "education" && <GraduationCap className="w-5 h-5" />}
                                {activeModal === "skills" && <Code className="w-5 h-5" />}
                                {activeModal === "certifications" && <Award className="w-5 h-5" />}
                              </div>
                              {activeModal === "personal" && "Personal Information"}
                              {activeModal === "photo" && "Profile Photo"}
                              {activeModal === "experience" && "Work Experience"}
                              {activeModal === "education" && "Education"}
                              {activeModal === "skills" && "Skills & Competencies"}
                              {activeModal === "certifications" && "Certifications"}
                            </h2>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActiveModal(null)}
                              className="text-white hover:bg-white/20 p-2 rounded-xl"
                            >
                              <X className="w-5 h-5" />
                            </Button>
                          </div>
                          <p className="text-blue-100 mt-2 text-sm">
                            {activeModal === "personal" && "Add your contact information and professional summary"}
                            {activeModal === "photo" &&
                              "Upload a professional headshot (optional but recommended for certain industries)"}
                            {activeModal === "experience" && "Detail your work history with quantifiable achievements"}
                            {activeModal === "education" &&
                              "List your educational background and academic achievements"}
                            {activeModal === "skills" &&
                              "Include both technical and soft skills relevant to your target role"}
                            {activeModal === "certifications" && "Add professional certifications and licenses"}
                          </p>
                        </div>
                        <div className="p-8 max-h-[70vh] overflow-y-auto">
                          {/* Modal Content */}
                          {activeModal === "personal" && (
                            <div className="space-y-6">
                              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
                                <div className="flex items-start gap-4">
                                  <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                                    <Lightbulb className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-amber-900 mb-2">ATS Optimization Tips</h4>
                                    <ul className="text-amber-800 text-sm space-y-1">
                                      <li>• Use a clear, professional format without headers/footers</li>
                                      <li>• Include keywords from the job description in your summary</li>
                                      <li>• Keep contact information at the top and easily readable</li>
                                      <li>• Write a compelling summary with 2-3 key achievements</li>
                                    </ul>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                  <Label
                                    htmlFor="name"
                                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                                  >
                                    <User className="w-4 h-4 text-blue-600" />
                                    Full Name *
                                  </Label>
                                  <Input
                                    id="name"
                                    value={cvData.personalInfo.name}
                                    onChange={(e) => updatePersonalInfo("name", e.target.value)}
                                    placeholder="John Doe"
                                    className="border-2 border-gray-200 focus:border-blue-400 rounded-xl p-3 transition-all duration-300"
                                  />
                                </div>
                                <div className="space-y-3">
                                  <Label
                                    htmlFor="title"
                                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                                  >
                                    <Briefcase className="w-4 h-4 text-purple-600" />
                                    Professional Title *
                                  </Label>
                                  <Input
                                    id="title"
                                    value={cvData.personalInfo.title}
                                    onChange={(e) => updatePersonalInfo("title", e.target.value)}
                                    placeholder="Senior Software Engineer"
                                    className="border-2 border-gray-200 focus:border-blue-400 rounded-xl p-3 transition-all duration-300"
                                  />
                                </div>
                                <div className="space-y-3">
                                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                    Email Address *
                                  </Label>
                                  <Input
                                    id="email"
                                    type="email"
                                    value={cvData.personalInfo.email}
                                    onChange={(e) => updatePersonalInfo("email", e.target.value)}
                                    placeholder="john.doe@example.com"
                                    className="border-2 border-gray-200 focus:border-blue-400 rounded-xl p-3 transition-all duration-300"
                                  />
                                </div>
                                <div className="space-y-3">
                                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                                    Phone Number *
                                  </Label>
                                  <Input
                                    id="phone"
                                    value={cvData.personalInfo.phone}
                                    onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                                    placeholder="+1 (555) 123-4567"
                                    className="border-2 border-gray-200 focus:border-blue-400 rounded-xl p-3 transition-all duration-300"
                                  />
                                </div>
                                <div className="space-y-3">
                                  <Label htmlFor="location" className="text-sm font-semibold text-gray-700">
                                    Location *
                                  </Label>
                                  <Input
                                    id="location"
                                    value={cvData.personalInfo.location}
                                    onChange={(e) => updatePersonalInfo("location", e.target.value)}
                                    placeholder="New York, NY"
                                    className="border-2 border-gray-200 focus:border-blue-400 rounded-xl p-3 transition-all duration-300"
                                  />
                                </div>
                                <div className="space-y-3">
                                  <Label htmlFor="linkedin" className="text-sm font-semibold text-gray-700">
                                    LinkedIn Profile
                                  </Label>
                                  <Input
                                    id="linkedin"
                                    value={cvData.personalInfo.linkedin || ""}
                                    onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                                    placeholder="linkedin.com/in/johndoe"
                                    className="border-2 border-gray-200 focus:border-blue-400 rounded-xl p-3 transition-all duration-300"
                                  />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                  <Label htmlFor="website" className="text-sm font-semibold text-gray-700">
                                    Personal Website
                                  </Label>
                                  <Input
                                    id="website"
                                    value={cvData.personalInfo.website || ""}
                                    onChange={(e) => updatePersonalInfo("website", e.target.value)}
                                    placeholder="johndoe.com"
                                    className="border-2 border-gray-200 focus:border-blue-400 rounded-xl p-3 transition-all duration-300"
                                  />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                  <Label
                                    htmlFor="summary"
                                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                                  >
                                    <FileText className="w-4 h-4 text-green-600" />
                                    Professional Summary *
                                  </Label>
                                  <Textarea
                                    id="summary"
                                    value={cvData.personalInfo.summary}
                                    onChange={(e) => updatePersonalInfo("summary", e.target.value)}
                                    placeholder="Write a compelling 3-4 sentence summary highlighting your key achievements, skills, and career goals. Include keywords from your target job description..."
                                    className="min-h-[120px] border-2 border-gray-200 focus:border-blue-400 rounded-xl p-4 transition-all duration-300"
                                  />
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-blue-800 text-sm">
                                      <strong>💡 Pro Tip:</strong> Include 2-3 quantifiable achievements and use action
                                      words like {'"increased,"'} {'"led,"'} {'"developed,"'} or {'"implemented."'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {activeModal === "photo" && (
                            <div className="space-y-6">
                              <div className="bg-gradient-to-r from-amber-50 to-red-50 border border-amber-200 rounded-2xl p-6">
                                <div className="flex items-start gap-4">
                                  <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-red-500 rounded-xl flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-amber-900 mb-2">
                                      Photo Guidelines & Regional Considerations
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <h5 className="font-medium text-amber-900 mb-1">⚠️ ATS Considerations:</h5>
                                        <ul className="text-amber-800 space-y-1">
                                          <li>• Photos can cause parsing issues in some ATS systems</li>
                                          <li>• May lead to unconscious bias in screening</li>
                                          <li>• Can increase file size and processing time</li>
                                        </ul>
                                      </div>
                                      <div>
                                        <h5 className="font-medium text-amber-900 mb-1">🌍 Regional Practices:</h5>
                                        <ul className="text-amber-800 space-y-1">
                                          <li>
                                            • <strong>EU/Germany:</strong> Often expected
                                          </li>
                                          <li>
                                            • <strong>US/UK/Canada:</strong> Generally discouraged
                                          </li>
                                          <li>
                                            • <strong>Creative Industries:</strong> More acceptable
                                          </li>
                                          <li>
                                            • <strong>Corporate/Tech:</strong> Usually avoided
                                          </li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <Label className="text-sm font-semibold text-gray-700">Profile Photo (Optional)</Label>
                                {cvData.personalInfo.profilePhoto ? (
                                  <div className="flex items-start gap-6">
                                    <div className="relative">
                                      <img
                                        src={cvData.personalInfo.profilePhoto || "/placeholder.svg"}
                                        alt="Profile"
                                        className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                                      />
                                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" />
                                      </div>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <p className="text-green-800 font-medium mb-1">✓ Professional photo uploaded</p>
                                        <p className="text-green-700 text-sm">
                                          Your photo will appear in photo-enabled templates. ATS-optimized templates
                                          will automatically exclude this image for maximum compatibility.
                                        </p>
                                      </div>
                                      <div className="flex gap-3">
                                        <Button
                                          type="button"
                                          variant="outline"
                                          onClick={() => document.getElementById("profile-photo")?.click()}
                                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                        >
                                          <Upload className="w-4 h-4 mr-2" />
                                          Change Photo
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          onClick={removePhoto}
                                          className="text-red-600 border-red-200 hover:bg-red-50"
                                        >
                                          <X className="w-4 h-4 mr-2" />
                                          Remove Photo
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors group">
                                    <div className="space-y-4">
                                      <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-blue-100 group-hover:from-blue-100 group-hover:to-purple-100 rounded-2xl mx-auto flex items-center justify-center transition-colors">
                                        <User className="w-12 h-12 text-gray-400 group-hover:text-blue-500" />
                                      </div>
                                      <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                          Upload Professional Photo
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                          High-quality headshot, professional attire, neutral background
                                        </p>
                                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                          <p className="text-gray-700 text-sm">
                                            <strong>Requirements:</strong> JPG or PNG, max 5MB, minimum 400x400px
                                          </p>
                                        </div>
                                      </div>
                                      <Button
                                        type="button"
                                        onClick={() => document.getElementById("profile-photo")?.click()}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                                      >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Choose Photo
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                <Input
                                  id="profile-photo"
                                  type="file"
                                  accept="image/*"
                                  onChange={handlePhotoUpload}
                                  className="hidden"
                                />

                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                    <Brain className="w-4 h-4" />
                                    Smart Template Selection
                                  </h4>
                                  <p className="text-blue-800 text-sm">
                                    Our AI will automatically recommend photo-free templates for ATS-heavy industries
                                    (tech, finance, corporate) and photo-enabled templates for creative fields or
                                    international applications where photos are expected.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {activeModal === "experience" && (
                            <div className="space-y-6">
                              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
                                <div className="flex items-start gap-4">
                                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-emerald-900 mb-2">
                                      Experience Section Best Practices
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <h5 className="font-medium text-emerald-900 mb-1">🚀 ATS Optimization:</h5>
                                        <ul className="text-emerald-800 space-y-1">
                                          <li>• Start bullet points with action verbs</li>
                                          <li>• Include specific numbers and percentages</li>
                                          <li>• Use keywords from job descriptions</li>
                                          <li>• Focus on achievements, not just duties</li>
                                        </ul>
                                      </div>
                                      <div>
                                        <h5 className="font-medium text-emerald-900 mb-1">📊 Quantify Impact:</h5>
                                        <ul className="text-emerald-800 space-y-1">
                                          <li>• {'"Increased sales by 25%"'}</li>
                                          <li>• {'"Led team of 8 developers"'}</li>
                                          <li>• {'"Reduced costs by $50K annually"'}</li>
                                          <li>• {'"Improved efficiency by 40%"'}</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {cvData.experience.map((exp, index) => (
                                <div
                                  key={exp.id}
                                  className="space-y-4 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200"
                                >
                                  <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                        {index + 1}
                                      </div>
                                      Work Experience #{index + 1}
                                    </h3>
                                    {cvData.experience.length > 1 && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeExperience(exp.id)}
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                      >
                                        <X className="w-4 h-4 mr-1" />
                                        Remove
                                      </Button>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">Job Title *</Label>
                                      <Input
                                        value={exp.title}
                                        onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                                        placeholder="Senior Software Engineer"
                                        className="border-2 border-gray-200 focus:border-blue-400 rounded-xl"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">Company *</Label>
                                      <Input
                                        value={exp.company}
                                        onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                                        placeholder="Acme Corporation"
                                        className="border-2 border-gray-200 focus:border-blue-400 rounded-xl"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">Location</Label>
                                      <Input
                                        value={exp.location}
                                        onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                                        placeholder="New York, NY"
                                        className="border-2 border-gray-200 focus:border-blue-400 rounded-xl"
                                      />
                                    </div>
                                    <div className="flex items-center space-x-3 pt-6">
                                      <input
                                        type="checkbox"
                                        id={`current-${exp.id}`}
                                        checked={exp.current}
                                        onChange={(e) => updateExperience(exp.id, "current", e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      <Label
                                        htmlFor={`current-${exp.id}`}
                                        className="text-sm font-medium text-gray-700"
                                      >
                                        I currently work here
                                      </Label>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">Start Date *</Label>
                                      <Input
                                        value={exp.startDate}
                                        onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                                        placeholder="MM/YYYY (e.g., 01/2020)"
                                        className="border-2 border-gray-200 focus:border-blue-400 rounded-xl"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">End Date</Label>
                                      <Input
                                        value={exp.endDate}
                                        onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                                        placeholder="MM/YYYY or 'Present'"
                                        disabled={exp.current}
                                        className="border-2 border-gray-200 focus:border-blue-400 rounded-xl disabled:opacity-50 disabled:bg-gray-100"
                                      />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">
                                        Key Achievements & Responsibilities *
                                      </Label>
                                      <Textarea
                                        value={exp.description}
                                        onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                                        placeholder="• Increased team productivity by 30% through implementation of agile methodologies&#10;• Led cross-functional team of 12 members to deliver $2M project ahead of schedule&#10;• Developed automated testing framework reducing bug reports by 45%&#10;• Mentored 5 junior developers, with 100% promotion rate within 18 months"
                                        className="min-h-[120px] border-2 border-gray-200 focus:border-blue-400 rounded-xl"
                                      />
                                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-blue-800 text-sm">
                                          <strong>💡 Pro Tip:</strong> Use bullet points starting with action verbs
                                          (Led, Developed, Increased, Implemented). Include specific metrics and
                                          outcomes wherever possible.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              <Button
                                variant="outline"
                                onClick={addExperience}
                                className="w-full border-2 border-dashed border-blue-300 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-700 py-6 rounded-2xl transition-all duration-300 group"
                              >
                                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                                Add Another Work Experience
                              </Button>
                            </div>
                          )}

                          {activeModal === "education" && (
                            <div className="space-y-6">
                              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6">
                                <div className="flex items-start gap-4">
                                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                                    <GraduationCap className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-indigo-900 mb-2">Education Section Guidelines</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <h5 className="font-medium text-indigo-900 mb-1">📚 What to Include:</h5>
                                        <ul className="text-indigo-800 space-y-1">
                                          <li>• Degree type and major/field of study</li>
                                          <li>• Institution name and location</li>
                                          <li>• Graduation date (month/year)</li>
                                          <li>• Relevant coursework, honors, GPA (if 3.5+)</li>
                                        </ul>
                                      </div>
                                      <div>
                                        <h5 className="font-medium text-indigo-900 mb-1">🎯 ATS Tips:</h5>
                                        <ul className="text-indigo-800 space-y-1">
                                          <li>• List most recent education first</li>
                                          <li>• Include relevant certifications here</li>
                                          <li>• Mention thesis/capstone if relevant</li>
                                          <li>• Add study abroad or exchange programs</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {cvData.education.map((edu, index) => (
                                <div
                                  key={edu.id}
                                  className="space-y-4 p-6 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-2xl border border-gray-200"
                                >
                                  <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                        {index + 1}
                                      </div>
                                      Education #{index + 1}
                                    </h3>
                                    {cvData.education.length > 1 && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeEducation(edu.id)}
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                      >
                                        <X className="w-4 h-4 mr-1" />
                                        Remove
                                      </Button>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">
                                        Degree & Field of Study *
                                      </Label>
                                      <Input
                                        value={edu.degree}
                                        onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                                        placeholder="Bachelor of Science in Computer Science"
                                        className="border-2 border-gray-200 focus:border-indigo-400 rounded-xl"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">Institution *</Label>
                                      <Input
                                        value={edu.institution}
                                        onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                                        placeholder="University of Technology"
                                        className="border-2 border-gray-200 focus:border-indigo-400 rounded-xl"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">Location</Label>
                                      <Input
                                        value={edu.location}
                                        onChange={(e) => updateEducation(edu.id, "location", e.target.value)}
                                        placeholder="Boston, MA"
                                        className="border-2 border-gray-200 focus:border-indigo-400 rounded-xl"
                                      />
                                    </div>
                                    <div className="flex items-center space-x-3 pt-6">
                                      <input
                                        type="checkbox"
                                        id={`edu-current-${edu.id}`}
                                        checked={edu.current}
                                        onChange={(e) => updateEducation(edu.id, "current", e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                      />
                                      <Label
                                        htmlFor={`edu-current-${edu.id}`}
                                        className="text-sm font-medium text-gray-700"
                                      >
                                        Currently studying here
                                      </Label>
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                                      <Input
                                        value={edu.startDate}
                                        onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                                        placeholder="MM/YYYY (e.g., 09/2016)"
                                        className="border-2 border-gray-200 focus:border-indigo-400 rounded-xl"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">Graduation Date</Label>
                                      <Input
                                        value={edu.endDate}
                                        onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                                        placeholder="MM/YYYY (e.g., 05/2020)"
                                        disabled={edu.current}
                                        className="border-2 border-gray-200 focus:border-indigo-400 rounded-xl disabled:opacity-50 disabled:bg-gray-100"
                                      />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">
                                        Additional Details (Optional)
                                      </Label>
                                      <Textarea
                                        value={edu.description}
                                        onChange={(e) => updateEducation(edu.id, "description", e.target.value)}
                                        placeholder="• Relevant coursework: Data Structures, Algorithms, Database Systems&#10;• Magna Cum Laude, GPA: 3.8/4.0&#10;• Dean's List: Fall 2018, Spring 2019&#10;• Senior Capstone: Machine Learning Application for Predictive Analytics"
                                        className="min-h-[100px] border-2 border-gray-200 focus:border-indigo-400 rounded-xl"
                                      />
                                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                                        <p className="text-indigo-800 text-sm">
                                          <strong>💡 Include:</strong> Honors, relevant coursework, GPA (if 3.5+),
                                          thesis topics, academic achievements, or study abroad programs.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              <Button
                                variant="outline"
                                onClick={addEducation}
                                className="w-full border-2 border-dashed border-indigo-300 hover:border-indigo-400 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-6 rounded-2xl transition-all duration-300 group"
                              >
                                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                                Add Another Education
                              </Button>
                            </div>
                          )}

                          {activeModal === "skills" && (
                            <div className="space-y-6">
                              <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200 rounded-2xl p-6">
                                <div className="flex items-start gap-4">
                                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                    <Target className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-emerald-900 mb-2">
                                      Skills Optimization Strategy
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <h5 className="font-medium text-emerald-900 mb-1">🎯 ATS Keyword Matching:</h5>
                                        <ul className="text-emerald-800 space-y-1">
                                          <li>• Use exact keywords from job descriptions</li>
                                          <li>• Include both technical and soft skills</li>
                                          <li>• List skills in order of relevance</li>
                                          <li>• Avoid abbreviations unless specified</li>
                                        </ul>
                                      </div>
                                      <div>
                                        <h5 className="font-medium text-emerald-900 mb-1">📊 Skill Categories:</h5>
                                        <ul className="text-emerald-800 space-y-1">
                                          <li>
                                            • <strong>Technical:</strong> Programming, software, tools
                                          </li>
                                          <li>
                                            • <strong>Soft:</strong> Leadership, communication
                                          </li>
                                          <li>
                                            • <strong>Industry:</strong> Domain-specific knowledge
                                          </li>
                                          <li>
                                            • <strong>Languages:</strong> Fluency levels
                                          </li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                  <Code className="w-5 h-5 text-emerald-600" />
                                  Skills & Competencies
                                </Label>
                                <Textarea
                                  value={cvData.skills.join(", ")}
                                  onChange={(e) => updateSkills(e.target.value)}
                                  placeholder="JavaScript, React, Node.js, Python, SQL, AWS, Docker, Kubernetes, Project Management, Agile, Scrum, Leadership, Communication, Problem Solving, Data Analysis, Machine Learning, Git, CI/CD, REST APIs, Microservices"
                                  className="min-h-[150px] border-2 border-gray-200 focus:border-emerald-400 rounded-xl p-4 text-base"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                      <Lightbulb className="w-4 h-4" />
                                      Formatting Tips
                                    </h4>
                                    <ul className="text-blue-800 text-sm space-y-1">
                                      <li>• Separate skills with commas</li>
                                      <li>• Use consistent capitalization</li>
                                      <li>• Group similar skills together</li>
                                      <li>• Start with most relevant skills</li>
                                    </ul>
                                  </div>

                                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                                      <CheckCircle className="w-4 h-4" />
                                      Example Skills
                                    </h4>
                                    <ul className="text-green-800 text-sm space-y-1">
                                      <li>
                                        • <strong>Tech:</strong> Python, React, AWS, Docker
                                      </li>
                                      <li>
                                        • <strong>Soft:</strong> Leadership, Communication
                                      </li>
                                      <li>
                                        • <strong>Tools:</strong> Jira, Slack, Figma, Git
                                      </li>
                                      <li>
                                        • <strong>Methods:</strong> Agile, Scrum, DevOps
                                      </li>
                                    </ul>
                                  </div>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                  <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                                    <Brain className="w-4 h-4" />
                                    AI Recommendation
                                  </h4>
                                  <p className="text-amber-800 text-sm">
                                    <strong>Pro Tip:</strong> If you have added a job description, our AI will suggest
                                    the most relevant skills to include based on the requirements. Review the job
                                    posting and ensure you include skills that match exactly as written in the posting.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {activeModal === "certifications" && (
                            <div className="space-y-6">
                              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6">
                                <div className="flex items-start gap-4">
                                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                    <Award className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-orange-900 mb-2">
                                      Certifications & Professional Credentials
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <h5 className="font-medium text-orange-900 mb-1">🏆 What to Include:</h5>
                                        <ul className="text-orange-800 space-y-1">
                                          <li>• Professional certifications (AWS, Google, etc.)</li>
                                          <li>• Industry licenses and credentials</li>
                                          <li>• Completed training programs</li>
                                          <li>• Relevant online course certificates</li>
                                        </ul>
                                      </div>
                                      <div>
                                        <h5 className="font-medium text-orange-900 mb-1">📅 Best Practices:</h5>
                                        <ul className="text-orange-800 space-y-1">
                                          <li>• List most recent/relevant first</li>
                                          <li>• Include expiration dates if applicable</li>
                                          <li>• Add certification numbers/IDs</li>
                                          <li>• Mention if currently pursuing</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {cvData.certifications.map((cert, index) => (
                                <div
                                  key={cert.id}
                                  className="space-y-4 p-6 bg-gradient-to-r from-gray-50 to-orange-50 rounded-2xl border border-gray-200"
                                >
                                  <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                        {index + 1}
                                      </div>
                                      Certification #{index + 1}
                                    </h3>
                                    {cvData.certifications.length > 1 && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeCertification(cert.id)}
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                      >
                                        <X className="w-4 h-4 mr-1" />
                                        Remove
                                      </Button>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">Certification Name *</Label>
                                      <Input
                                        value={cert.name}
                                        onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                                        placeholder="AWS Certified Solutions Architect"
                                        className="border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">
                                        Issuing Organization *
                                      </Label>
                                      <Input
                                        value={cert.issuer}
                                        onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                                        placeholder="Amazon Web Services"
                                        className="border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">Date Obtained *</Label>
                                      <Input
                                        value={cert.date}
                                        onChange={(e) => updateCertification(cert.id, "date", e.target.value)}
                                        placeholder="MM/YYYY (e.g., 03/2023)"
                                        className="border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                                      />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                      <Label className="text-sm font-medium text-gray-700">
                                        Additional Details (Optional)
                                      </Label>
                                      <Textarea
                                        value={cert.description}
                                        onChange={(e) => updateCertification(cert.id, "description", e.target.value)}
                                        placeholder="• Certification ID: AWS-SAA-123456&#10;• Valid until: March 2026&#10;• Covers: Cloud architecture, security, scalability&#10;• Score: 850/1000 (Pass: 720)"
                                        className="min-h-[100px] border-2 border-gray-200 focus:border-orange-400 rounded-xl"
                                      />
                                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                        <p className="text-orange-800 text-sm">
                                          <strong>💡 Include:</strong> Certification ID, expiration date, score (if
                                          impressive), or key competencies covered by the certification.
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              <Button
                                variant="outline"
                                onClick={addCertification}
                                className="w-full border-2 border-dashed border-orange-300 hover:border-orange-400 bg-orange-50 hover:bg-orange-100 text-orange-700 py-6 rounded-2xl transition-all duration-300 group"
                              >
                                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                                Add Another Certification
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : // Preview Mode
              templatePreview ? (
                <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                    <CardTitle className="flex items-center text-xl">
                      <Target className="w-6 h-6 mr-3" />
                      Template Preview - {getTemplateById(selectedTemplate)?.name}
                    </CardTitle>
                    <p className="text-blue-100 mt-2">Live preview of your CV with the selected template</p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div dangerouslySetInnerHTML={{ __html: templatePreview }} />
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                    <CardTitle className="flex items-center text-xl">
                      <Target className="w-6 h-6 mr-3" />
                      ATS-Optimized CV Preview
                    </CardTitle>
                    <p className="text-blue-100 mt-2">Real-time preview of your CV content</p>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="bg-gradient-to-br from-white to-gray-50 p-10 border-2 border-gray-200/50 rounded-3xl shadow-inner">
                      <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                          {cvData.personalInfo.name || "Your Name"}
                        </h1>
                        <p className="text-xl text-gray-700 mb-4">
                          {cvData.personalInfo.title || "Professional Title"}
                        </p>
                        <div className="flex items-center justify-center gap-6 text-gray-600">
                          {cvData.personalInfo.email && (
                            <span className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              {cvData.personalInfo.email}
                            </span>
                          )}
                          {cvData.personalInfo.phone && (
                            <span className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              {cvData.personalInfo.phone}
                            </span>
                          )}
                          {cvData.personalInfo.location && (
                            <span className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              {cvData.personalInfo.location}
                            </span>
                          )}
                        </div>
                        {(cvData.personalInfo.linkedin || cvData.personalInfo.website) && (
                          <div className="flex items-center justify-center gap-6 text-gray-600 mt-2">
                            {cvData.personalInfo.linkedin && (
                              <span className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                LinkedIn: {cvData.personalInfo.linkedin}
                              </span>
                            )}
                            {cvData.personalInfo.website && (
                              <span className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                                Website: {cvData.personalInfo.website}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {cvData.personalInfo.summary && (
                        <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-2xl">
                          <p className="text-gray-800 text-lg leading-relaxed">{cvData.personalInfo.summary}</p>
                        </div>
                      )}

                      {cvData.experience.length > 0 && cvData.experience[0].title && (
                        <div className="mb-8">
                          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                              <Briefcase className="w-4 h-4 text-white" />
                            </div>
                            EXPERIENCE
                          </h2>
                          {cvData.experience.map((exp) => (
                            <div
                              key={exp.id}
                              className="mb-6 p-6 bg-white rounded-2xl border border-gray-200/50 shadow-sm"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-gray-900">{exp.title}</h3>
                                <span className="text-gray-600 font-medium">
                                  {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                                </span>
                              </div>
                              <p className="text-lg text-gray-700 italic mb-3">
                                {exp.company}, {exp.location}
                              </p>
                              <p className="text-gray-800 whitespace-pre-line leading-relaxed">{exp.description}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {cvData.education.length > 0 && cvData.education[0].degree && (
                        <div className="mb-8">
                          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                              <GraduationCap className="w-4 h-4 text-white" />
                            </div>
                            EDUCATION
                          </h2>
                          {cvData.education.map((edu) => (
                            <div
                              key={edu.id}
                              className="mb-6 p-6 bg-white rounded-2xl border border-gray-200/50 shadow-sm"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-gray-900">{edu.degree}</h3>
                                <span className="text-gray-600 font-medium">
                                  {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                                </span>
                              </div>
                              <p className="text-lg text-gray-700 italic mb-3">
                                {edu.institution}, {edu.location}
                              </p>
                              {edu.description && (
                                <p className="text-gray-800 whitespace-pre-line leading-relaxed">{edu.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {cvData.skills.length > 0 && cvData.skills[0] && (
                        <div className="mb-8">
                          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                              <Code className="w-4 h-4 text-white" />
                            </div>
                            SKILLS
                          </h2>
                          <div className="flex flex-wrap gap-3">
                            {cvData.skills.map((skill, index) => (
                              <span
                                key={index}
                                className="bg-gray-100 text-gray-800 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200/50"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {cvData.certifications.length > 0 && cvData.certifications[0].name && (
                        <div className="mb-8">
                          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                              <Award className="w-4 h-4 text-white" />
                            </div>
                            CERTIFICATIONS
                          </h2>
                          {cvData.certifications.map((cert) => (
                            <div
                              key={cert.id}
                              className="mb-6 p-6 bg-white rounded-2xl border border-gray-200/50 shadow-sm"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-gray-900">{cert.name}</h3>
                                <span className="text-gray-600 font-medium">{cert.date}</span>
                              </div>
                              <p className="text-lg text-gray-700 italic mb-3">{cert.issuer}</p>
                              {cert.description && (
                                <p className="text-gray-800 whitespace-pre-line leading-relaxed">{cert.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" currentValue={activeTab}>
              <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
                  <CardTitle className="flex items-center text-2xl">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                      <FileText className="w-6 h-6" />
                    </div>
                    Professional CV Templates
                  </CardTitle>
                  <p className="text-blue-100 mt-2">
                    Choose from our collection of ATS-optimized templates designed for different industries and career
                    levels
                  </p>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-8">
                    {/* Instructions */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                          <Info className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-900 mb-3 text-lg">Template Selection Guide</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="font-medium text-blue-900 mb-2">🎯 ATS-Optimized Templates:</h4>
                              <ul className="text-blue-800 space-y-1">
                                <li>• Clean, simple layouts that ATS systems can read</li>
                                <li>• Standard fonts and formatting</li>
                                <li>• Proper heading structure and spacing</li>
                                <li>• No complex graphics or unusual layouts</li>
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-medium text-blue-900 mb-2">🎨 Industry Considerations:</h4>
                              <ul className="text-blue-800 space-y-1">
                                <li>
                                  • <strong>Tech/Finance:</strong> Minimal, professional designs
                                </li>
                                <li>
                                  • <strong>Creative:</strong> More visual elements allowed
                                </li>
                                <li>
                                  • <strong>Healthcare:</strong> Traditional, conservative layouts
                                </li>
                                <li>
                                  • <strong>Startups:</strong> Modern, clean aesthetics
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {CV_TEMPLATES.map((template) => {
                        const sampleData: CVData = {
                          personalInfo: {
                            name: cvData.personalInfo.name || "John Doe",
                            title: cvData.personalInfo.title || "Software Engineer",
                            email: cvData.personalInfo.email || "john.doe@example.com",
                            phone: cvData.personalInfo.phone || "(555) 123-4567",
                            location: cvData.personalInfo.location || "New York, NY",
                            summary:
                              cvData.personalInfo.summary ||
                              "Experienced software engineer with expertise in full-stack development and team leadership.",
                            linkedin: cvData.personalInfo.linkedin || "",
                            website: cvData.personalInfo.website || "",
                            profilePhoto: cvData.personalInfo.profilePhoto || "",
                          },
                          experience: cvData.experience[0]?.title
                            ? cvData.experience.slice(0, 2)
                            : [
                                {
                                  id: "exp-1",
                                  title: "Senior Software Engineer",
                                  company: "Tech Corp",
                                  location: "New York, NY",
                                  startDate: "2020",
                                  endDate: "Present",
                                  current: true,
                                  description:
                                    "• Led development of key features\n• Improved system performance by 40%",
                                },
                              ],
                          education: cvData.education[0]?.degree
                            ? cvData.education.slice(0, 1)
                            : [
                                {
                                  id: "edu-1",
                                  degree: "Bachelor of Computer Science",
                                  institution: "University of Technology",
                                  location: "New York, NY",
                                  startDate: "2016",
                                  endDate: "2020",
                                  current: false,
                                  description: "",
                                },
                              ],
                          skills: cvData.skills[0]
                            ? cvData.skills.slice(0, 6)
                            : ["JavaScript", "React", "Node.js", "Python", "SQL", "AWS"],
                          certifications: cvData.certifications[0]?.name
                            ? cvData.certifications.slice(0, 1)
                            : [
                                {
                                  id: "cert-1",
                                  name: "AWS Certified Developer",
                                  issuer: "Amazon Web Services",
                                  date: "2023",
                                  description: "",
                                },
                              ],
                        }

                        return (
                          <Card
                            key={template.id}
                            className={`cursor-pointer transition-all duration-300 hover:shadow-2xl transform hover:scale-105 rounded-3xl overflow-hidden ${
                              selectedTemplate === template.id
                                ? "ring-4 ring-blue-500 shadow-2xl scale-105"
                                : "hover:shadow-xl"
                            }`}
                            onClick={() => setSelectedTemplate(template.id)}
                          >
                            <CardContent className="p-6">
                              <div className="aspect-[3/4] bg-gradient-to-br from-white to-gray-50 rounded-2xl mb-6 overflow-hidden border-2 border-gray-200/50 shadow-lg">
                                <div className="w-full h-full p-3 text-xs leading-tight overflow-hidden">
                                  <div
                                    className="w-full h-full overflow-hidden"
                                    style={{
                                      transform: "scale(0.35)",
                                      transformOrigin: "top left",
                                      width: "285%",
                                      height: "285%",
                                    }}
                                  >
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: renderTemplate(sampleData, template)
                                          .replace(/font-size:\s*\d+px/g, "font-size: 14px")
                                          .replace(/padding:\s*[\d.]+in/g, "padding: 20px")
                                          .replace(/margin:\s*[\d.]+in/g, "margin: 10px"),
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>

                              <h3 className="font-bold text-gray-900 mb-3 text-lg">{template.name}</h3>
                              <p className="text-gray-600 mb-4 leading-relaxed">{template.description}</p>

                              <div className="flex items-center justify-between mb-6">
                                <div className="flex space-x-2">
                                  {Object.values(template.colors)
                                    .slice(0, 3)
                                    .map((color, index) => (
                                      <div
                                        key={index}
                                        className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                                        style={{ backgroundColor: color }}
                                      />
                                    ))}
                                </div>
                                <span className="text-xs text-gray-500 capitalize bg-gradient-to-r from-gray-100 to-blue-100 px-3 py-1 rounded-full font-medium">
                                  {template.category.replace("-", " ")}
                                </span>
                              </div>

                              <div className="space-y-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    const template = getTemplateById(selectedTemplate)
                                    if (template) {
                                      const preview = renderTemplate(cvData, template)
                                      setTemplatePreview(preview)
                                      setViewMode("preview")
                                      setActiveTab("edit")
                                    }
                                  }}
                                  className="w-full border-2 border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50 rounded-xl py-3 transition-all duration-300 group"
                                >
                                  <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                  Preview Template
                                </Button>

                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedTemplate(template.id)
                                    const selectedTemplateObj = getTemplateById(template.id)
                                    if (selectedTemplateObj) {
                                      const preview = renderTemplate(cvData, selectedTemplateObj)
                                      setTemplatePreview(preview)
                                      setViewMode("preview")
                                      setActiveTab("edit")
                                      setSuccess(`${selectedTemplateObj.name} template applied successfully!`)
                                    }
                                  }}
                                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Apply Template
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>

                    <div className="flex justify-between items-center pt-8 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("edit")}
                        className="flex items-center border-2 border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50 px-6 py-3 rounded-xl transition-all duration-300"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Editor
                      </Button>

                      <div className="text-center">
                        <p className="text-gray-600 text-sm">
                          Need help choosing? Our AI will recommend the best template based on your industry and
                          experience level.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Recommendations Tab */}
            <TabsContent value="recommendations" currentValue={activeTab}>
              <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
                  <CardTitle className="flex items-center text-2xl">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    AI-Powered ATS Optimization
                  </CardTitle>
                  <p className="text-blue-100 mt-2">
                    Get personalized recommendations to maximize your CVs ATS compatibility and recruiter appeal
                  </p>
                </CardHeader>
                <CardContent className="p-8">
                  {loading ? (
                    <div className="space-y-8 py-12">
                      <div className="text-center">
                        <div className="relative mb-8">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl blur-2xl opacity-75 animate-pulse"></div>
                          <div className="relative w-24 h-24 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl mx-auto flex items-center justify-center">
                            <TrendingUp className="w-12 h-12 text-white animate-pulse" />
                          </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">AI Analyzing Your CV</h3>
                        <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
                          Our advanced AI is analyzing keywords, formatting, and structure to ensure maximum ATS
                          compatibility and recruiter appeal. This process includes keyword density analysis, formatting
                          optimization, and industry-specific recommendations.
                        </p>
                      </div>
                      <div className="max-w-md mx-auto">
                        <div className="flex items-center justify-between text-gray-800 mb-3">
                          <span className="font-medium">Analysis Progress</span>
                          <span className="font-bold text-lg">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-4 rounded-full" />
                        <div className="mt-4 text-center">
                          <p className="text-gray-500 text-sm">
                            {progress < 30 && "🔍 Parsing CV content and structure..."}
                            {progress >= 30 && progress < 60 && "🧠 AI analyzing keywords and formatting..."}
                            {progress >= 60 && progress < 90 && "🎯 Matching against job requirements..."}
                            {progress >= 90 && "✨ Generating personalized recommendations..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : aiRecommendations ? (
                    <div className="space-y-8">
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-8">
                        <div className="flex items-start gap-4 mb-6">
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-emerald-900 mb-2">ATS Optimization Complete!</h3>
                            <p className="text-emerald-800 text-lg">
                              Your CV has been analyzed and optimized for maximum ATS compatibility. Review the detailed
                              recommendations below to further enhance your application.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white/60 rounded-xl p-4 text-center">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                              <Target className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">Keyword Match</h4>
                            <p className="text-gray-700 text-sm">Optimized for job requirements</p>
                          </div>
                          <div className="bg-white/60 rounded-xl p-4 text-center">
                            <div className="w-10 h-10 bg-purple-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">Format Check</h4>
                            <p className="text-gray-700 text-sm">ATS-friendly structure verified</p>
                          </div>
                          <div className="bg-white/60 rounded-xl p-4 text-center">
                            <div className="w-10 h-10 bg-orange-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                              <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">Impact Score</h4>
                            <p className="text-gray-700 text-sm">Enhanced for recruiter appeal</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-8">
                        <h3 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-3">
                            <Brain className="w-5 h-5 text-white" />
                          </div>
                          Detailed ATS Optimization Report
                        </h3>
                        <div className="bg-white rounded-2xl p-6 border border-blue-200/50 shadow-sm">
                          <pre className="whitespace-pre-wrap text-gray-800 text-base leading-relaxed font-sans">
                            {aiRecommendations}
                          </pre>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          onClick={() => handleTabChange("upload")}
                          className="flex items-center border-2 border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50 px-6 py-3 rounded-xl transition-all duration-300"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Start New Analysis
                        </Button>
                        <Button
                          onClick={() => setActiveTab("download")}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <FileDown className="w-4 h-4 mr-2" />
                          Download Optimized CV
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-8">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-blue-800 mb-4">Get Personalized ATS Optimization</h3>
                            <p className="text-blue-700 mb-6 text-lg">
                              Our advanced AI analyzes your CV against the job description to provide comprehensive ATS
                              optimization, keyword matching, and detailed improvement suggestions with specific metrics
                              and examples.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-white/60 rounded-xl p-4">
                                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                  <Target className="w-5 h-5" />
                                  What We Analyze
                                </h4>
                                <ul className="text-blue-800 text-sm space-y-2">
                                  <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    Keyword density and placement optimization
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    ATS-friendly formatting and structure
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    Skills alignment with job requirements
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    Experience description optimization
                                  </li>
                                </ul>
                              </div>

                              <div className="bg-white/60 rounded-xl p-4">
                                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                  <CheckCircle className="w-5 h-5" />
                                  You will Receive
                                </h4>
                                <ul className="text-blue-800 text-sm space-y-2">
                                  <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    Detailed ATS compatibility score
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    Specific keyword recommendations
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    Formatting improvement suggestions
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    Industry-specific optimization tips
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-4">
                          <Label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Target Job Description (Required for Analysis)
                          </Label>
                          <Textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the complete job description here. Include all requirements, responsibilities, preferred qualifications, and company information for the most comprehensive analysis..."
                            className="min-h-[200px] border-2 border-gray-200 focus:border-blue-400 rounded-2xl p-4 text-base transition-all duration-300 resize-none"
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                              <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Include These Elements
                              </h4>
                              <ul className="text-green-800 text-sm space-y-1">
                                <li>• Complete job posting text</li>
                                <li>• Required skills and technologies</li>
                                <li>• Preferred qualifications</li>
                                <li>• Years of experience needed</li>
                                <li>• Company culture keywords</li>
                                <li>• Education requirements</li>
                              </ul>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                <Brain className="w-4 h-4" />
                                AI Will Optimize
                              </h4>
                              <ul className="text-blue-800 text-sm space-y-1">
                                <li>• Keyword density and placement</li>
                                <li>• Skills section alignment</li>
                                <li>• Experience descriptions</li>
                                <li>• Professional summary</li>
                                <li>• ATS-friendly formatting</li>
                                <li>• Industry-specific terminology</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={getAiRecommendations}
                          disabled={!jobDescription || !parsedCvText}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          <Sparkles className="w-5 h-5 mr-3" />
                          Generate ATS Optimization Report
                        </Button>

                        {!parsedCvText && (
                          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-medium text-amber-900 mb-2">CV Required</h4>
                                <p className="text-amber-800 text-sm">
                                  Please upload your CV or create one using our editor before generating ATS
                                  optimization recommendations. The AI needs your CV content to provide personalized
                                  suggestions.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Download Tab */}
            <TabsContent value="download" currentValue={activeTab}>
              <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
                  <CardTitle className="flex items-center text-2xl">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                      <FileDown className="w-6 h-6" />
                    </div>
                    Download Your ATS-Optimized CV
                  </CardTitle>
                  <p className="text-blue-100 mt-2">
                    Your professionally formatted CV is ready for download in multiple formats
                  </p>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-8">
                    {/* Success Banner */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-8">
                      <div className="flex items-start gap-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                          <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-emerald-900 mb-3 text-xl">ATS-Optimized & Ready to Submit</h3>
                          <p className="text-emerald-700 text-lg mb-4">
                            Your CV has been formatted for maximum ATS compatibility with proper structure, keywords,
                            and professional formatting that both automated systems and human recruiters will
                            appreciate.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white/60 rounded-xl p-4 text-center">
                              <div className="w-8 h-8 bg-emerald-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                <Shield className="w-4 h-4 text-white" />
                              </div>
                              <h4 className="font-medium text-emerald-900 text-sm">ATS Compatible</h4>
                              <p className="text-emerald-700 text-xs">Passes automated screening</p>
                            </div>
                            <div className="bg-white/60 rounded-xl p-4 text-center">
                              <div className="w-8 h-8 bg-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                <Target className="w-4 h-4 text-white" />
                              </div>
                              <h4 className="font-medium text-emerald-900 text-sm">Keyword Optimized</h4>
                              <p className="text-emerald-700 text-xs">Matches job requirements</p>
                            </div>
                            <div className="bg-white/60 rounded-xl p-4 text-center">
                              <div className="w-8 h-8 bg-purple-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                <Users className="w-4 h-4 text-white" />
                              </div>
                              <h4 className="font-medium text-emerald-900 text-sm">Recruiter Friendly</h4>
                              <p className="text-emerald-700 text-xs">Professional appearance</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CV Preview */}
                    <div className="bg-gradient-to-br from-white to-gray-50 p-10 border-2 border-gray-200/50 rounded-3xl shadow-inner">
                      <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                          {cvData.personalInfo.name || "Your Name"}
                        </h1>
                        <p className="text-xl text-gray-700 mb-4">
                          {cvData.personalInfo.title || "Professional Title"}
                        </p>
                        <div className="flex items-center justify-center gap-6 text-gray-600">
                          {cvData.personalInfo.email && (
                            <span className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              {cvData.personalInfo.email}
                            </span>
                          )}
                          {cvData.personalInfo.phone && (
                            <span className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              {cvData.personalInfo.phone}
                            </span>
                          )}
                          {cvData.personalInfo.location && (
                            <span className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              {cvData.personalInfo.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {cvData.personalInfo.summary && (
                        <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-2xl">
                          <p className="text-gray-800 text-lg leading-relaxed">
                            {cvData.personalInfo.summary.substring(0, 200)}
                            {cvData.personalInfo.summary.length > 200 && "..."}
                          </p>
                        </div>
                      )}

                      <div className="text-center text-gray-500 italic">
                        <p className="text-lg">Preview of your optimized CV content...</p>
                        <p className="text-sm mt-2">Complete content available in downloaded files</p>
                      </div>
                    </div>

                    {/* Download Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <Card className="border-2 border-gray-200/50 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
                        <CardContent className="p-8 flex flex-col items-center text-center">
                          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <FileText className="w-10 h-10 text-white" />
                          </div>
                          <h3 className="text-xl font-bold mb-4">Download as Text</h3>
                          <p className="text-gray-600 mb-6 leading-relaxed">
                            Download your ATS-optimized CV as a plain text file with proper formatting for maximum
                            compatibility with all applicant tracking systems.
                          </p>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 w-full">
                            <h4 className="font-medium text-blue-900 mb-2">Perfect For:</h4>
                            <ul className="text-blue-800 text-sm text-left space-y-1">
                              <li>• Online job applications</li>
                              <li>• ATS system uploads</li>
                              <li>• Copy-paste into forms</li>
                              <li>• Maximum compatibility</li>
                            </ul>
                          </div>
                          <Button
                            onClick={downloadCV}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          >
                            <Download className="w-5 h-5 mr-2" />
                            Download ATS .txt File
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-gray-200/50 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 group">
                        <CardContent className="p-8 flex flex-col items-center text-center">
                          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <FileText className="w-10 h-10 text-white" />
                          </div>
                          <h3 className="text-xl font-bold mb-4">Download as PDF</h3>
                          <p className="text-gray-600 mb-6 leading-relaxed">
                            Download your ATS-optimized CV as a professionally formatted PDF document ready for
                            submission to recruiters and hiring managers.
                          </p>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 w-full">
                            <h4 className="font-medium text-red-900 mb-2">Perfect For:</h4>
                            <ul className="text-red-800 text-sm text-left space-y-1">
                              <li>• Email attachments</li>
                              <li>• Direct recruiter submissions</li>
                              <li>• Professional presentation</li>
                              <li>• Print-ready format</li>
                            </ul>
                          </div>
                          <Button
                            onClick={downloadCVAsPDF}
                            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          >
                            <Download className="w-5 h-5 mr-2" />
                            Download Professional PDF
                          </Button>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-8 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("edit")}
                        className="flex items-center border-2 border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50 px-6 py-3 rounded-xl transition-all duration-300"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Editor
                      </Button>

                      <div className="text-center">
                        <p className="text-gray-600 text-sm mb-2">
                          Need to make changes? You can always go back and edit your CV.
                        </p>
                        <p className="text-gray-500 text-xs">Your progress is automatically saved</p>
                      </div>

                      <Button
                        onClick={() => {
                          setActiveTab("upload")
                          setCvData(defaultCVData)
                          setParsedCvText("")
                          setJobDescription("")
                          setAiRecommendations("")
                        }}
                        variant="outline"
                        className="flex items-center border-2 border-gray-300 hover:border-green-400 bg-white hover:bg-green-50 px-6 py-3 rounded-xl transition-all duration-300"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Create New CV
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
