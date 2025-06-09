"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Zap,
} from "lucide-react"

import { CVService } from "@/lib/cv-service"
import { parseResumeWithAI } from "@/lib/resume-parser"
import CVATSScore from "@/components/cv-ats-score"

// CV sections interface
interface CVData {
  personalInfo: {
    name: string
    title: string
    email: string
    phone: string
    location: string
    summary: string
    linkedin?: string
    website?: string
  }
  experience: Array<{
    id: string
    title: string
    company: string
    location: string
    startDate: string
    endDate: string
    current: boolean
    description: string
  }>
  education: Array<{
    id: string
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
    id: string
    name: string
    issuer: string
    date: string
    description: string
  }>
}

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

  // Debug logging - add this right after your useState declarations
  console.log("🔍 CV Builder Debug:", {
    activeTab,
    parsedCvText: parsedCvText ? "has content" : "empty",
    cvDataName: cvData.personalInfo.name,
    loading,
    error,
    success,
  })

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is .docx or .doc only
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

      // Parse the CV
      const response = await fetch("/api/cv-parser", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setParsedCvText(data.text)

      // Save to Supabase
      const savedCV = await CVService.saveCV({
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension for title
        file_name: file.name,
        file_size: file.size,
        parsed_content: data.text,
        raw_text: data.text,
      })

      console.log("✅ CV saved to database:", savedCV)

      // NEW: Use AI to parse the CV text
      setProgress(10)
      const aiParsedData = await parseResumeWithAI(data.text)

      if (aiParsedData) {
        console.log("✅ AI successfully parsed the CV:", aiParsedData)
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
        setProgress(100)
        setSuccess(`CV "${file.name}" uploaded, parsed, and optimized for ATS compatibility!`)
      } else {
        // Fall back to basic parsing if AI fails
        attemptBasicParsing(data.text)
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

  // Basic parsing of CV text
  const attemptBasicParsing = (text: string) => {
    // This is a very basic implementation
    // In a production app, you would want more sophisticated parsing

    const newCVData = { ...defaultCVData }

    // Try to extract name (assuming it's at the beginning)
    const lines = text.split("\n").filter((line) => line.trim())
    if (lines.length > 0) {
      newCVData.personalInfo.name = lines[0].trim()
    }

    // Try to extract email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
    if (emailMatch) {
      newCVData.personalInfo.email = emailMatch[0]
    }

    // Try to extract phone
    const phoneMatch = text.match(/(\+?[0-9]{1,3}[-\s]?)?($$)?[0-9]{3}($$)?[-\s]?[0-9]{3}[-\s]?[0-9]{4}/)
    if (phoneMatch) {
      newCVData.personalInfo.phone = phoneMatch[0]
    }

    // Set the full text as summary for now
    newCVData.personalInfo.summary = text.substring(0, 500) // Limit to 500 chars

    setCvData(newCVData)
  }

  // Get AI recommendations
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
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      // Call the AI service
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

  // Update CV data
  const updatePersonalInfo = (field: string, value: string) => {
    setCvData({
      ...cvData,
      personalInfo: {
        ...cvData.personalInfo,
        [field]: value,
      },
    })
  }

  // Add new experience entry
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

  // Update experience entry
  const updateExperience = (id: string, field: string, value: string | boolean) => {
    setCvData({
      ...cvData,
      experience: cvData.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    })
  }

  // Remove experience entry
  const removeExperience = (id: string) => {
    setCvData({
      ...cvData,
      experience: cvData.experience.filter((exp) => exp.id !== id),
    })
  }

  // Add new education entry
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

  // Update education entry
  const updateEducation = (id: string, field: string, value: string | boolean) => {
    setCvData({
      ...cvData,
      education: cvData.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    })
  }

  // Remove education entry
  const removeEducation = (id: string) => {
    setCvData({
      ...cvData,
      education: cvData.education.filter((edu) => edu.id !== id),
    })
  }

  // Update skills
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

  // Add new certification
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

  // Update certification
  const updateCertification = (id: string, field: string, value: string) => {
    setCvData({
      ...cvData,
      certifications: cvData.certifications.map((cert) => (cert.id === id ? { ...cert, [field]: value } : cert)),
    })
  }

  // Remove certification
  const removeCertification = (id: string) => {
    setCvData({
      ...cvData,
      certifications: cvData.certifications.filter((cert) => cert.id !== id),
    })
  }

  // Generate CV text from structured data
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

  // Download CV as text
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

  // Download CV as PDF
  const downloadCVAsPDF = () => {
    // Open printable version in new window
    const printWindow = window.open("", "_blank")

    if (!printWindow) {
      setError("Pop-up blocked. Please allow pop-ups to download as PDF.")
      return
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>ATS-Optimized CV</title>
          <meta charset="utf-8">
          <style>
            @page { margin: 1in; size: A4; }
            body { 
              font-family: 'Arial', sans-serif; 
              font-size: 12pt; 
              line-height: 1.6; 
              color: #000; 
              max-width: 8.5in; 
              margin: 0 auto; 
              padding: 0; 
            }
            h1, h2, h3 { margin-top: 20px; margin-bottom: 10px; }
            h1 { font-size: 18pt; }
            h2 { font-size: 16pt; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .header { text-align: center; margin-bottom: 20px; }
            .contact-info { text-align: center; margin-bottom: 20px; font-size: 11pt; }
            .section { margin-bottom: 20px; }
            .item { margin-bottom: 15px; }
            .item-header { display: flex; justify-content: space-between; font-weight: bold; }
            .item-title { font-weight: bold; }
            .item-subtitle { font-style: italic; }
            .item-date { color: #666; }
            .item-description { margin-top: 5px; white-space: pre-wrap; }
            .skills-list { display: flex; flex-wrap: wrap; gap: 10px; }
            .skill-item { background: #f0f0f0; padding: 3px 10px; border-radius: 15px; font-size: 10pt; }
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
            @media print { 
              body { margin: 0; padding: 0; } 
              .no-print { display: none; } 
            }
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
          
          <div class="header">
            <h1>${cvData.personalInfo.name}</h1>
            <div>${cvData.personalInfo.title}</div>
          </div>
          
          <div class="contact-info">
            ${cvData.personalInfo.email} | ${cvData.personalInfo.phone} | ${cvData.personalInfo.location}
            ${cvData.personalInfo.linkedin ? `<br>LinkedIn: ${cvData.personalInfo.linkedin}` : ""}
            ${cvData.personalInfo.website ? `<br>Website: ${cvData.personalInfo.website}` : ""}
          </div>
          
          <div class="section">
            <p>${cvData.personalInfo.summary}</p>
          </div>
          
          <div class="section">
            <h2>EXPERIENCE</h2>
            ${cvData.experience
              .map(
                (exp) => `
              <div class="item">
                <div class="item-header">
                  <span class="item-title">${exp.title}</span>
                  <span class="item-date">${exp.startDate} - ${exp.current ? "Present" : exp.endDate}</span>
                </div>
                <div class="item-subtitle">${exp.company}, ${exp.location}</div>
                <div class="item-description">${exp.description.replace(/\n/g, "<br>")}</div>
              </div>
            `,
              )
              .join("")}
          </div>
          
          <div class="section">
            <h2>EDUCATION</h2>
            ${cvData.education
              .map(
                (edu) => `
              <div class="item">
                <div class="item-header">
                  <span class="item-title">${edu.degree}</span>
                  <span class="item-date">${edu.startDate} - ${edu.current ? "Present" : edu.endDate}</span>
                </div>
                <div class="item-subtitle">${edu.institution}, ${edu.location}</div>
                <div class="item-description">${edu.description.replace(/\n/g, "<br>")}</div>
              </div>
            `,
              )
              .join("")}
          </div>
          
          <div class="section">
            <h2>SKILLS</h2>
            <div class="skills-list">
              ${cvData.skills.map((skill) => `<span class="skill-item">${skill}</span>`).join("")}
            </div>
          </div>
          
          <div class="section">
            <h2>CERTIFICATIONS</h2>
            ${cvData.certifications
              .map(
                (cert) => `
              <div class="item">
                <div class="item-header">
                  <span class="item-title">${cert.name}</span>
                  <span class="item-date">${cert.date}</span>
                </div>
                <div class="item-subtitle">${cert.issuer}</div>
                ${cert.description ? `<div class="item-description">${cert.description.replace(/\n/g, "<br>")}</div>` : ""}
              </div>
            `,
              )
              .join("")}
          </div>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">ATS-Optimized CV Builder</h1>
            </div>
            {/* Make sure the ATS Score Component is visible */}
            {parsedCvText && <CVATSScore cvText={parsedCvText || generateCVText()} className="w-auto" />}
          </div>
          <p className="text-gray-600 text-lg">
            Create professional, ATS-friendly CVs that get past applicant tracking systems and land you interviews
          </p>
          <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-600" />
              <span>ATS-Optimized Formatting</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span>Keyword Optimization</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>AI-Powered Recommendations</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
            <Check className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="upload">Upload CV</TabsTrigger>
            <TabsTrigger value="edit">Edit CV</TabsTrigger>
            <TabsTrigger value="recommendations">ATS Optimization</TabsTrigger>
            <TabsTrigger value="download">Download</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" currentValue={activeTab}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Your CV for ATS Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900 mb-1">ATS-Friendly CV Builder</h3>
                      <p className="text-blue-700 text-sm">
                        Our AI automatically optimizes your CV for Applicant Tracking Systems, ensuring it gets past
                        automated screening and reaches human recruiters.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload your CV</h3>
                  <p className="text-gray-500 mb-4">Word document (.docx or .doc) for best ATS compatibility</p>
                  <div className="relative">
                    <Input
                      id="cv-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={loading}
                    />
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                      disabled={loading}
                    >
                      {loading ? "Processing for ATS..." : "Select File"}
                    </Button>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-500 mb-2">Or</p>
                  <Button variant="outline" onClick={() => setActiveTab("edit")}>
                    Create ATS-Optimized CV From Scratch
                  </Button>
                </div>

                <div className="space-y-4 mt-8">
                  <div className="space-y-2">
                    <Label htmlFor="job-description">Job Description (Required for ATS Optimization)</Label>
                    <Textarea
                      id="job-description"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the complete job description here to get ATS-optimized recommendations with relevant keywords..."
                      className="min-h-[150px]"
                    />
                    <p className="text-sm text-gray-500">
                      <strong>ATS Tip:</strong> Adding the job description helps our AI match keywords, optimize
                      formatting, and ensure your CV passes automated screening systems.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edit Tab */}
          <TabsContent value="edit" currentValue={activeTab}>
            <div className="flex justify-end mb-4 space-x-4">
              <Button
                variant={viewMode === "edit" ? "default" : "outline"}
                onClick={() => setViewMode("edit")}
                className="flex items-center"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Mode
              </Button>
              <Button
                variant={viewMode === "preview" ? "default" : "outline"}
                onClick={() => setViewMode("preview")}
                className="flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                ATS Preview
              </Button>
            </div>

            {viewMode === "edit" ? (
              <div className="space-y-8">
                {/* Personal Information */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                      <p className="text-amber-800 text-sm">
                        <strong>ATS Tip:</strong> Use a clear, professional format. Avoid headers/footers, images, or
                        complex formatting that ATS systems can&apos;t read.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={cvData.personalInfo.name}
                          onChange={(e) => updatePersonalInfo("name", e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="title">Professional Title</Label>
                        <Input
                          id="title"
                          value={cvData.personalInfo.title}
                          onChange={(e) => updatePersonalInfo("title", e.target.value)}
                          placeholder="Senior Software Engineer"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={cvData.personalInfo.email}
                          onChange={(e) => updatePersonalInfo("email", e.target.value)}
                          placeholder="john.doe@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={cvData.personalInfo.phone}
                          onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={cvData.personalInfo.location}
                          onChange={(e) => updatePersonalInfo("location", e.target.value)}
                          placeholder="New York, NY"
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedin">LinkedIn (optional)</Label>
                        <Input
                          id="linkedin"
                          value={cvData.personalInfo.linkedin || ""}
                          onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                          placeholder="linkedin.com/in/johndoe"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="website">Website (optional)</Label>
                        <Input
                          id="website"
                          value={cvData.personalInfo.website || ""}
                          onChange={(e) => updatePersonalInfo("website", e.target.value)}
                          placeholder="johndoe.com"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="summary">Professional Summary</Label>
                        <Textarea
                          id="summary"
                          value={cvData.personalInfo.summary}
                          onChange={(e) => updatePersonalInfo("summary", e.target.value)}
                          placeholder="Write a compelling summary that includes keywords from your target job description..."
                          className="min-h-[100px]"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          <strong>ATS Tip:</strong> Include 2-3 key skills and quantifiable achievements in your
                          summary.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Work Experience */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
                    <CardTitle className="flex items-center">
                      <Briefcase className="w-5 h-5 mr-2" />
                      Work Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <p className="text-green-800 text-sm">
                        <strong>ATS Optimization:</strong> Use action verbs, quantify achievements with numbers, and
                        include relevant keywords from job descriptions.
                      </p>
                    </div>
                    {cvData.experience.map((exp, index) => (
                      <div key={exp.id} className="space-y-4 pb-6 border-b border-gray-200 last:border-0">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">Experience #{index + 1}</h3>
                          {cvData.experience.length > 1 && (
                            <Button variant="destructive" size="sm" onClick={() => removeExperience(exp.id)}>
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`job-title-${exp.id}`}>Job Title</Label>
                            <Input
                              id={`job-title-${exp.id}`}
                              value={exp.title}
                              onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                              placeholder="Senior Software Engineer"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`company-${exp.id}`}>Company</Label>
                            <Input
                              id={`company-${exp.id}`}
                              value={exp.company}
                              onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                              placeholder="Acme Inc."
                            />
                          </div>
                          <div>
                            <Label htmlFor={`location-${exp.id}`}>Location</Label>
                            <Input
                              id={`location-${exp.id}`}
                              value={exp.location}
                              onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                              placeholder="New York, NY"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`current-${exp.id}`}
                              checked={exp.current}
                              onChange={(e) => updateExperience(exp.id, "current", e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor={`current-${exp.id}`} className="text-sm font-medium text-gray-700">
                              I currently work here
                            </Label>
                          </div>
                          <div>
                            <Label htmlFor={`start-date-${exp.id}`}>Start Date</Label>
                            <Input
                              id={`start-date-${exp.id}`}
                              value={exp.startDate}
                              onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                              placeholder="MM/YYYY"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`end-date-${exp.id}`}>End Date</Label>
                            <Input
                              id={`end-date-${exp.id}`}
                              value={exp.endDate}
                              onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                              placeholder="MM/YYYY"
                              disabled={exp.current}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor={`description-${exp.id}`}>Description</Label>
                            <Textarea
                              id={`description-${exp.id}`}
                              value={exp.description}
                              onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                              placeholder="• Increased sales by 25% through strategic partnerships&#10;• Led a team of 8 developers using Agile methodologies&#10;• Implemented automated testing reducing bugs by 40%"
                              className="min-h-[100px]"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                              <strong>ATS Tip:</strong> Use bullet points, start with action verbs, and include specific
                              metrics and achievements.
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addExperience} className="w-full">
                      + Add Another Experience
                    </Button>
                  </CardContent>
                </Card>

                {/* Education */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
                    <CardTitle className="flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {cvData.education.map((edu, index) => (
                      <div key={edu.id} className="space-y-4 pb-6 border-b border-gray-200 last:border-0">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">Education #{index + 1}</h3>
                          {cvData.education.length > 1 && (
                            <Button variant="destructive" size="sm" onClick={() => removeEducation(edu.id)}>
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`degree-${edu.id}`}>Degree</Label>
                            <Input
                              id={`degree-${edu.id}`}
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                              placeholder="Bachelor of Science in Computer Science"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`institution-${edu.id}`}>Institution</Label>
                            <Input
                              id={`institution-${edu.id}`}
                              value={edu.institution}
                              onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                              placeholder="University of Example"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edu-location-${edu.id}`}>Location</Label>
                            <Input
                              id={`edu-location-${edu.id}`}
                              value={edu.location}
                              onChange={(e) => updateEducation(edu.id, "location", e.target.value)}
                              placeholder="New York, NY"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`edu-current-${edu.id}`}
                              checked={edu.current}
                              onChange={(e) => updateEducation(edu.id, "current", e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <Label htmlFor={`edu-current-${edu.id}`} className="text-sm font-medium text-gray-700">
                              I&apos;m currently studying here
                            </Label>
                          </div>
                          <div>
                            <Label htmlFor={`edu-start-date-${edu.id}`}>Start Date</Label>
                            <Input
                              id={`edu-start-date-${edu.id}`}
                              value={edu.startDate}
                              onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                              placeholder="MM/YYYY"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edu-end-date-${edu.id}`}>End Date</Label>
                            <Input
                              id={`edu-end-date-${edu.id}`}
                              value={edu.endDate}
                              onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                              placeholder="MM/YYYY"
                              disabled={edu.current}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor={`edu-description-${edu.id}`}>Description (Optional)</Label>
                            <Textarea
                              id={`edu-description-${edu.id}`}
                              value={edu.description}
                              onChange={(e) => updateEducation(edu.id, "description", e.target.value)}
                              placeholder="Relevant coursework, achievements, activities..."
                              className="min-h-[100px]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addEducation} className="w-full">
                      + Add Another Education
                    </Button>
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
                    <CardTitle className="flex items-center">
                      <Code className="w-5 h-5 mr-2" />
                      Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                        <p className="text-purple-800 text-sm">
                          <strong>ATS Strategy:</strong> Include both technical and soft skills mentioned in the job
                          description. Use exact keyword matches when possible.
                        </p>
                      </div>
                      <Label htmlFor="skills">Skills (comma-separated)</Label>
                      <Textarea
                        id="skills"
                        value={cvData.skills.join(", ")}
                        onChange={(e) => updateSkills(e.target.value)}
                        placeholder="JavaScript, React, Node.js, Project Management, Communication, Agile, SQL, Python..."
                        className="min-h-[100px]"
                      />
                      <p className="text-sm text-gray-500">
                        <strong>ATS Tip:</strong> List skills exactly as they appear in job descriptions. Include both
                        technical skills and soft skills relevant to the role.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Certifications */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2" />
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {cvData.certifications.map((cert, index) => (
                      <div key={cert.id} className="space-y-4 pb-6 border-b border-gray-200 last:border-0">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">Certification #{index + 1}</h3>
                          {cvData.certifications.length > 1 && (
                            <Button variant="destructive" size="sm" onClick={() => removeCertification(cert.id)}>
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`cert-name-${cert.id}`}>Certification Name</Label>
                            <Input
                              id={`cert-name-${cert.id}`}
                              value={cert.name}
                              onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                              placeholder="AWS Certified Solutions Architect"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`cert-issuer-${cert.id}`}>Issuing Organization</Label>
                            <Input
                              id={`cert-issuer-${cert.id}`}
                              value={cert.issuer}
                              onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                              placeholder="Amazon Web Services"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`cert-date-${cert.id}`}>Date</Label>
                            <Input
                              id={`cert-date-${cert.id}`}
                              value={cert.date}
                              onChange={(e) => updateCertification(cert.id, "date", e.target.value)}
                              placeholder="MM/YYYY"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor={`cert-description-${cert.id}`}>Description (Optional)</Label>
                            <Textarea
                              id={`cert-description-${cert.id}`}
                              value={cert.description}
                              onChange={(e) => updateCertification(cert.id, "description", e.target.value)}
                              placeholder="Additional details about the certification..."
                              className="min-h-[80px]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addCertification} className="w-full">
                      + Add Another Certification
                    </Button>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("upload")} className="flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Upload
                  </Button>
                  <div className="space-x-4">
                    <Button
                      onClick={() => setActiveTab("recommendations")}
                      disabled={!jobDescription}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Get ATS Optimization
                    </Button>
                    <Button
                      onClick={() => setActiveTab("download")}
                      className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Preview & Download
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Preview Mode
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    ATS-Optimized CV Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="bg-white p-8 border border-gray-200 rounded-lg shadow-inner">
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold">{cvData.personalInfo.name || "Your Name"}</h1>
                      <p className="text-gray-700">{cvData.personalInfo.title || "Professional Title"}</p>
                      <p className="text-gray-600 text-sm mt-2">
                        {cvData.personalInfo.email && `${cvData.personalInfo.email} | `}
                        {cvData.personalInfo.phone && `${cvData.personalInfo.phone} | `}
                        {cvData.personalInfo.location}
                      </p>
                      {(cvData.personalInfo.linkedin || cvData.personalInfo.website) && (
                        <p className="text-gray-600 text-sm">
                          {cvData.personalInfo.linkedin && `LinkedIn: ${cvData.personalInfo.linkedin} | `}
                          {cvData.personalInfo.website && `Website: ${cvData.personalInfo.website}`}
                        </p>
                      )}
                    </div>

                    {cvData.personalInfo.summary && (
                      <div className="mb-6">
                        <p className="text-gray-800">{cvData.personalInfo.summary}</p>
                      </div>
                    )}

                    {cvData.experience.length > 0 && cvData.experience[0].title && (
                      <div className="mb-6">
                        <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">EXPERIENCE</h2>
                        {cvData.experience.map((exp) => (
                          <div key={exp.id} className="mb-4">
                            <div className="flex justify-between">
                              <h3 className="font-bold">{exp.title}</h3>
                              <span className="text-gray-600 text-sm">
                                {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                              </span>
                            </div>
                            <p className="text-gray-700 italic">
                              {exp.company}, {exp.location}
                            </p>
                            <p className="text-gray-800 whitespace-pre-line mt-1">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {cvData.education.length > 0 && cvData.education[0].degree && (
                      <div className="mb-6">
                        <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">EDUCATION</h2>
                        {cvData.education.map((edu) => (
                          <div key={edu.id} className="mb-4">
                            <div className="flex justify-between">
                              <h3 className="font-bold">{edu.degree}</h3>
                              <span className="text-gray-600 text-sm">
                                {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                              </span>
                            </div>
                            <p className="text-gray-700 italic">
                              {edu.institution}, {edu.location}
                            </p>
                            {edu.description && (
                              <p className="text-gray-800 whitespace-pre-line mt-1">{edu.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {cvData.skills.length > 0 && cvData.skills[0] && (
                      <div className="mb-6">
                        <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">SKILLS</h2>
                        <div className="flex flex-wrap gap-2">
                          {cvData.skills.map((skill, index) => (
                            <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {cvData.certifications.length > 0 && cvData.certifications[0].name && (
                      <div className="mb-6">
                        <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">CERTIFICATIONS</h2>
                        {cvData.certifications.map((cert) => (
                          <div key={cert.id} className="mb-4">
                            <div className="flex justify-between">
                              <h3 className="font-bold">{cert.name}</h3>
                              <span className="text-gray-600 text-sm">{cert.date}</span>
                            </div>
                            <p className="text-gray-700 italic">{cert.issuer}</p>
                            {cert.description && (
                              <p className="text-gray-800 whitespace-pre-line mt-1">{cert.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setViewMode("edit")} className="flex items-center">
                      <Pencil className="w-4 h-4 mr-2" />
                      Back to Edit Mode
                    </Button>
                    <div className="space-x-4">
                      <Button
                        onClick={() => setActiveTab("recommendations")}
                        disabled={!jobDescription}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Get ATS Optimization
                      </Button>
                      <Button
                        onClick={() => setActiveTab("download")}
                        className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                      >
                        <FileDown className="w-4 h-4 mr-2" />
                        Download ATS CV
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI Recommendations Tab */}
          <TabsContent value="recommendations" currentValue={activeTab}>
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  ATS Optimization & AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="space-y-6 py-8">
                    <div className="text-center">
                      <Target className="w-16 h-16 text-indigo-500 mx-auto animate-pulse" />
                      <h3 className="text-xl font-medium mt-4 mb-2">Optimizing your CV for ATS...</h3>
                      <p className="text-gray-600 mb-6">
                        Our AI is analyzing keywords, formatting, and structure to ensure maximum ATS compatibility and
                        recruiter appeal.
                      </p>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-center text-gray-500 text-sm">{progress}% complete</p>
                  </div>
                ) : aiRecommendations ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-100">
                      <h3 className="text-lg font-medium text-purple-800 mb-4 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-purple-600" />
                        ATS Optimization Report & Recommendations
                      </h3>
                      <div className="prose max-w-none">
                        <pre className="whitespace-pre-wrap text-gray-800 font-sans">{aiRecommendations}</pre>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setActiveTab("edit")} className="flex items-center">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Edit CV
                      </Button>
                      <Button
                        onClick={() => setActiveTab("download")}
                        className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                      >
                        <FileDown className="w-4 h-4 mr-2" />
                        Download Optimized CV
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-blue-800 mb-2 flex items-center">
                        <Target className="w-5 h-5 mr-2" />
                        Get ATS Optimization & Detailed Recommendations
                      </h3>
                      <p className="text-blue-700 mb-4">
                        Our advanced AI analyzes your CV against the job description to provide comprehensive ATS
                        optimization, keyword matching, and detailed improvement suggestions with specific metrics and
                        examples.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="ai-job-description">Job Description (Required for ATS Analysis)</Label>
                          <Textarea
                            id="ai-job-description"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the complete job description here for comprehensive ATS optimization..."
                            className="min-h-[150px]"
                          />
                        </div>

                        <Button
                          onClick={getAiRecommendations}
                          disabled={!jobDescription || !parsedCvText}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Generate ATS Optimization Report
                        </Button>

                        {!parsedCvText && (
                          <p className="text-amber-600 text-sm">
                            Please upload or create your CV first before getting ATS optimization recommendations.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setActiveTab("edit")} className="flex items-center">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Edit CV
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Download Tab */}
          <TabsContent value="download" currentValue={activeTab}>
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
                <CardTitle className="flex items-center">
                  <FileDown className="w-5 h-5 mr-2" />
                  Download Your ATS-Optimized CV
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-8">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-green-900 mb-1">ATS-Optimized & Ready to Submit</h3>
                        <p className="text-green-700 text-sm">
                          Your CV has been formatted for maximum ATS compatibility with proper structure, keywords, and
                          professional formatting that both systems and recruiters will love.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 border border-gray-200 rounded-lg shadow-inner">
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold">{cvData.personalInfo.name || "Your Name"}</h1>
                      <p className="text-gray-700">{cvData.personalInfo.title || "Professional Title"}</p>
                      <p className="text-gray-600 text-sm mt-2">
                        {cvData.personalInfo.email && `${cvData.personalInfo.email} | `}
                        {cvData.personalInfo.phone && `${cvData.personalInfo.phone} | `}
                        {cvData.personalInfo.location}
                      </p>
                      {(cvData.personalInfo.linkedin || cvData.personalInfo.website) && (
                        <p className="text-gray-600 text-sm">
                          {cvData.personalInfo.linkedin && `LinkedIn: ${cvData.personalInfo.linkedin} | `}
                          {cvData.personalInfo.website && `Website: ${cvData.personalInfo.website}`}
                        </p>
                      )}
                    </div>

                    {cvData.personalInfo.summary && (
                      <div className="mb-6">
                        <p className="text-gray-800">{cvData.personalInfo.summary}</p>
                      </div>
                    )}

                    {cvData.experience.length > 0 && cvData.experience[0].title && (
                      <div className="mb-6">
                        <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">EXPERIENCE</h2>
                        {cvData.experience.map((exp) => (
                          <div key={exp.id} className="mb-4">
                            <div className="flex justify-between">
                              <h3 className="font-bold">{exp.title}</h3>
                              <span className="text-gray-600 text-sm">
                                {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                              </span>
                            </div>
                            <p className="text-gray-700 italic">
                              {exp.company}, {exp.location}
                            </p>
                            <p className="text-gray-800 whitespace-pre-line mt-1">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {cvData.education.length > 0 && cvData.education[0].degree && (
                      <div className="mb-6">
                        <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">EDUCATION</h2>
                        {cvData.education.map((edu) => (
                          <div key={edu.id} className="mb-4">
                            <div className="flex justify-between">
                              <h3 className="font-bold">{edu.degree}</h3>
                              <span className="text-gray-600 text-sm">
                                {edu.startDate} - {edu.current ? "Present" : edu.endDate}
                              </span>
                            </div>
                            <p className="text-gray-700 italic">
                              {edu.institution}, {edu.location}
                            </p>
                            {edu.description && (
                              <p className="text-gray-800 whitespace-pre-line mt-1">{edu.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {cvData.skills.length > 0 && cvData.skills[0] && (
                      <div className="mb-6">
                        <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">SKILLS</h2>
                        <div className="flex flex-wrap gap-2">
                          {cvData.skills.map((skill, index) => (
                            <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {cvData.certifications.length > 0 && cvData.certifications[0].name && (
                      <div className="mb-6">
                        <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-3">CERTIFICATIONS</h2>
                        {cvData.certifications.map((cert) => (
                          <div key={cert.id} className="mb-4">
                            <div className="flex justify-between">
                              <h3 className="font-bold">{cert.name}</h3>
                              <span className="text-gray-600 text-sm">{cert.date}</span>
                            </div>
                            <p className="text-gray-700 italic">{cert.issuer}</p>
                            {cert.description && (
                              <p className="text-gray-800 whitespace-pre-line mt-1">{cert.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border border-gray-200">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                          <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Download as Text</h3>
                        <p className="text-gray-600 mb-4">
                          Download your ATS-optimized CV as a plain text file with proper formatting for maximum
                          compatibility.
                        </p>
                        <Button onClick={downloadCV} className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Download ATS .txt
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200">
                      <CardContent className="p-6 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                          <FileText className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Download as PDF</h3>
                        <p className="text-gray-600 mb-4">
                          Download your ATS-optimized CV as a professionally formatted PDF document ready for
                          submission.
                        </p>
                        <Button
                          onClick={downloadCVAsPDF}
                          className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download ATS PDF
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("edit")} className="flex items-center">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Edit CV
                    </Button>
                    <Button
                      onClick={() => {
                        setActiveTab("upload")
                        setCvData(defaultCVData)
                        setParsedCvText("")
                        setJobDescription("")
                        setAiRecommendations("")
                      }}
                      variant="outline"
                      className="flex items-center"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Create New ATS CV
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
