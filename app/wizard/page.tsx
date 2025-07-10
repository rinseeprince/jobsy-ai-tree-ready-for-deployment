"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Upload,
  Wand2,
  Eye,
  Save,
  CheckCircle,
  Loader2,
  Plus,
  Palette,
  Download,
  Briefcase,
  Settings,
  Sparkles,
  Mail,
  ClipboardCheck,
} from "lucide-react"
import { ApplicationsService, type SavedCV } from "@/lib/supabase"
import { generateCoverLetter, improveCv } from "@/lib/ai-service"
import { useToast } from "@/components/ui/use-toast"
import { CV_TEMPLATES, renderTemplate, getTemplateById, type CVData } from "@/lib/cv-templates"
import { parseResumeWithAI } from "@/lib/resume-parser"

interface WizardData {
  jobDescription: string
  jobUrl?: string
  selectedCV?: SavedCV
  selectedTemplate: string
  optimizedCVData?: CVData
  renderedCV?: string
  coverLetter?: string
  applicationName: string
  status: string
}

const STEPS = [
  {
    id: 1,
    title: "Job Description",
    description: "Paste or upload the job posting",
    icon: Briefcase,
    color: "from-blue-500 to-blue-600",
  },
  {
    id: 2,
    title: "Select CV & Template",
    description: "Choose your CV and design template",
    icon: Settings,
    color: "from-purple-500 to-purple-600",
  },
  {
    id: 3,
    title: "Optimize CV",
    description: "Generate AI-optimized CV with template",
    icon: Sparkles,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    id: 4,
    title: "Cover Letter",
    description: "Generate personalized cover letter",
    icon: Mail,
    color: "from-orange-500 to-orange-600",
  },
  {
    id: 5,
    title: "Review & Save",
    description: "Finalize your application",
    icon: ClipboardCheck,
    color: "from-teal-500 to-teal-600",
  },
]

const APPLICATION_STATUSES = [
  { value: "applied", label: "Applied" },
  { value: "phone_screen", label: "Phone Screen" },
  { value: "first_interview", label: "First Interview" },
  { value: "second_interview", label: "Second Interview" },
  { value: "offer", label: "Offer Received" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
]

export default function ApplicationWizard() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [savedCVs, setSavedCVs] = useState<SavedCV[]>([])
  const [wizardData, setWizardData] = useState<WizardData>({
    jobDescription: "",
    jobUrl: "",
    selectedCV: undefined,
    selectedTemplate: "ats-optimized", // Default template
    optimizedCVData: undefined,
    renderedCV: "",
    coverLetter: "",
    applicationName: "",
    status: "applied",
  })

  // Load saved CVs on component mount
  useEffect(() => {
    const loadSavedCVs = async () => {
      try {
        const cvs = await ApplicationsService.getUserSavedCVs()
        setSavedCVs(cvs)
      } catch (error) {
        console.error("Error loading saved CVs:", error)
      }
    }
    loadSavedCVs()
  }, [])

  // Debounced auto-save to localStorage to prevent re-renders on every keystroke
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem("wizard-draft", JSON.stringify(wizardData))
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [wizardData])

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem("wizard-draft")
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft)
        setWizardData(parsedDraft)
      } catch (error) {
        console.error("Error loading draft:", error)
      }
    }
  }, [])

  // Use useCallback to prevent unnecessary re-renders that cause focus loss
  const updateWizardData = useCallback((updates: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }))
  }, [])

  const nextStep = useCallback(() => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }, [currentStep])

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const handleFileUpload = useCallback(
    async (file: File) => {
      setIsLoading(true)
      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/cv-parser", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Failed to parse file")
        }

        const data = await response.json()

        if (currentStep === 1) {
          // Job description upload
          updateWizardData({ jobDescription: data.text })
        } else if (currentStep === 2) {
          // CV upload - parse with AI and create SavedCV
          try {
            const aiParsedData = await parseResumeWithAI(data.text)

            if (aiParsedData) {
              const cvData: CVData = {
                personalInfo: {
                  name: `${aiParsedData.personal.firstName || ""} ${aiParsedData.personal.lastName || ""}`.trim(),
                  title: aiParsedData.personal.jobTitle || "",
                  email: aiParsedData.personal.email || "",
                  phone: aiParsedData.personal.phone || "",
                  location: aiParsedData.personal.location || "",
                  summary: aiParsedData.personal.summary || "",
                  linkedin: aiParsedData.personal.linkedin || "",
                  website: aiParsedData.personal.website || "",
                  profilePhoto: "",
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
                    : [
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
                    : [
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
                    : [
                        {
                          id: "cert-1",
                          name: "",
                          issuer: "",
                          date: "",
                          description: "",
                        },
                      ],
              }

              const newCV: SavedCV = {
                id: "temp_" + Date.now(),
                title: file.name.replace(/\.[^/.]+$/, ""),
                cv_data: cvData,
                template_id: wizardData.selectedTemplate,
                word_count: calculateWordCount(cvData),
                status: "draft",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user_id: "",
              }

              // Save the CV to the database
              const savedCV = await ApplicationsService.saveCVData({
                title: newCV.title,
                cv_data: newCV.cv_data,
                template_id: newCV.template_id,
                status: newCV.status,
              })

              // Update the selectedCV state with the newly saved CV
              updateWizardData({ selectedCV: savedCV })

              // Update the savedCVs list
              setSavedCVs((prevCVs) => [...prevCVs, savedCV])

              toast({
                title: "CV uploaded and parsed successfully",
                description: "Your CV has been processed and is ready for optimization.",
              })
            }
          } catch (error) {
            console.error("Error processing CV:", error)
            toast({
              title: "CV processing failed",
              description: "Failed to parse the CV. Please try again.",
              variant: "destructive",
            })
          }
        }

        toast({
          title: "File uploaded successfully",
          description: "Content has been extracted and processed.",
        })
      } catch (error) {
        console.error("Error uploading file:", error)
        toast({
          title: "Upload failed",
          description: "Please try again or paste the content manually.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [currentStep, updateWizardData, wizardData.selectedTemplate, toast],
  )

  const optimizeCVWithAI = useCallback(async () => {
    if (!wizardData.selectedCV || !wizardData.selectedCV.cv_data) {
      toast({
        title: "Missing CV data",
        description: "Please select a CV with valid data.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Generate current CV text for AI analysis
      const currentCVText = generateCVText(wizardData.selectedCV.cv_data)

      // Get AI improvements using the same logic as CV Builder
      const improvements = await improveCv(wizardData.jobDescription, currentCVText)

      // Parse the improvements to extract structured data
      const parseResponse = await fetch("/api/parse-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendationsText: improvements }),
      })

      if (!parseResponse.ok) {
        throw new Error("Failed to parse recommendations")
      }

      const parseData = await parseResponse.json()

      // Implement the recommendations to get optimized CV data
      const implementResponse = await fetch("/api/implement-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentCV: wizardData.selectedCV.cv_data,
          recommendations: parseData.recommendations,
          originalRecommendationsText: improvements,
        }),
      })

      if (!implementResponse.ok) {
        throw new Error("Failed to implement recommendations")
      }

      const implementData = await implementResponse.json()
      const optimizedCVData = implementData.updatedCV

      // Get selected template
      const selectedTemplate = CV_TEMPLATES.find((t) => t.id === wizardData.selectedTemplate) || CV_TEMPLATES[0]

      // Render the optimized CV with the selected template
      const renderedCV = renderTemplate(optimizedCVData, selectedTemplate)

      updateWizardData({
        optimizedCVData,
        renderedCV,
      })

      toast({
        title: "CV optimized successfully",
        description: "Your CV has been enhanced and formatted with the selected template.",
      })
    } catch (error) {
      console.error("Error optimizing CV:", error)
      toast({
        title: "Optimization failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [wizardData.selectedCV, wizardData.jobDescription, wizardData.selectedTemplate, updateWizardData, toast])

  const generateCoverLetterContent = useCallback(async () => {
    if (!wizardData.selectedCV || !wizardData.selectedCV.cv_data) {
      toast({
        title: "Missing CV data",
        description: "Please select a CV with valid data.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const cvText = generateCVText(wizardData.optimizedCVData || wizardData.selectedCV.cv_data)
      const rawCoverLetter = await generateCoverLetter(wizardData.jobDescription, cvText)

      // Clean up the cover letter by removing unwanted placeholders and adding current date
      const cleanedCoverLetter = cleanupCoverLetter(rawCoverLetter)

      updateWizardData({ coverLetter: cleanedCoverLetter })

      toast({
        title: "Cover letter generated",
        description: "Your personalized cover letter is ready.",
      })
    } catch (error) {
      console.error("Error generating cover letter:", error)
      toast({
        title: "Generation failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [wizardData.selectedCV, wizardData.optimizedCVData, wizardData.jobDescription, updateWizardData, toast])

  const cleanupCoverLetter = useCallback((coverLetter: string): string => {
    // Get current date
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // Remove common placeholder patterns and duplicate dates
    let cleaned = coverLetter
      // Remove hiring manager placeholders
      .replace(/Hiring Manager\s*\n/gi, "")
      .replace(/\[Company Name\]\s*\n/gi, "")
      .replace(/\[Company Address\]\s*\n/gi, "")
      .replace(/\[City, Postcode\]\s*\n/gi, "")
      .replace(/London, UK\s*\n/gi, "")
      // Remove ALL date patterns first
      .replace(/\[Date\]/gi, "")
      .replace(/Date:\s*\[.*?\]/gi, "")
      // Remove any existing date patterns (including the current date format)
      .replace(/January \d{1,2}, \d{4}/gi, "")
      .replace(/February \d{1,2}, \d{4}/gi, "")
      .replace(/March \d{1,2}, \d{4}/gi, "")
      .replace(/April \d{1,2}, \d{4}/gi, "")
      .replace(/May \d{1,2}, \d{4}/gi, "")
      .replace(/June \d{1,2}, \d{4}/gi, "")
      .replace(/July \d{1,2}, \d{4}/gi, "")
      .replace(/August \d{1,2}, \d{4}/gi, "")
      .replace(/September \d{1,2}, \d{4}/gi, "")
      .replace(/October \d{1,2}, \d{4}/gi, "")
      .replace(/November \d{1,2}, \d{4}/gi, "")
      .replace(/December \d{1,2}, \d{4}/gi, "")
      // Clean up extra whitespace
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .trim()

    // Add the date at the beginning only
    cleaned = `${currentDate}\n\n${cleaned}`

    return cleaned
  }, [])

  const saveApplication = useCallback(async () => {
    if (!wizardData.selectedCV || !wizardData.jobDescription || !wizardData.coverLetter || !wizardData.renderedCV) {
      toast({
        title: "Missing information",
        description: "Please complete all steps before saving.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const jobDetails = ApplicationsService.extractJobDetails(wizardData.jobDescription)

      await ApplicationsService.saveApplication({
        job_title: jobDetails.job_title,
        company_name: jobDetails.company_name,
        job_posting: wizardData.jobDescription,
        cv_content: wizardData.renderedCV, // Save the formatted, templated CV
        cover_letter: wizardData.coverLetter,
        cv_recommendations: wizardData.renderedCV,
        location: jobDetails.location,
        salary_range: jobDetails.salary_range,
        job_url: wizardData.jobUrl,
      })

      // Clear draft
      localStorage.removeItem("wizard-draft")

      toast({
        title: "Application saved successfully!",
        description: "Your complete application has been added to your dashboard.",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving application:", error)
      toast({
        title: "Save failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [wizardData, toast, router])

  // CV PDF Download - Using the same logic as CV Builder
  const downloadCVAsPDF = useCallback(() => {
    try {
      const cvData = wizardData.optimizedCVData || wizardData.selectedCV?.cv_data
      if (!cvData) {
        toast({
          title: "Missing CV data",
          description: "Please ensure the CV is generated.",
          variant: "destructive",
        })
        return
      }

      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        toast({
          title: "Download failed",
          description: "Please check your popup blocker settings.",
          variant: "destructive",
        })
        return
      }

      // Get the template and render with proper styling
      const template = getTemplateById(wizardData.selectedTemplate)
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
        }, 500);
      };
    </script>
  </body>
</html>`

      printWindow.document.write(htmlContent)
      printWindow.document.close()

      toast({
        title: "CV download ready",
        description: "Your optimized CV is ready for download as PDF.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Download failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    }
  }, [wizardData, toast])

  // Cover Letter PDF Download - Fixed with proper styling
  const downloadCoverLetterAsPDF = useCallback(() => {
    try {
      if (!wizardData.coverLetter) {
        toast({
          title: "Missing cover letter",
          description: "Please ensure the cover letter is generated.",
          variant: "destructive",
        })
        return
      }

      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        toast({
          title: "Download failed",
          description: "Please check your popup blocker settings.",
          variant: "destructive",
        })
        return
      }

      const personalInfo = wizardData.optimizedCVData?.personalInfo || wizardData.selectedCV?.cv_data?.personalInfo
      const fileName = `${personalInfo?.name || "Cover_Letter"}_Cover_Letter`

      const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <title>${fileName}</title>
    <meta charset="utf-8">
    <style>
      @page { 
        margin: 1in; 
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
      }
      
      body { 
        font-family: Calibri, Arial, sans-serif; 
        font-size: 12pt; 
        line-height: 1.3; 
        color: #000; 
        max-width: 8.5in; 
        margin: 0 auto; 
        padding: 0; 
        background: white;
      }
      
      .content { 
        white-space: pre-wrap; 
        text-align: left; 
        font-family: inherit; 
        margin: 0; 
        padding: 0;
        line-height: 1.3;
      }
    </style>
  </head>
  <body>
    <div class="no-print" style="position: fixed; top: 10px; right: 10px; background: #007bff; color: white; padding: 10px 15px; border-radius: 5px; font-size: 14px; z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
      <strong>💡 Tip:</strong> Uncheck "Headers and footers" in print options for a clean PDF
    </div>
    <div class="content">${wizardData.coverLetter}</div>
    <script>
      window.onload = function() {
        setTimeout(function() {
          window.print();
        }, 500);
      };
    </script>
  </body>
</html>`

      printWindow.document.write(htmlContent)
      printWindow.document.close()

      toast({
        title: "Cover letter download ready",
        description: "Your cover letter is ready for download as PDF.",
      })
    } catch (error) {
      console.error("Error generating cover letter PDF:", error)
      toast({
        title: "Download failed",
        description: "Failed to generate cover letter PDF. Please try again.",
        variant: "destructive",
      })
    }
  }, [wizardData, toast])

  // Download both files
  const handleDownloadBoth = useCallback(() => {
    try {
      downloadCVAsPDF()
      // Small delay to ensure first download window opens properly
      setTimeout(() => {
        downloadCoverLetterAsPDF()
      }, 1000)
    } catch (error) {
      console.error("Error downloading files:", error)
      toast({
        title: "Download failed",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }, [downloadCVAsPDF, downloadCoverLetterAsPDF, toast])

  // Simple CV rendering fallback
  const renderSimpleCV = useCallback((cvData: CVData): string => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <header style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">${cvData.personalInfo?.name || "Your Name"}</h1>
          <p style="color: #7f8c8d; margin: 5px 0; font-size: 18px;">${cvData.personalInfo?.title || "Professional Title"}</p>
          <p style="color: #7f8c8d; margin: 5px 0;">${cvData.personalInfo?.email || "email@example.com"}</p>
          <p style="color: #7f8c8d; margin: 5px 0;">${cvData.personalInfo?.phone || "Phone Number"}</p>
        </header>
        
        ${
          cvData.personalInfo?.summary
            ? `
        <section style="margin-bottom: 25px;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;">Professional Summary</h2>
          <p style="line-height: 1.6;">${cvData.personalInfo.summary}</p>
        </section>
        `
            : ""
        }
        
        ${
          cvData.experience && cvData.experience.length > 0
            ? `
        <section style="margin-bottom: 25px;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;">Professional Experience</h2>
          ${cvData.experience
            .map(
              (exp) => `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #34495e; margin: 0;">${exp.title || ""}</h3>
              <p style="color: #7f8c8d; margin: 5px 0; font-weight: bold;">${exp.company || ""} | ${exp.startDate || ""} - ${exp.endDate || "Present"}</p>
              <p style="line-height: 1.6;">${exp.description || ""}</p>
            </div>
          `,
            )
            .join("")}
        </section>
        `
            : ""
        }
        
        ${
          cvData.education && cvData.education.length > 0
            ? `
        <section style="margin-bottom: 25px;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;">Education</h2>
          ${cvData.education
            .map(
              (edu) => `
            <div style="margin-bottom: 15px;">
              <h3 style="color: #34495e; margin: 0;">${edu.degree || ""}</h3>
              <p style="color: #7f8c8d; margin: 5px 0;">${edu.institution || ""} | ${edu.startDate || ""} - ${edu.endDate || "Present"}</p>
            </div>
          `,
            )
            .join("")}
        </section>
        `
            : ""
        }
        
        ${
          cvData.skills && cvData.skills.length > 0
            ? `
        <section style="margin-bottom: 25px;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 5px;">Skills</h2>
          <p style="line-height: 1.6;">${cvData.skills.join(", ")}</p>
        </section>
        `
            : ""
        }
      </div>
    `
  }, [])

  // Helper functions
  const generateCVText = useCallback((cvData: CVData): string => {
    if (!cvData) return "No CV data available."

    let text = ""
    try {
      const { personalInfo, experience, education, skills, certifications } = cvData

      text += `${personalInfo.name || ""}\n${personalInfo.title || ""}\n${personalInfo.email || ""} | ${personalInfo.phone || ""} | ${personalInfo.location || ""}\n`

      if (personalInfo.linkedin) text += `LinkedIn: ${personalInfo.linkedin}\n`
      if (personalInfo.website) text += `Website: ${personalInfo.website}\n`

      text += `\n${personalInfo.summary || ""}\n\n`

      text += "EXPERIENCE\n"
      experience.forEach((exp) => {
        text += `${exp.title || ""} | ${exp.company || ""} | ${exp.location || ""}\n`
        text += `${exp.startDate || ""} - ${exp.current ? "Present" : exp.endDate || ""}\n`
        text += `${exp.description || ""}\n\n`
      })

      text += "EDUCATION\n"
      education.forEach((edu) => {
        text += `${edu.degree || ""} | ${edu.institution || ""} | ${edu.location || ""}\n`
        text += `${edu.startDate || ""} - ${edu.current ? "Present" : edu.endDate || ""}\n`
        text += `${edu.description || ""}\n\n`
      })

      text += "SKILLS\n"
      text += (skills || []).join(", ") + "\n\n"

      text += "CERTIFICATIONS\n"
      certifications.forEach((cert) => {
        text += `${cert.name || ""} | ${cert.issuer || ""} | ${cert.date || ""}\n`
        text += `${cert.description || ""}\n\n`
      })
    } catch (error) {
      console.error("Error generating CV text:", error)
      return "Error: Could not generate CV text due to data issues."
    }

    return text
  }, [])

  const calculateWordCount = useCallback((cvData: CVData): number => {
    let wordCount = 0

    if (cvData.personalInfo?.summary) {
      wordCount += cvData.personalInfo.summary.split(/\s+/).length
    }

    cvData.experience?.forEach((exp) => {
      if (exp.description) {
        wordCount += exp.description.split(/\s+/).length
      }
    })

    cvData.education?.forEach((edu) => {
      if (edu.description) {
        wordCount += edu.description.split(/\s+/).length
      }
    })

    cvData.certifications?.forEach((cert) => {
      if (cert.description) {
        wordCount += cert.description.split(/\s+/).length
      }
    })

    wordCount += cvData.skills?.length || 0

    return wordCount
  }, [])

  // Memoize step components to prevent unnecessary re-renders
  const Step1JobDescription = useMemo(
    () => (
      <div className="space-y-6">
        <div>
          <Label htmlFor="job-description" className="text-lg font-semibold text-gray-900">
            Job Description *
          </Label>
          <p className="text-sm text-gray-600 mb-4">
            Paste the complete job posting including requirements, responsibilities, and company information.
          </p>
          <Textarea
            id="job-description"
            placeholder="Paste the job description here..."
            value={wizardData.jobDescription}
            onChange={(e) => updateWizardData({ jobDescription: e.target.value })}
            rows={12}
            className="min-h-[300px] border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="job-url" className="text-sm font-medium text-gray-700">
              Job URL (Optional)
            </Label>
            <Input
              id="job-url"
              type="url"
              placeholder="https://company.com/jobs/123"
              value={wizardData.jobUrl || ""}
              onChange={(e) => updateWizardData({ jobUrl: e.target.value })}
              className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">Or Upload Job Posting</Label>
            <div className="mt-2">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                }}
                className="hidden"
                id="job-file-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("job-file-upload")?.click()}
                disabled={isLoading}
                className="w-full shadow-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Upload File
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={nextStep}
            disabled={!wizardData.jobDescription.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2.5"
          >
            Next Step
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    ),
    [wizardData.jobDescription, wizardData.jobUrl, updateWizardData, handleFileUpload, isLoading, nextStep],
  )

  const Step2SelectCVAndTemplate = useMemo(
    () => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Select Your CV & Template</h3>
          <p className="text-sm text-gray-600 mb-6">
            Choose an existing CV and select a professional template for your optimized application.
          </p>
        </div>

        {/* CV Selection */}
        <div className="mb-8">
          <h4 className="font-semibold mb-4 text-gray-800">Choose Your CV</h4>
          {savedCVs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {savedCVs.map((cv) => (
                <Card
                  key={cv.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg border ${
                    wizardData.selectedCV?.id === cv.id
                      ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200 shadow-md"
                      : "hover:bg-gray-50 border-gray-200 shadow-sm hover:border-gray-300"
                  }`}
                  onClick={() => updateWizardData({ selectedCV: cv })}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1 text-gray-900">{cv.title}</h4>
                        <p className="text-xs text-gray-500">Updated {new Date(cv.updated_at).toLocaleDateString()}</p>
                      </div>
                      {wizardData.selectedCV?.id === cv.id && <CheckCircle className="w-5 h-5 text-blue-500" />}
                    </div>
                    <div className="text-xs text-gray-600">
                      {cv.word_count} words • {cv.status}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 mb-6">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No saved CVs found. Upload a new CV to continue.</p>
            </div>
          )}

          <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors mb-8 shadow-sm">
            <CardContent className="p-6 text-center">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                }}
                className="hidden"
                id="cv-file-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("cv-file-upload")?.click()}
                disabled={isLoading}
                className="mb-2 shadow-sm border-gray-300 hover:bg-gray-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Upload New CV
              </Button>
              <p className="text-sm text-gray-500">Supports PDF, DOC, DOCX files</p>
            </CardContent>
          </Card>
        </div>

        {/* Template Selection */}
        <div>
          <h4 className="font-semibold mb-4 flex items-center text-gray-800">
            <Palette className="w-5 h-5 mr-2" />
            Choose Template Style
          </h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CV_TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg border ${
                  wizardData.selectedTemplate === template.id
                    ? "ring-2 ring-purple-500 bg-purple-50 border-purple-200 shadow-md"
                    : "hover:bg-gray-50 border-gray-200 shadow-sm hover:border-gray-300"
                }`}
                onClick={() => updateWizardData({ selectedTemplate: template.id })}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1 text-gray-900">{template.name}</h4>
                      <p className="text-xs text-gray-500 mb-2">{template.description}</p>
                    </div>
                    {wizardData.selectedTemplate === template.id && <CheckCircle className="w-5 h-5 text-purple-500" />}
                  </div>

                  {/* Template Preview */}
                  <div className="bg-gray-50 rounded-lg p-2 mb-3 h-32 overflow-hidden relative border">
                    <div className="text-xs text-gray-600 text-center pt-12">Template Preview</div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        template.category === "ats-optimized"
                          ? "bg-green-100 text-green-800"
                          : template.category === "professional"
                            ? "bg-blue-100 text-blue-800"
                            : template.category === "modern"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {template.category}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={prevStep}
            className="shadow-sm border-gray-300 hover:bg-gray-50 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={nextStep}
            disabled={!wizardData.selectedCV || !wizardData.selectedTemplate}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2.5"
          >
            Continue with Selection
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    ),
    [
      savedCVs,
      wizardData.selectedCV,
      wizardData.selectedTemplate,
      updateWizardData,
      handleFileUpload,
      isLoading,
      prevStep,
      nextStep,
    ],
  )

  const Step3OptimizeCV = useMemo(
    () => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Optimize Your CV</h3>
          <p className="text-sm text-gray-600 mb-6">
            Generate an AI-optimized CV formatted with your selected template.
          </p>
        </div>

        {!wizardData.renderedCV ? (
          <Card className="shadow-lg border-gray-200">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Wand2 className="w-12 h-12 text-blue-600" />
                </div>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900">Ready to Optimize</h4>
              <p className="text-gray-600 mb-4">
                Our AI will analyze the job posting and optimize your CV content, then format it with the{" "}
                <strong className="text-blue-600">
                  {CV_TEMPLATES.find((t) => t.id === wizardData.selectedTemplate)?.name}
                </strong>{" "}
                template.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
                <div className="text-sm text-blue-800">
                  <strong>Selected CV:</strong> {wizardData.selectedCV?.title}
                  <br />
                  <strong>Template:</strong> {CV_TEMPLATES.find((t) => t.id === wizardData.selectedTemplate)?.name}
                </div>
              </div>
              <Button
                onClick={optimizeCVWithAI}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Optimizing CV...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Optimize & Format CV
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card className="shadow-lg border-gray-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                <CardTitle className="flex items-center text-gray-900">
                  <Eye className="w-5 h-5 mr-2" />
                  Your Optimized CV Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-white border rounded-lg p-6 max-h-96 overflow-y-auto shadow-inner border-gray-200">
                  <div className="text-sm" dangerouslySetInnerHTML={{ __html: wizardData.renderedCV }} />
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={optimizeCVWithAI}
                    disabled={isLoading}
                    className="shadow-sm border-gray-300 hover:bg-gray-50 bg-transparent"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Re-optimize
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Template selection change
                      setCurrentStep(2)
                    }}
                    className="shadow-sm border-gray-300 hover:bg-gray-50"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Change Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={prevStep}
            className="shadow-sm border-gray-300 hover:bg-gray-50 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={nextStep}
            disabled={!wizardData.renderedCV}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2.5"
          >
            Continue to Cover Letter
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    ),
    [
      wizardData.renderedCV,
      wizardData.selectedCV,
      wizardData.selectedTemplate,
      optimizeCVWithAI,
      isLoading,
      prevStep,
      nextStep,
    ],
  )

  const Step4CoverLetter = useMemo(
    () => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Generate Cover Letter</h3>
          <p className="text-sm text-gray-600 mb-6">
            Create a personalized cover letter that complements your optimized CV.
          </p>
        </div>

        {!wizardData.coverLetter ? (
          <Card className="shadow-lg border-gray-200">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-green-100 rounded-full">
                  <FileText className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-gray-900">Ready to Create</h4>
              <p className="text-gray-600 mb-6">
                Generate a compelling cover letter tailored to this job posting and your optimized CV.
              </p>
              <Button
                onClick={generateCoverLetterContent}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Cover Letter
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border-gray-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
              <CardTitle className="flex items-center text-gray-900">
                <FileText className="w-5 h-5 mr-2" />
                Your Cover Letter
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4">
                <Label htmlFor="cover-letter-content" className="text-sm font-medium text-gray-700">
                  Edit your cover letter content:
                </Label>
                <Textarea
                  id="cover-letter-content"
                  value={wizardData.coverLetter}
                  onChange={(e) => updateWizardData({ coverLetter: e.target.value })}
                  rows={12}
                  className="mt-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm"
                  placeholder="Your cover letter content will appear here..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={generateCoverLetterContent}
                  disabled={isLoading}
                  className="shadow-sm border-gray-300 hover:bg-gray-50 bg-transparent"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={prevStep}
            className="shadow-sm border-gray-300 hover:bg-gray-50 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={nextStep}
            disabled={!wizardData.coverLetter}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2.5"
          >
            Review Application
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    ),
    [wizardData.coverLetter, updateWizardData, generateCoverLetterContent, isLoading, prevStep, nextStep],
  )

  const Step5Review = useMemo(
    () => (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">Review & Save Application</h3>
          <p className="text-sm text-gray-600 mb-6">
            Review your complete application package and save to your dashboard.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-lg border-gray-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
              <CardTitle className="text-base text-gray-900">
                Optimized CV ({CV_TEMPLATES.find((t) => t.id === wizardData.selectedTemplate)?.name})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="bg-blue-50 p-4 rounded-lg max-h-48 overflow-y-auto border border-blue-200">
                <div
                  className="text-xs"
                  dangerouslySetInnerHTML={{ __html: wizardData.renderedCV || "No CV generated" }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-gray-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
              <CardTitle className="text-base text-gray-900">Cover Letter</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="bg-green-50 p-4 rounded-lg max-h-48 overflow-y-auto border border-green-200">
                <pre className="whitespace-pre-wrap text-xs text-gray-700">
                  {wizardData.coverLetter || "No cover letter generated"}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="application-name" className="text-sm font-medium text-gray-700">
              Application Name *
            </Label>
            <Input
              id="application-name"
              placeholder="e.g., Senior Developer at TechCorp"
              value={wizardData.applicationName}
              onChange={(e) => updateWizardData({ applicationName: e.target.value })}
              className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm"
            />
          </div>
          <div>
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
              Initial Status
            </Label>
            <Select value={wizardData.status} onValueChange={(value) => updateWizardData({ status: value })}>
              <SelectTrigger className="mt-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPLICATION_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={prevStep}
            className="shadow-sm border-gray-300 hover:bg-gray-50 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={downloadCVAsPDF}
              disabled={!wizardData.renderedCV}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CV
            </Button>
            <Button
              variant="outline"
              onClick={downloadCoverLetterAsPDF}
              disabled={!wizardData.coverLetter}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Cover Letter
            </Button>
            <Button
              onClick={saveApplication}
              disabled={isLoading || !wizardData.applicationName.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Complete Application
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    ),
    [
      wizardData.selectedTemplate,
      wizardData.renderedCV,
      wizardData.coverLetter,
      wizardData.applicationName,
      wizardData.status,
      updateWizardData,
      prevStep,
      downloadCVAsPDF,
      downloadCoverLetterAsPDF,
      saveApplication,
      isLoading,
    ],
  )

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return Step1JobDescription
      case 2:
        return Step2SelectCVAndTemplate
      case 3:
        return Step3OptimizeCV
      case 4:
        return Step4CoverLetter
      case 5:
        return Step5Review
      default:
        return Step1JobDescription
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-4 hover:bg-white/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Application Wizard
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create a complete job application with AI-powered optimization and professional templates
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <div key={step.id} className={`flex items-center ${index < STEPS.length - 1 ? "flex-1" : ""}`}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full text-sm font-medium transition-all duration-300 shadow-lg ${
                        isCompleted
                          ? `bg-gradient-to-r ${step.color} text-white shadow-lg`
                          : isActive
                            ? `bg-gradient-to-r ${step.color} text-white shadow-xl scale-110`
                            : "bg-white text-gray-400 border-2 border-gray-200 shadow-sm"
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <div className="mt-3 text-center">
                      <div
                        className={`text-sm font-medium ${isActive || isCompleted ? "text-gray-900" : "text-gray-500"}`}
                      >
                        {step.title}
                      </div>
                      <div className={`text-xs mt-1 ${isActive || isCompleted ? "text-gray-600" : "text-gray-400"}`}>
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 mx-6 mt-6">
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            currentStep > step.id ? `bg-gradient-to-r ${step.color}` : "bg-gray-200"
                          }`}
                          style={{
                            width: currentStep > step.id ? "100%" : "0%",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-4">
            <Progress value={(currentStep / STEPS.length) * 100} className="h-3 bg-gray-200 shadow-inner" />
          </div>
        </div>

        {/* Step Content */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">{renderStep()}</CardContent>
        </Card>
      </div>
    </div>
  )
}
