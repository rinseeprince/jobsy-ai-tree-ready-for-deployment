"use client"

import { useState, useEffect } from "react"
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
} from "lucide-react"
import { ApplicationsService, type SavedCV } from "@/lib/supabase"
import { generateCoverLetter, improveCv } from "@/lib/ai-service"
import { useToast } from "@/components/ui/use-toast"
import { CV_TEMPLATES, renderTemplate, type CVData } from "@/lib/cv-templates"
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
  { id: 1, title: "Job Description", description: "Paste or upload the job posting" },
  { id: 2, title: "Select CV & Template", description: "Choose your CV and design template" },
  { id: 3, title: "Optimize CV", description: "Generate AI-optimized CV with template" },
  { id: 4, title: "Cover Letter", description: "Generate personalized cover letter" },
  { id: 5, title: "Review & Save", description: "Finalize your application" },
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

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem("wizard-draft", JSON.stringify(wizardData))
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

  const updateWizardData = (updates: Partial<WizardData>) => {
    setWizardData((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFileUpload = async (file: File) => {
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
  }

  const optimizeCVWithAI = async () => {
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

      // Get AI improvements
      const improvements = await improveCv(wizardData.jobDescription, currentCVText)

      // Ensure improvements is a valid string
      const validImprovements = typeof improvements === "string" && improvements.trim() ? improvements : ""

      // Apply improvements to CV data structure
      const optimizedCVData = await enhanceCVDataWithAI(wizardData.selectedCV.cv_data, validImprovements)

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
  }

  const generateCoverLetterContent = async () => {
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
      const coverLetter = await generateCoverLetter(wizardData.jobDescription, cvText)
      updateWizardData({ coverLetter })

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
  }

  const saveApplication = async () => {
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
  }

  // Helper functions
  const generateCVText = (cvData: CVData): string => {
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
  }

  const calculateWordCount = (cvData: CVData): number => {
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
  }

  const enhanceCVDataWithAI = async (originalCVData: CVData, aiImprovements: string): Promise<CVData> => {
    // Enhanced with proper null checks and fallback behavior
    const enhancedCVData = { ...originalCVData }

    // Check if aiImprovements is valid
    if (!aiImprovements || typeof aiImprovements !== "string" || !aiImprovements.trim()) {
      console.warn("No AI improvements provided, returning original CV data")
      return enhancedCVData
    }

    try {
      // Try to extract an improved summary from AI improvements
      const summaryMatch = aiImprovements.match(/SUMMARY[:\s]*(.*?)(?=\n\n|\nEXPERIENCE|\nSKILLS|$)/is)
      if (summaryMatch && summaryMatch[1]) {
        enhancedCVData.personalInfo = {
          ...enhancedCVData.personalInfo,
          summary: summaryMatch[1].trim(),
        }
      }

      // Try to extract enhanced skills
      const skillsMatch = aiImprovements.match(/SKILLS[:\s]*(.*?)(?=\n\n|\nEXPERIENCE|\nEDUCATION|$)/is)
      if (skillsMatch && skillsMatch[1]) {
        const extractedSkills = skillsMatch[1]
          .split(/[,\n]/)
          .map((skill) => skill.trim())
          .filter((skill) => skill.length > 0)

        if (extractedSkills.length > 0) {
          enhancedCVData.skills = [...new Set([...enhancedCVData.skills, ...extractedSkills])]
        }
      }
    } catch (error) {
      console.error("Error parsing AI improvements:", error)
      // Return original data if parsing fails
      return originalCVData
    }

    return enhancedCVData
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1JobDescription />
      case 2:
        return <Step2SelectCVAndTemplate />
      case 3:
        return <Step3OptimizeCV />
      case 4:
        return <Step4CoverLetter />
      case 5:
        return <Step5Review />
      default:
        return <Step1JobDescription />
    }
  }

  const Step1JobDescription = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="job-description" className="text-lg font-semibold">
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
          className="min-h-[300px]"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="job-url">Job URL (Optional)</Label>
          <Input
            id="job-url"
            type="url"
            placeholder="https://company.com/jobs/123"
            value={wizardData.jobUrl || ""}
            onChange={(e) => updateWizardData({ jobUrl: e.target.value })}
          />
        </div>
        <div>
          <Label>Or Upload Job Posting</Label>
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
              className="w-full"
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Upload File
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={nextStep}
          disabled={!wizardData.jobDescription.trim()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Next Step
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const Step2SelectCVAndTemplate = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Your CV & Template</h3>
        <p className="text-sm text-gray-600 mb-6">
          Choose an existing CV and select a professional template for your optimized application.
        </p>
      </div>

      {/* CV Selection */}
      <div className="mb-8">
        <h4 className="font-semibold mb-4">Choose Your CV</h4>
        {savedCVs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {savedCVs.map((cv) => (
              <Card
                key={cv.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  wizardData.selectedCV?.id === cv.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                }`}
                onClick={() => updateWizardData({ selectedCV: cv })}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{cv.title}</h4>
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

        <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors mb-8">
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
              className="mb-2"
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
        <h4 className="font-semibold mb-4 flex items-center">
          <Palette className="w-5 h-5 mr-2" />
          Choose Template Style
        </h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CV_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                wizardData.selectedTemplate === template.id ? "ring-2 ring-purple-500 bg-purple-50" : "hover:bg-gray-50"
              }`}
              onClick={() => updateWizardData({ selectedTemplate: template.id })}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                    <p className="text-xs text-gray-500 mb-2">{template.description}</p>
                  </div>
                  {wizardData.selectedTemplate === template.id && <CheckCircle className="w-5 h-5 text-purple-500" />}
                </div>

                {/* Template Preview */}
                <div className="bg-gray-50 rounded-lg p-2 mb-3 h-32 overflow-hidden relative">
                  <div className="text-xs text-gray-600 text-center pt-12">Template Preview</div>
                </div>

                <div className="flex flex-wrap gap-1">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
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

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={nextStep}
          disabled={!wizardData.selectedCV || !wizardData.selectedTemplate}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Continue with Selection
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const Step3OptimizeCV = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Optimize Your CV</h3>
        <p className="text-sm text-gray-600 mb-6">Generate an AI-optimized CV formatted with your selected template.</p>
      </div>

      {!wizardData.renderedCV ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <Wand2 className="w-16 h-16 text-blue-500" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Ready to Optimize</h4>
            <p className="text-gray-600 mb-4">
              Our AI will analyze the job posting and optimize your CV content, then format it with the{" "}
              <strong>{CV_TEMPLATES.find((t) => t.id === wizardData.selectedTemplate)?.name}</strong> template.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="text-sm text-blue-800">
                <strong>Selected CV:</strong> {wizardData.selectedCV?.title}
                <br />
                <strong>Template:</strong> {CV_TEMPLATES.find((t) => t.id === wizardData.selectedTemplate)?.name}
              </div>
            </div>
            <Button
              onClick={optimizeCVWithAI}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Your Optimized CV Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded-lg p-6 max-h-96 overflow-y-auto shadow-inner">
                <div className="text-sm" dangerouslySetInnerHTML={{ __html: wizardData.renderedCV }} />
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={optimizeCVWithAI} disabled={isLoading}>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Re-optimize
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Template selection change
                    setCurrentStep(2)
                  }}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Change Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={nextStep}
          disabled={!wizardData.renderedCV}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Continue to Cover Letter
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const Step4CoverLetter = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Generate Cover Letter</h3>
        <p className="text-sm text-gray-600 mb-6">
          Create a personalized cover letter that complements your optimized CV.
        </p>
      </div>

      {!wizardData.coverLetter ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h4 className="text-lg font-semibold mb-2">Ready to Create</h4>
            <p className="text-gray-600 mb-6">
              Generate a compelling cover letter tailored to this job posting and your optimized CV.
            </p>
            <Button
              onClick={generateCoverLetterContent}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Your Cover Letter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={wizardData.coverLetter}
              onChange={(e) => updateWizardData({ coverLetter: e.target.value })}
              rows={12}
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={generateCoverLetterContent} disabled={isLoading}>
                <Wand2 className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={nextStep}
          disabled={!wizardData.coverLetter}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
        >
          Review Application
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const Step5Review = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review & Save Application</h3>
        <p className="text-sm text-gray-600 mb-6">
          Review your complete application package and save to your dashboard.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Optimized CV ({CV_TEMPLATES.find((t) => t.id === wizardData.selectedTemplate)?.name})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg max-h-48 overflow-y-auto">
              <div
                className="text-xs"
                dangerouslySetInnerHTML={{ __html: wizardData.renderedCV || "No CV generated" }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cover Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 p-4 rounded-lg max-h-48 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-xs text-gray-700">
                {wizardData.coverLetter || "No cover letter generated"}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="application-name">Application Name *</Label>
          <Input
            id="application-name"
            placeholder="e.g., Senior Developer at TechCorp"
            value={wizardData.applicationName}
            onChange={(e) => updateWizardData({ applicationName: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="status">Initial Status</Label>
          <Select value={wizardData.status} onValueChange={(value) => updateWizardData({ status: value })}>
            <SelectTrigger>
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

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={saveApplication}
          disabled={isLoading || !wizardData.applicationName.trim()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Wizard</h1>
          <p className="text-gray-600">
            Create a complete job application with AI-powered optimization and professional templates
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className={`flex items-center ${index < STEPS.length - 1 ? "flex-1" : ""}`}>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    currentStep >= step.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                </div>
                <div className="ml-3 hidden md:block">
                  <div className="text-sm font-medium text-gray-900">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
                {index < STEPS.length - 1 && (
                  <div className="flex-1 mx-4 h-0.5 bg-gray-200">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{
                        width: currentStep > step.id ? "100%" : "0%",
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / STEPS.length) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8">{renderStep()}</CardContent>
        </Card>
      </div>
    </div>
  )
}
