// CV Data Validator - ensures CV data is complete enough for analysis
import type { CVData } from "./cv-templates"

export interface CVValidationResult {
  isValid: boolean
  completionScore: number
  missingFields: string[]
  recommendations: string[]
}

export class CVDataValidator {
  /**
   * Validate if CV data is sufficient for AI analysis
   */
  static validateForAnalysis(cvData: CVData): CVValidationResult {
    const missingFields: string[] = []
    const recommendations: string[] = []
    let completionScore = 0

    // Personal Information (40% weight)
    let personalScore = 0
    if (!cvData.personalInfo.name?.trim()) {
      missingFields.push("Full Name")
    } else personalScore += 2

    if (!cvData.personalInfo.email?.trim()) {
      missingFields.push("Email Address")
    } else personalScore += 1

    if (!cvData.personalInfo.title?.trim()) {
      missingFields.push("Job Title/Position")
      recommendations.push("Add your current or desired job title")
    } else personalScore += 1

    if (!cvData.personalInfo.summary?.trim()) {
      missingFields.push("Professional Summary")
      recommendations.push("Add a professional summary (2-3 sentences)")
    } else if (cvData.personalInfo.summary.split(" ").length < 10) {
      recommendations.push("Expand your professional summary (aim for 20-50 words)")
    } else personalScore += 1

    completionScore += (personalScore / 5) * 40

    // Experience (30% weight)
    let experienceScore = 0
    if (cvData.experience.length === 0 || !cvData.experience.some((exp) => exp.title && exp.company)) {
      missingFields.push("Work Experience")
      recommendations.push("Add at least one work experience entry")
    } else {
      experienceScore += 2

      // Check for detailed descriptions
      const hasDetailedExp = cvData.experience.some((exp) => exp.description && exp.description.split(" ").length >= 10)
      if (!hasDetailedExp) {
        recommendations.push("Add detailed descriptions to your work experience (use bullet points with achievements)")
      } else {
        experienceScore += 1
      }
    }
    completionScore += (experienceScore / 3) * 30

    // Education (15% weight)
    let educationScore = 0
    if (cvData.education.length === 0 || !cvData.education.some((edu) => edu.degree && edu.institution)) {
      missingFields.push("Education")
      recommendations.push("Add your educational background")
    } else {
      educationScore += 1
    }
    completionScore += (educationScore / 1) * 15

    // Skills (15% weight)
    let skillsScore = 0
    if (cvData.skills.length === 0) {
      missingFields.push("Skills")
      recommendations.push("Add relevant skills (aim for 5-10 skills)")
    } else if (cvData.skills.length < 3) {
      recommendations.push("Add more skills (aim for 5-10 relevant skills)")
      skillsScore += 0.5
    } else {
      skillsScore += 1
    }
    completionScore += (skillsScore / 1) * 15

    // Round completion score
    completionScore = Math.round(completionScore)

    // Determine if valid for analysis (minimum 60% completion)
    const isValid = completionScore >= 60 && missingFields.length <= 2

    if (!isValid && completionScore < 60) {
      recommendations.unshift("Complete more sections to enable AI analysis (minimum 60% completion required)")
    }

    return {
      isValid,
      completionScore,
      missingFields,
      recommendations,
    }
  }

  /**
   * Get a user-friendly completion message
   */
  static getCompletionMessage(validation: CVValidationResult): string {
    if (validation.completionScore >= 90) {
      return "🎉 Your CV is comprehensive and ready for analysis!"
    } else if (validation.completionScore >= 75) {
      return "✅ Your CV looks good! Minor improvements could enhance the analysis."
    } else if (validation.completionScore >= 60) {
      return "⚡ Your CV is ready for analysis, but adding more details will improve results."
    } else if (validation.completionScore >= 40) {
      return "📝 Your CV needs more information before we can provide meaningful analysis."
    } else {
      return "🚀 Let's build your CV! Add your basic information to get started."
    }
  }

  /**
   * Estimate word count for analysis
   */
  static estimateWordCount(cvData: CVData): number {
    let wordCount = 0

    // Count words in all text fields
    const textFields = [
      cvData.personalInfo.name,
      cvData.personalInfo.title,
      cvData.personalInfo.summary,
      cvData.personalInfo.location,
      ...cvData.experience.map((exp) => `${exp.title} ${exp.company} ${exp.description}`),
      ...cvData.education.map((edu) => `${edu.degree} ${edu.institution} ${edu.description}`),
      cvData.skills.join(" "),
      ...cvData.certifications.map((cert) => `${cert.name} ${cert.issuer} ${cert.description}`),
    ]

    textFields.forEach((field) => {
      if (field && typeof field === "string") {
        wordCount += field
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length
      }
    })

    return wordCount
  }
}
