"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  FileText,
  Upload,
  Check,
  AlertCircle,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  X,
  Lightbulb,
  Target,
  Brain,
  CheckCircle,
  Plus,
} from "lucide-react"
import Image from 'next/image'

import type { CVData } from "@/lib/cv-templates"

interface CVEditorModalProps {
  activeModal: string | null
  setActiveModal: (modal: string | null) => void
  cvData: CVData
  updatePersonalInfo: (field: string, value: string) => void
  addExperience: () => void
  updateExperience: (id: string, field: string, value: string | boolean) => void
  removeExperience: (id: string) => void
  addEducation: () => void
  updateEducation: (id: string, field: string, value: string | boolean) => void
  removeEducation: (id: string) => void
  updateSkills: (skillsString: string) => void
  addCertification: () => void
  updateCertification: (id: string, field: string, value: string) => void
  removeCertification: (id: string) => void
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  removePhoto: () => void
}

function CVEditorModals({
  activeModal,
  setActiveModal,
  cvData,
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
}: CVEditorModalProps) {
  if (!activeModal) return null

  return (
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
            {activeModal === "education" && "List your educational background and academic achievements"}
            {activeModal === "skills" && "Include both technical and soft skills relevant to your target role"}
            {activeModal === "certifications" && "Add professional certifications and licenses"}
          </p>
        </div>
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {/* Modal Content */}
          {activeModal === "personal" && <PersonalInfoModal cvData={cvData} updatePersonalInfo={updatePersonalInfo} />}

          {activeModal === "photo" && (
            <PhotoUploadModal cvData={cvData} handlePhotoUpload={handlePhotoUpload} removePhoto={removePhoto} />
          )}

          {activeModal === "experience" && (
            <ExperienceModal
              cvData={cvData}
              addExperience={addExperience}
              updateExperience={updateExperience}
              removeExperience={removeExperience}
            />
          )}

          {activeModal === "education" && (
            <EducationModal
              cvData={cvData}
              addEducation={addEducation}
              updateEducation={updateEducation}
              removeEducation={removeEducation}
            />
          )}

          {activeModal === "skills" && <SkillsModal cvData={cvData} updateSkills={updateSkills} />}

          {activeModal === "certifications" && (
            <CertificationsModal
              cvData={cvData}
              addCertification={addCertification}
              updateCertification={updateCertification}
              removeCertification={removeCertification}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Personal Information Modal
function PersonalInfoModal({
  cvData,
  updatePersonalInfo,
}: {
  cvData: CVData
  updatePersonalInfo: (field: string, value: string) => void
}) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900 mb-2">ATS Optimization Tips</h4>
            <ul className="text-amber-800 text-sm space-y-1">
              <li>Use a clear, professional format without headers/footers</li>
              <li>Include keywords from the job description in your summary</li>
              <li>Keep contact information at the top and easily readable</li>
              <li>Write a compelling summary with 2-3 key achievements</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
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
          <Label htmlFor="title" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
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
          <Label htmlFor="summary" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
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
              Pro Tip: Include 2-3 quantifiable achievements and use action words like {"increased,"} {"led,"}{" "}
              {"developed,"}
              or {"implemented."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Photo Upload Modal
function PhotoUploadModal({
  cvData,
  handlePhotoUpload,
  removePhoto,
}: {
  cvData: CVData
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  removePhoto: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-50 to-red-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-red-500 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900 mb-2">Photo Guidelines & Regional Considerations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-amber-900 mb-1">ATS Considerations:</h5>
                <ul className="text-amber-800 space-y-1">
                  <li>Photos can cause parsing issues in some ATS systems</li>
                  <li>May lead to unconscious bias in screening</li>
                  <li>Can increase file size and processing time</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-amber-900 mb-1">Regional Practices:</h5>
                <ul className="text-amber-800 space-y-1">
                  <li>EU/Germany: Often expected</li>
                  <li>US/UK/Canada: Generally discouraged</li>
                  <li>Creative Industries: More acceptable</li>
                  <li>Corporate/Tech: Usually avoided</li>
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
              <div className="w-32 h-32 rounded-2xl border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                <Image
                  src={cvData.personalInfo.profilePhoto || "/placeholder.svg"}
                  alt="Profile photo"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium mb-1">Professional photo uploaded</p>
                <p className="text-green-700 text-sm">
                  Your photo will appear in photo-enabled templates. ATS-optimized templates will automatically exclude
                  this image for maximum compatibility.
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
                  <X className="w-4 h-4 mr-1" />
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Professional Photo</h3>
                <p className="text-gray-600 mb-4">High-quality headshot, professional attire, neutral background</p>
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-gray-700 text-sm">Requirements: JPG or PNG, max 5MB, minimum 400x400px</p>
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

        <Input id="profile-photo" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Smart Template Selection
          </h4>
          <p className="text-blue-800 text-sm">
            Our AI will automatically recommend photo-free templates for ATS-heavy industries (tech, finance, corporate)
            and photo-enabled templates for creative fields or international applications where photos are expected.
          </p>
        </div>
      </div>
    </div>
  )
}

// Experience Modal
function ExperienceModal({
  cvData,
  addExperience,
  updateExperience,
  removeExperience,
}: {
  cvData: CVData
  addExperience: () => void
  updateExperience: (id: string, field: string, value: string | boolean) => void
  removeExperience: (id: string) => void
}) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-emerald-900 mb-2">Experience Section Best Practices</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-emerald-900 mb-1">ATS Optimization:</h5>
                <ul className="text-emerald-800 space-y-1">
                  <li>Start bullet points with action verbs</li>
                  <li>Include specific numbers and percentages</li>
                  <li>Use keywords from job descriptions</li>
                  <li>Focus on achievements, not just duties</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-emerald-900 mb-1">Quantify Impact:</h5>
                <ul className="text-emerald-800 space-y-1">
                  <li>{"Increased sales by 25%"}</li>
                  <li>{"Led team of 8 developers"}</li>
                  <li>{"Reduced costs by $50K annually"}</li>
                  <li>{"Improved efficiency by 40%"}</li>
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
              <Label htmlFor={`current-${exp.id}`} className="text-sm font-medium text-gray-700">
                {"I currently work here"}
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
              <Label className="text-sm font-medium text-gray-700">Key Achievements & Responsibilities *</Label>
              <Textarea
                value={exp.description}
                onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                placeholder="• Increased team productivity by 30% through implementation of agile methodologies&#10;• Led cross-functional team of 12 members to deliver $2M project ahead of schedule&#10;• Developed automated testing framework reducing bug reports by 45%&#10;• Mentored 5 junior developers, with 100% promotion rate within 18 months"
                className="min-h-[120px] border-2 border-gray-200 focus:border-blue-400 rounded-xl"
              />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  Pro Tip: Use bullet points starting with action verbs (Led, Developed, Increased, Implemented).
                  Include specific metrics and outcomes wherever possible.
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
  )
}

// Education Modal
function EducationModal({
  cvData,
  addEducation,
  updateEducation,
  removeEducation,
}: {
  cvData: CVData
  addEducation: () => void
  updateEducation: (id: string, field: string, value: string | boolean) => void
  removeEducation: (id: string) => void
}) {
  return (
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
                <h5 className="font-medium text-indigo-900 mb-1">What to Include:</h5>
                <ul className="text-indigo-800 space-y-1">
                  <li>Degree type and major/field of study</li>
                  <li>Institution name and location</li>
                  <li>Graduation date (month/year)</li>
                  <li>Relevant coursework, honors, GPA (if 3.5+)</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-indigo-900 mb-1">ATS Tips:</h5>
                <ul className="text-indigo-800 space-y-1">
                  <li>List most recent education first</li>
                  <li>Include relevant certifications here</li>
                  <li>Mention thesis/capstone if relevant</li>
                  <li>Add study abroad or exchange programs</li>
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
              <Label className="text-sm font-medium text-gray-700">Degree & Field of Study *</Label>
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
              <Label htmlFor={`edu-current-${edu.id}`} className="text-sm font-medium text-gray-700">
                {"Currently studying here"}
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
              <Label className="text-sm font-medium text-gray-700">Additional Details (Optional)</Label>
              <Textarea
                value={edu.description}
                onChange={(e) => updateEducation(edu.id, "description", e.target.value)}
                placeholder="• Relevant coursework: Data Structures, Algorithms, Database Systems&#10;• Magna Cum Laude, GPA: 3.8/4.0&#10;• Dean's List: Fall 2018, Spring 2019&#10;• Senior Capstone: Machine Learning Application for Predictive Analytics"
                className="min-h-[100px] border-2 border-gray-200 focus:border-indigo-400 rounded-xl"
              />
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <p className="text-indigo-800 text-sm">
                  Include: Honors, relevant coursework, GPA (if 3.5+), thesis topics, academic achievements, or study
                  abroad programs.
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
  )
}

// Skills Modal
function SkillsModal({
  cvData,
  updateSkills,
}: {
  cvData: CVData
  updateSkills: (skillsString: string) => void
}) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-emerald-900 mb-2">Skills Optimization Strategy</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-emerald-900 mb-1">ATS Keyword Matching:</h5>
                <ul className="text-emerald-800 space-y-1">
                  <li>Use exact keywords from job descriptions</li>
                  <li>Include both technical and soft skills</li>
                  <li>List skills in order of relevance</li>
                  <li>Avoid abbreviations unless specified</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-emerald-900 mb-1">Skill Categories:</h5>
                <ul className="text-emerald-800 space-y-1">
                  <li>Tech: Programming, software, tools</li>
                  <li>Soft: Leadership, communication</li>
                  <li>Industry: Domain-specific knowledge</li>
                  <li>Languages: Fluency levels</li>
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
              <li>Separate skills with commas</li>
              <li>Use consistent capitalization</li>
              <li>Group similar skills together</li>
              <li>Start with most relevant skills</li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Example Skills
            </h4>
            <ul className="text-green-800 text-sm space-y-1">
              <li>Tech: Python, React, AWS, Docker</li>
              <li>Soft: Leadership, Communication</li>
              <li>Tools: Jira, Slack, Figma, Git</li>
              <li>Methods: Agile, Scrum, DevOps</li>
            </ul>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Recommendation
          </h4>
          <p className="text-amber-800 text-sm">
            Pro Tip: If you have added a job description, our AI will suggest the most relevant skills to include based
            on the requirements. Review the job posting and ensure you include skills that match exactly as written in
            the posting.
          </p>
        </div>
      </div>
    </div>
  )
}

// Certifications Modal
function CertificationsModal({
  cvData,
  addCertification,
  updateCertification,
  removeCertification,
}: {
  cvData: CVData
  addCertification: () => void
  updateCertification: (id: string, field: string, value: string) => void
  removeCertification: (id: string) => void
}) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-orange-900 mb-2">Certifications & Professional Credentials</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-orange-900 mb-1">What to Include:</h5>
                <ul className="text-orange-800 space-y-1">
                  <li>Professional certifications (AWS, Google, etc.)</li>
                  <li>Industry licenses and credentials</li>
                  <li>Completed training programs</li>
                  <li>Relevant online course certificates</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-orange-900 mb-1">Best Practices:</h5>
                <ul className="text-orange-800 space-y-1">
                  <li>List most recent/relevant first</li>
                  <li>Include expiration dates if applicable</li>
                  <li>Add certification numbers/IDs</li>
                  <li>Mention if currently pursuing</li>
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
              <Label className="text-sm font-medium text-gray-700">Issuing Organization *</Label>
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
              <Label className="text-sm font-medium text-gray-700">Additional Details (Optional)</Label>
              <Textarea
                value={cert.description}
                onChange={(e) => updateCertification(cert.id, "description", e.target.value)}
                placeholder="• Certification ID: AWS-SAA-123456&#10;• Valid until: March 2026&#10;• Covers: Cloud architecture, security, scalability&#10;• Score: 850/1000 (Pass: 720)"
                className="min-h-[100px] border-2 border-gray-200 focus:border-orange-400 rounded-xl"
              />
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-orange-800 text-sm">
                  Include: Certification ID, expiration date, score (if impressive), or key competencies covered by the
                  certification.
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
  )
}

export default CVEditorModals
