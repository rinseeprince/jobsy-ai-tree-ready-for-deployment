import { type CVData } from "@/lib/cv-templates"

export const useCVCompletion = () => {
  // Calculate completion percentage
  const calculateCompletion = (cvData: CVData, selectedTemplate: string) => {
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

  // Helper function to get section completion status
  const getSectionStatus = (cvData: CVData, section: string) => {
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
  const getSectionPreview = (cvData: CVData, section: string) => {
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

  return {
    calculateCompletion,
    getSectionStatus,
    getSectionPreview,
  }
} 