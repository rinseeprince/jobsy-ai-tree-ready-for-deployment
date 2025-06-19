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
  Copy,
  X,
} from "lucide-react"

import { CVService } from "@/lib/cv-service"
import { parseResumeWithAI } from "@/lib/resume-parser"
import { CV_TEMPLATES, getTemplateById, renderTemplate, type CVData } from "@/lib/cv-templates"
import CVEditorModals from "@/components/cv-editor/cv-editor-modals"
import { CVPreview } from "@/components/cv-editor/cv-preview"
import { ApplicationsService } from "@/lib/supabase"
import { CVAnalysisButton } from "@/components/cv-analysis-button"
import { openPrintableVersion } from "@/lib/pdf-generator"

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

// Function to extract skills from text using simple pattern matching as fallback
const extractSkillsFromText = (text: string): string[] => {
  const skillKeywords = [
    // Programming languages
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "C#",
    "PHP",
    "Ruby",
    "Go",
    "Rust",
    "Swift",
    "Kotlin",
    // Web technologies
    "React",
    "Vue",
    "Angular",
    "Node.js",
    "Express",
    "Next.js",
    "HTML",
    "CSS",
    "SASS",
    "SCSS",
    // Databases
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "SQLite",
    "Oracle",
    "SQL Server",
    // Cloud & DevOps
    "AWS",
    "Azure",
    "Google Cloud",
    "Docker",
    "Kubernetes",
    "Jenkins",
    "Git",
    "GitHub",
    "GitLab",
    // Tools & Software
    "Salesforce",
    "HubSpot",
    "Slack",
    "Jira",
    "Confluence",
    "Figma",
    "Adobe",
    "Photoshop",
    "Illustrator",
    // Business skills
    "Project Management",
    "Leadership",
    "Communication",
    "Team Management",
    "Strategic Planning",
    "Data Analysis",
    "Problem Solving",
    "Customer Service",
    "Sales",
    "Marketing",
    "SEO",
    "SEM",
    // Analytics
    "Google Analytics",
    "Google Ads",
    "Facebook Ads",
    "LinkedIn Ads",
    "Excel",
    "PowerBI",
    "Tableau",
  ]

  const foundSkills: string[] = []
  const textLower = text.toLowerCase()

  skillKeywords.forEach((skill) => {
    if (textLower.includes(skill.toLowerCase())) {
      foundSkills.push(skill)
    }
  })

  // Also look for skills sections and extract from there
  const skillsSectionMatch = text.match(/(?:skills?|competencies|technologies|tools)[\s\S]*?(?:\n\n|\n[A-Z]|$)/gi)
  if (skillsSectionMatch) {
    skillsSectionMatch.forEach((section) => {
      // Extract comma-separated items
      const items = section
        .split(/[,\n•·-]/)
        .map((item) => item.trim())
        .filter(
          (item) => item.length > 2 && item.length < 30 && !item.match(/^(skills?|competencies|technologies|tools)$/i),
        )
      foundSkills.push(...items)
    })
  }

  // Remove duplicates and return
  return [...new Set(foundSkills)].slice(0, 20) // Limit to 20 skills
}

interface Recommendation {
  section: string
  recommendation: string
  impact: string
  type: string
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
  const [copySuccess, setCopySuccess] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const [showImplementModal, setShowImplementModal] = useState(false)
  const [recommendationsText, setRecommendationsText] = useState("")
  const [isImplementing, setIsImplementing] = useState(false)
  const [originalCVData, setOriginalCVData] = useState<CVData | null>(null)
  const [parsedRecommendations, setParsedRecommendations] = useState<Recommendation[]>([])
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([])
  const [showAISection, setShowAISection] = useState(false)

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
      console.log("📄 Parsed CV text:", data.text)

      const savedCV = await CVService.saveCV({
        title: file.name.replace(/\.[^/.]+$/, ""),
        file_name: file.name,
        file_size: file.size,
        parsed_content: data.text,
        raw_text: data.text,
      })

      console.log("CV saved to database:", savedCV)

      // Try AI parsing first
      const aiParsedData = await parseResumeWithAI(data.text)
      console.log("🤖 AI parsed data:", aiParsedData)

      if (aiParsedData) {
        console.log("✅ AI successfully parsed the CV")
        console.log("🔍 AI extracted skills:", aiParsedData.skills)

        // If AI didn't extract skills, try fallback method
        let finalSkills = aiParsedData.skills || []
        if (!finalSkills || finalSkills.length === 0) {
          console.log("⚠️ AI didn't extract skills, trying fallback method...")
          finalSkills = extractSkillsFromText(data.text)
          console.log("🔧 Fallback extracted skills:", finalSkills)
        }

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
          // Use final skills (AI + fallback)
          skills: finalSkills.filter((skill) => skill && skill.trim().length > 0),
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

        setSuccess(`CV "${file.name}" uploaded and parsed successfully! ${finalSkills.length} skills extracted.`)
      } else {
        console.log("⚠️ AI parsing failed, using fallback for skills only...")
        // If AI parsing completely fails, at least try to extract skills
        const fallbackSkills = extractSkillsFromText(data.text)
        console.log("🔧 Fallback skills:", fallbackSkills)

        if (fallbackSkills.length > 0) {
          setCVData((prev) => ({
            ...prev,
            skills: fallbackSkills,
          }))
          setSuccess(`CV "${file.name}" uploaded! ${fallbackSkills.length} skills extracted using pattern matching.`)
        } else {
          setSuccess(`CV "${file.name}" uploaded and saved successfully! Please add your skills manually.`)
        }
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

  // Replace the existing handleDownload function with this:
  const downloadCVAsPDF = () => {
    try {
      const printWindow = window.open("", "_blank")
      if (!printWindow) return

      // Get the template and render with proper styling
      const template = getTemplateById(selectedTemplate)
      let renderedHTML = ""

      if (template) {
        renderedHTML = renderTemplate(cvData, template)
      } else {
        // Fallback to simple rendering if template not found
        renderedHTML = renderSimpleCV(cvData)
      }

      const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <title>${cvData.personalInfo.name || "CV"}</title>
    <meta charset="utf-8">
    <style>
      @page { 
        margin: 0.5in; 
        size: A4; 
        /* Remove headers and footers */
        @top-left { content: ""; }
        @top-center { content: ""; }
        @top-right { content: ""; }
        @bottom-left { content: ""; }
        @bottom-center { content: ""; }
        @bottom-right { content: ""; }
      }
      
      @media print { 
        body { 
          margin: 0; 
          padding: 0; 
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        } 
        .no-print { display: none; }
        
        /* Force colors to print */
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
      
      body { 
        font-family: Arial, sans-serif; 
        line-height: 1.6; 
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      /* Ensure template styles are preserved and colors print */
      * { 
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      /* Force background colors to print */
      div, span, section, header, footer, article, aside, nav {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      /* Ensure gradients print */
      [style*="background"] {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    </style>
  </head>
  <body>
    <div class="no-print" style="position: fixed; top: 10px; right: 10px; background: #007bff; color: white; padding: 10px 15px; border-radius: 5px; font-size: 14px; z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
      <strong>💡 Tip:</strong> Uncheck "Headers and footers" in print options for a clean PDF
    </div>
    ${renderedHTML}
    <script>
      window.onload = function() {
        setTimeout(function() {
          window.print();
        }, 1000);
      }
    </script>
  </body>
</html>
`

      printWindow.document.write(htmlContent)
      printWindow.document.close()
      setSuccess("CV opened for PDF download! Follow the tips in the blue box for best results.")
    } catch (error) {
      console.error("Error downloading CV as PDF:", error)
      setError("Error generating PDF. Please try again.")
    }
  }

  // Add the renderSimpleCV helper function
  const renderSimpleCV = (cvData: CVData): string => {
    try {
      let html = ""

      // Personal Info
      if (cvData.personalInfo) {
        const p = cvData.personalInfo
        html += `<div class="section">
        <h1>${p.name || ""}</h1>
        <p>${p.title || ""}</p>
        <p>${p.email || ""} | ${p.phone || ""} | ${p.location || ""}</p>
        ${p.linkedin ? `<p>LinkedIn: ${p.linkedin}</p>` : ""}
        ${p.website ? `<p>Website: ${p.website}</p>` : ""}
        <p>${p.summary || ""}</p>
      </div>`
      }

      // Experience
      if (cvData.experience && cvData.experience.length > 0) {
        html += `<h2>Experience</h2>`
        cvData.experience.forEach((exp) => {
          html += `<div class="section">
          <h3>${exp.title || ""} | ${exp.company || ""}</h3>
          <p>${exp.startDate || ""} - ${exp.current ? "Present" : exp.endDate || ""} | ${exp.location || ""}</p>
          <p>${exp.description || ""}</p>
        </div>`
        })
      }

      // Education
      if (cvData.education && cvData.education.length > 0) {
        html += `<h2>Education</h2>`
        cvData.education.forEach((edu) => {
          html += `<div class="section">
          <h3>${edu.degree || ""} | ${edu.institution || ""}</h3>
          <p>${edu.startDate || ""} - ${edu.current ? "Present" : edu.endDate || ""} | ${edu.location || ""}</p>
          <p>${edu.description || ""}</p>
        </div>`
        })
      }

      // Skills
      if (cvData.skills && cvData.skills.length > 0) {
        html += `<h2>Skills</h2><p>${cvData.skills.join(", ")}</p>`
      }

      // Certifications
      if (cvData.certifications && cvData.certifications.length > 0) {
        html += `<h2>Certifications</h2>`
        cvData.certifications.forEach((cert) => {
          html += `<div class="section">
          <h3>${cert.name || ""} | ${cert.issuer || ""}</h3>
          <p>${cert.date || ""}</p>
          ${cert.description ? `<p>${cert.description}</p>` : ""}
        </div>`
        })
      }

      return html
    } catch (error) {
      console.error("Error rendering CV:", error)
      return "<p>Error rendering CV</p>"
    }
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
          cvContent: cvText,
          jobDescription,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setImprovementSuggestions(data.improvedCV)
      setSuccess("AI analysis complete! Review the suggestions below.")
    } catch (error) {
      console.error("Error improving CV:", error)
      setError("Failed to analyze CV. Please try again.")
    } finally {
      setIsImproving(false)
    }
  }

  // Add a function to handle CV updates from analysis
  const handleCVUpdateFromAnalysis = (updatedCVData: CVData) => {
    console.log("🔄 Updating CV data from analysis:", updatedCVData)
    setCVData(updatedCVData)
    setSuccess("CV updated with AI recommendations!")
  }

  // Copy recommendations to clipboard
  const handleCopyRecommendations = async () => {
    if (!improvementSuggestions) return

    try {
      // Create a clean text version of the recommendations
      const cleanText = improvementSuggestions
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .replace(/&nbsp;/g, " ") // Replace HTML entities
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .trim()

      await navigator.clipboard.writeText(cleanText)
      setIsCopied(true)
      setCopySuccess("Recommendations copied to clipboard!")

      // Reset animation state after 2 seconds
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setCopySuccess("")
      }, 3000)
    } catch (error) {
      console.error("Failed to copy:", error)
      setCopySuccess("Failed to copy recommendations")
      setTimeout(() => {
        setCopySuccess("")
      }, 3000)
    }
  }

  const handleExportJobReport = () => {
    if (!improvementSuggestions || !jobDescription) return

    try {
      // Generate comprehensive job-specific optimization report
      const reportContent = `
JOB-SPECIFIC CV OPTIMIZATION REPORT
Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

CANDIDATE INFORMATION
Name: ${cvData?.personalInfo?.name || "Not provided"}
Email: ${cvData?.personalInfo?.email || "Not provided"}
Title: ${cvData?.personalInfo?.title || "Not provided"}

EXECUTIVE SUMMARY
This job-specific CV optimization analysis was performed using advanced AI algorithms to evaluate your resume against the specific requirements of your target position. The recommendations below are tailored to maximize your chances of passing ATS screening and impressing hiring managers for this particular role.

TARGET JOB ANALYSIS
${jobDescription.substring(0, 1000)}${jobDescription.length > 1000 ? "..." : ""}

OPTIMIZATION RECOMMENDATIONS
${improvementSuggestions
  .replace(/<[^>]*>/g, "") // Remove HTML tags
  .replace(/&nbsp;/g, " ") // Replace HTML entities
  .replace(/&amp;/g, "&")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"')
  .trim()}

IMPLEMENTATION STRATEGY
1. Review each recommendation carefully and prioritize high-impact changes
2. Update your CV content to incorporate suggested keywords and phrases
3. Ensure all recommendations align with your actual experience and skills
4. Test your updated CV against ATS systems before submitting
5. Customize your cover letter to complement these CV optimizations

NEXT STEPS
1. Implement the high-priority recommendations first
2. Update your CV with job-specific keywords and phrases
3. Ensure consistency between your CV and the job requirements
4. Consider creating multiple CV versions for different types of roles
5. Track your application success rate to measure improvement

ABOUT THIS REPORT
This analysis was generated using JobsyAI's advanced job-specific optimization engine, which combines natural language processing, ATS simulation, and industry best practices to provide targeted recommendations for your specific job application.

For questions about this report or to get additional career advice, visit JobsyAI.com

Report ID: ${Date.now()}
Analysis Date: ${new Date().toISOString()}
Target Position: ${jobDescription.split("\n")[0] || "Position details in job description"}
    `.trim()

      openPrintableVersion(
        reportContent,
        `Job-Specific CV Optimization Report - ${cvData?.personalInfo?.name || "Candidate"} - ${new Date().toLocaleDateString()}`,
      )
    } catch (error) {
      console.error("Error generating job-specific report:", error)
      setErrorMessage("❌ Failed to generate report. Please try again.")
      setTimeout(() => setErrorMessage(""), 3000)
    }
  }

  // Handle showing implement modal and parsing recommendations
  const handleShowImplementModal = async () => {
    if (!recommendationsText.trim()) {
      setError("Please paste your AI recommendations first")
      return
    }

    if (recommendationsText.trim().length < 50) {
      setError("Please provide a complete AI recommendations report (minimum 50 characters)")
      return
    }

    try {
      setIsImplementing(true)
      setError("") // Clear any previous errors

      // Parse recommendations using AI
      const response = await fetch("/api/parse-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendationsText }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP ${response.status}: Failed to parse recommendations`)
      }

      const { recommendations } = responseData

      if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
        throw new Error("No valid recommendations found in the provided text")
      }

      setParsedRecommendations(recommendations)
      setSelectedRecommendations(recommendations.map((_: Recommendation, index: number) => index.toString()))
      setShowImplementModal(true)
      setSuccess(`Successfully parsed ${recommendations.length} recommendations!`)
    } catch (err) {
      console.error("Error parsing recommendations:", err)
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"

      // Provide helpful error messages based on the error type
      if (errorMessage.includes("API key")) {
        setError("AI parsing service is temporarily unavailable. The system used fallback parsing instead.")
      } else if (errorMessage.includes("format")) {
        setError(
          "Invalid recommendations format. Please paste a complete AI recommendations report that includes specific, actionable suggestions.",
        )
      } else {
        setError(
          `Failed to parse recommendations: ${errorMessage}. Please try pasting a different recommendations report.`,
        )
      }
    } finally {
      setIsImplementing(false)
    }
  }

  // Handle implementing selected recommendations
  const handleImplementRecommendations = async (applyAll = false) => {
    if (!originalCVData) {
      setOriginalCVData(cvData) // Backup original data
    }

    setIsImplementing(true)
    setError("")

    try {
      const recommendationsToApply = applyAll
        ? parsedRecommendations
        : parsedRecommendations.filter((_, index) => selectedRecommendations.includes(index.toString()))

      const response = await fetch("/api/implement-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentCV: cvData,
          recommendations: recommendationsToApply,
          originalRecommendationsText: recommendationsText,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to implement recommendations")
      }

      const { updatedCV } = await response.json()
      setCVData(updatedCV)
      setShowImplementModal(false)
      setSuccess("AI recommendations implemented successfully! Review your updated CV and save when ready.")
    } catch (error) {
      console.error("Error implementing recommendations:", error)
      setError("Failed to implement recommendations. Please try again.")
    } finally {
      setIsImplementing(false)
    }
  }

  // Handle reverting to original CV
  const handleRevertToOriginal = () => {
    if (originalCVData) {
      setCVData(originalCVData)
      setOriginalCVData(null)
      setSuccess("CV reverted to original version")
    }
  }

  // Handle recommendation selection
  const handleRecommendationToggle = (index: string) => {
    setSelectedRecommendations((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
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
        return cvData.skills.length > 0
          ? `${cvData.skills.length} skills: ${cvData.skills.slice(0, 3).join(", ")}${cvData.skills.length > 3 ? "..." : ""}`
          : "Add your skills"
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

        {copySuccess && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <Copy className="w-5 h-5 text-blue-600" />
            <span className="text-blue-800">{copySuccess}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{errorMessage}</span>
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
                data-tab="optimize"
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
                      <CVAnalysisButton
                        cvData={cvData}
                        className="w-full h-10"
                        variant="outline"
                        onCVUpdate={handleCVUpdateFromAnalysis}
                      />
                      {/* In the Actions section, change the Download button onClick from handleDownload to downloadCVAsPDF: */}
                      <Button onClick={downloadCVAsPDF} className="w-full" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                      {/* AI Implementation Section */}
                      <div className="border-t pt-4 mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Brain className="w-4 h-4 text-purple-600" />
                          AI Implementation
                          <span className="ml-auto px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            Pro
                          </span>
                        </h4>
                        <div className="space-y-3">
                          <Button
                            onClick={() => setShowAISection(!showAISection)}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                            variant="outline"
                          >
                            <Wand2 className="w-4 h-4 mr-2" />
                            {showAISection ? "Hide" : "Implement AI Recommendations"}
                          </Button>

                          {showAISection && (
                            <div className="space-y-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <div>
                                <Label
                                  htmlFor="recommendations-input"
                                  className="text-sm font-medium text-gray-700 mb-2 block"
                                >
                                  Paste AI Recommendations Report
                                </Label>
                                <Textarea
                                  id="recommendations-input"
                                  value={recommendationsText}
                                  onChange={(e) => setRecommendationsText(e.target.value)}
                                  placeholder="Paste your complete AI recommendations report here...

Example format:
• Add quantifiable metrics to your experience section
• Include relevant keywords like 'project management' and 'team leadership'
• Update your summary to highlight key achievements
• Consider adding certifications section"
                                  rows={8}
                                  className="border-2 border-purple-200 focus:border-purple-400 rounded-lg text-sm"
                                />
                              </div>

                              <div className="bg-purple-100 border border-purple-200 rounded-lg p-3">
                                <p className="text-purple-800 text-xs">
                                  <strong>💡 How to use:</strong> Run &quot;AI Optimize&quot; → Copy recommendations →
                                  Paste above → Click &quot;Parse & Implement&quot;
                                </p>
                                <p className="text-purple-700 text-xs mt-1">
                                  <strong>📝 Tip:</strong> Make sure to paste the complete recommendations text with
                                  specific suggestions, not just general advice.
                                </p>
                              </div>

                              <Button
                                onClick={handleShowImplementModal}
                                disabled={
                                  isImplementing ||
                                  !recommendationsText.trim() ||
                                  recommendationsText.trim().length < 50
                                }
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                                size="sm"
                              >
                                {isImplementing ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <Brain className="w-4 h-4 mr-2" />
                                    Parse & Implement ({recommendationsText.trim().length} chars)
                                  </>
                                )}
                              </Button>
                            </div>
                          )}

                          {originalCVData && (
                            <Button
                              onClick={handleRevertToOriginal}
                              className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                              variant="outline"
                              size="sm"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Revert to Original
                            </Button>
                          )}
                        </div>
                      </div>
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
                  Job-Specific CV Optimization
                </h2>
                <p className="text-gray-600 mb-4">
                  Get targeted recommendations to maximize your chances for specific job applications
                </p>
                <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span>ATS Optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>Keyword Matching</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-purple-600" />
                    <span>Impact Enhancement</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 text-green-800 font-medium">
                    <Rocket className="w-5 h-5" />
                    <span>Increase interview chances by up to 40% with job-specific optimization</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Job Description Input */}
                <div className="border rounded-lg p-6 shadow-md bg-white">
                  <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-blue-600" />
                    Target Job Description
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="job-description" className="mb-1 block font-medium">
                        Paste the complete job posting you are applying for
                      </Label>
                      <p className="text-sm text-gray-600 mb-3">
                        Include job title, requirements, responsibilities, and company information for best results
                      </p>
                      <Textarea
                        id="job-description"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the complete job description here..."
                        rows={12}
                        className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <Button
                      onClick={handleImproveCV}
                      disabled={isImproving || !jobDescription.trim()}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6 shadow-lg"
                      size="lg"
                    >
                      {isImproving ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing & Optimizing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Get Job-Specific Recommendations
                        </>
                      )}
                    </Button>

                    {/* Quick Check Upgrade Prompt */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-900 mb-1">💡 Pro Tip</p>
                          <p className="text-blue-800">
                            Already ran a Quick CV Check? Great! Now optimize your improved CV for this specific job to
                            maximize your application success.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Suggestions */}
                <div className="border rounded-lg p-6 shadow-md bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h3 className="text-lg font-medium flex items-center gap-2 min-w-0">
                      <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="break-words">Job-Specific Recommendations</span>
                    </h3>
                    {improvementSuggestions && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          onClick={handleExportJobReport}
                          size="sm"
                          className="flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700 text-white border-0 px-3 py-2 whitespace-nowrap"
                        >
                          <Download className="w-4 h-4" />
                          Export Report
                        </Button>
                        <Button
                          onClick={handleCopyRecommendations}
                          variant="outline"
                          size="sm"
                          className={`flex items-center gap-2 text-sm transition-all duration-200 px-3 py-2 whitespace-nowrap ${
                            isCopied ? "bg-green-50 border-green-300 text-green-700 scale-95" : "hover:bg-gray-50"
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                  {improvementSuggestions ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-800">Job-Specific Analysis Complete</span>
                        </div>
                        <p className="text-green-700 text-sm">
                          Your CV has been analyzed against this specific jobs requirements. These recommendations are
                          tailored to help you pass ATS screening and impress hiring managers.
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
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mx-auto flex items-center justify-center mb-4">
                        <Target className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for Job-Specific Optimization</h3>
                      <p className="text-gray-600 mb-6">
                        Add a job description to get personalized recommendations that match the specific requirements
                        and keywords employers are looking for.
                      </p>
                      <div className="grid grid-cols-1 gap-4 text-sm">
                        <div className="flex items-center justify-center gap-2 text-blue-600 bg-blue-50 rounded-lg p-3">
                          <Shield className="w-4 h-4" />
                          <span>ATS Keyword Optimization</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 rounded-lg p-3">
                          <Target className="w-4 h-4" />
                          <span>Role-Specific Tailoring</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-purple-600 bg-purple-50 rounded-lg p-3">
                          <TrendingUp className="w-4 h-4" />
                          <span>Impact Enhancement</span>
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
        {/* AI Implementation Modal */}
        {showImplementModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center">
                    <Brain className="w-6 h-6 mr-3" />
                    Implement AI Recommendations
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowImplementModal(false)}
                    className="text-white hover:bg-white/20 p-2 rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-purple-100 mt-2">Select which recommendations to apply to your CV</p>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {parsedRecommendations.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-600">
                        {selectedRecommendations.length} of {parsedRecommendations.length} recommendations selected
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedRecommendations([])}>
                          Select None
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRecommendations(parsedRecommendations.map((_, i) => i.toString()))}
                        >
                          Select All
                        </Button>
                      </div>
                    </div>

                    {parsedRecommendations.map((rec, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id={`rec-${index}`}
                            checked={selectedRecommendations.includes(index.toString())}
                            onChange={() => handleRecommendationToggle(index.toString())}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{rec.section}</h4>
                            <p className="text-sm text-gray-700 mb-2">{rec.recommendation}</p>
                            {rec.impact && (
                              <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Impact: {rec.impact}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      No recommendations found. Please paste a valid AI recommendations report.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t p-6">
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowImplementModal(false)} disabled={isImplementing}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleImplementRecommendations(false)}
                    disabled={isImplementing || selectedRecommendations.length === 0}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isImplementing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Implementing...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Apply Selected ({selectedRecommendations.length})
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleImplementRecommendations(true)}
                    disabled={isImplementing}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isImplementing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Implementing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Apply All
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
