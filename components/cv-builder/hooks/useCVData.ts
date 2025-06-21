import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { CVService } from "@/lib/cv-service"
import { parseResumeWithAI } from "@/lib/resume-parser"
import { ApplicationsService } from "@/lib/supabase"
import { type CVData } from "@/lib/cv-templates"

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

export const useCVData = () => {
  const searchParams = useSearchParams()
  const cvId = searchParams.get("cv")

  const [cvData, setCVData] = useState<CVData>(defaultCVData)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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

  return {
    cvData,
    setCVData,
    isUploading,
    isLoading,
    error,
    setError,
    success,
    setSuccess,
    updatePersonalInfo,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    updateSkills,
    addCertification,
    updateCertification,
    removeCertification,
    handlePhotoUpload,
    removePhoto,
    handleFileUpload,
    generateCVText,
  }
} 