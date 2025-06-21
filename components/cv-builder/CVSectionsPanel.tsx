import {
  User,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Check,
  Edit3,
  ChevronRight,
} from "lucide-react"
import { type CVData } from "@/lib/cv-templates"

interface CVSectionsPanelProps {
  cvData: CVData
  getSectionStatus: (section: string) => boolean
  getSectionPreview: (section: string) => string
  onSectionClick: (modal: string) => void
}

export const CVSectionsPanel = ({
  cvData,
  getSectionStatus,
  getSectionPreview,
  onSectionClick,
}: CVSectionsPanelProps) => {
  return (
    <div className="lg:col-span-2 space-y-4">
      {/* Personal Information Section */}
      <div
        className="border rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all shadow-md bg-white"
        onClick={() => onSectionClick("personal")}
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
        onClick={() => onSectionClick("photo")}
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
        onClick={() => onSectionClick("experience")}
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
        onClick={() => onSectionClick("education")}
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
        onClick={() => onSectionClick("skills")}
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
        onClick={() => onSectionClick("certifications")}
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
  )
} 