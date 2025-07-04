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
  Edit,
} from "lucide-react"
import { ApplicationsService, type SavedCV } from "@/lib/supabase"
import { generateCoverLetter, improveCv } from "@/lib/ai-service"
import { useToast } from "@/components/ui/use-toast"

interface WizardData {
  jobDescription: string
  jobUrl?: string
  selectedCV?: SavedCV
  tailoredCV?: string
  coverLetter?: string
  applicationName: string
  status: string
}

const STEPS = [
  { id: 1, title: "Job Description", description: "Paste or upload the job posting" },
  { id: 2, title: "Select CV", description: "Choose or upload your CV" },
  { id: 3, title: "Tailor CV", description: "Generate AI-optimized CV" },
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
    tailoredCV: "",
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
      }

      toast({
        title: "File uploaded successfully",
        description: "Content has been extracted and added.",
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

  const generateTailoredCV = async () => {
    if (!wizardData.selectedCV || !wizardData.jobDescription) return

    setIsLoading(true)
    try {
      const cvText = generateCVText(wizardData.selectedCV.cv_data)
      const improvements = await improveCv(wizardData.jobDescription, cvText)
      updateWizardData({ tailoredCV: improvements })

      toast({
        title: "CV tailored successfully",
        description: "Your CV has been optimized for this job posting.",
      })
    } catch (error) {
      console.error("Error generating tailored CV:", error)
      toast({
        title: "Generation failed",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateCoverLetterContent = async () => {
    if (!wizardData.selectedCV || !wizardData.jobDescription) return

    setIsLoading(true)
    try {
      const cvText = generateCVText(wizardData.selectedCV.cv_data)
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
    if (!wizardData.selectedCV || !wizardData.jobDescription || !wizardData.coverLetter) {
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
      const cvText = generateCVText(wizardData.selectedCV.cv_data)

      await ApplicationsService.saveApplication({
        job_title: jobDetails.job_title,
        company_name: jobDetails.company_name,
        job_posting: wizardData.jobDescription,
        cv_content: wizardData.tailoredCV || cvText,
        cover_letter: wizardData.coverLetter,
        cv_recommendations: wizardData.tailoredCV || "",
        location: jobDetails.location,
        salary_range: jobDetails.salary_range,
        job_url: wizardData.jobUrl,
      })

      // Clear draft
      localStorage.removeItem("wizard-draft")

      toast({
        title: "Application saved successfully!",
        description: "Your application has been added to your dashboard.",
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

  const generateCVText = (cvData: any): string => {
    const { personalInfo, experience, education, skills, certifications } = cvData

    let text = `${personalInfo.name}\n${personalInfo.title}\n${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location}\n`

    if (personalInfo.linkedin) text += `LinkedIn: ${personalInfo.linkedin}\n`
    if (personalInfo.website) text += `Website: ${personalInfo.website}\n`

    text += `\n${personalInfo.summary}\n\n`

    text += "EXPERIENCE\n"
    experience.forEach((exp: any) => {
      text += `${exp.title} | ${exp.company} | ${exp.location}\n`
      text += `${exp.startDate} - ${exp.current ? "Present" : exp.endDate}\n`
      text += `${exp.description}\n\n`
    })

    text += "EDUCATION\n"
    education.forEach((edu: any) => {
      text += `${edu.degree} | ${edu.institution} | ${edu.location}\n`
      text += `${edu.startDate} - ${edu.current ? "Present" : edu.endDate}\n`
      text += `${edu.description}\n\n`
    })

    text += "SKILLS\n"
    text += skills.join(", ") + "\n\n"

    text += "CERTIFICATIONS\n"
    certifications.forEach((cert: any) => {
      text += `${cert.name} | ${cert.issuer} | ${cert.date}\n`
      text += `${cert.description}\n\n`
    })

    return text
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1JobDescription />
      case 2:
        return <Step2SelectCV />
      case 3:
        return <Step3TailorCV />
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

  const Step2SelectCV = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Your CV</h3>
        <p className="text-sm text-gray-600 mb-6">Choose an existing CV from your collection or upload a new one.</p>
      </div>

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
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No saved CVs found. Upload a new CV to continue.</p>
        </div>
      )}

      <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
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

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button
          onClick={nextStep}
          disabled={!wizardData.selectedCV}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Select CV & Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const Step3TailorCV = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Tailor Your CV</h3>
        <p className="text-sm text-gray-600 mb-6">Generate AI-optimized improvements for this specific job posting.</p>
      </div>

      {!wizardData.tailoredCV ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Wand2 className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h4 className="text-lg font-semibold mb-2">Ready to Optimize</h4>
            <p className="text-gray-600 mb-6">
              Our AI will analyze the job posting and suggest improvements to make your CV more relevant.
            </p>
            <Button
              onClick={generateTailoredCV}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Tailored CV
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              CV Improvements & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">{wizardData.tailoredCV}</pre>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={generateTailoredCV} disabled={isLoading}>
                <Wand2 className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Open edit modal or inline editor
                  const newContent = prompt("Edit CV improvements:", wizardData.tailoredCV)
                  if (newContent !== null) {
                    updateWizardData({ tailoredCV: newContent })
                  }
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
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
          disabled={!wizardData.tailoredCV}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Save & Continue
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
          Create a personalized cover letter that highlights your relevant experience.
        </p>
      </div>

      {!wizardData.coverLetter ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h4 className="text-lg font-semibold mb-2">Ready to Create</h4>
            <p className="text-gray-600 mb-6">
              Generate a compelling cover letter tailored to this job posting and your CV.
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
          Save & Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  const Step5Review = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review & Save Application</h3>
        <p className="text-sm text-gray-600 mb-6">Review your application materials and save to your dashboard.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">CV Improvements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg max-h-48 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-xs text-gray-700">
                {wizardData.tailoredCV || "No improvements generated"}
              </pre>
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
              Save Application
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
          <p className="text-gray-600">Create a complete job application with AI-powered optimization</p>
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
