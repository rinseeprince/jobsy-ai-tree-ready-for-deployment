// Main CV analysis service that orchestrates all scoring algorithms

// Import the CVScoringService directly
import { CVScoringService } from "./scoring-algorithms"
import type { CVData } from "../cv-templates"
import type { AIAnalysisRequest, AIAnalysisResponse, KeywordItem, ImportanceLevel } from "../types/ai-analysis"

export class CVAnalysisService {
  /**
   * Perform comprehensive CV analysis
   */
  static async analyzeCV(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      console.log("AI Analysis API called")
      const { cvData, jobDescription, targetIndustry = "technology", analysisTypes } = request

      const results: AIAnalysisResponse["results"] = {}
      const tokensUsed = 0

      console.log("Available analysis types:", analysisTypes)
      console.log("CVScoringService available:", !!CVScoringService) // Debug log

      // Perform requested analyses
      if (analysisTypes.includes("ats_score")) {
        console.log("Calculating ATS score...")
        console.log("CVScoringService.calculateATSScore:", typeof CVScoringService.calculateATSScore) // Debug log

        // Try-catch around this specific call
        try {
          results.atsScore = CVScoringService.calculateATSScore(cvData, jobDescription, targetIndustry)
          console.log("ATS score calculated successfully")
        } catch (atsError) {
          console.error("ATS calculation error:", atsError)
          throw atsError
        }
      }

      if (analysisTypes.includes("content_quality")) {
        console.log("Calculating content quality...")
        try {
          results.contentQuality = CVScoringService.calculateContentQuality(cvData)
          console.log("Content quality calculated successfully")
        } catch (contentError) {
          console.error("Content quality calculation error:", contentError)
          throw contentError
        }
      }

      if (analysisTypes.includes("design_score")) {
        console.log("Calculating design score...")
        results.designScore = this.calculateDesignScore(cvData)
      }

      if (analysisTypes.includes("length_analysis")) {
        console.log("Calculating length analysis...")
        results.lengthAnalysis = this.calculateLengthAnalysis(cvData, targetIndustry)
      }

      // If job description provided, perform keyword analysis
      if (jobDescription) {
        console.log("Performing keyword analysis...")
        results.keywordAnalysis = this.performKeywordAnalysis(cvData, jobDescription)
      }

      console.log("Analysis completed successfully")
      return {
        success: true,
        results,
        tokensUsed,
        cost: this.calculateCost(tokensUsed),
      }
    } catch (error) {
      console.error("CV Analysis failed:", error)
      return {
        success: false,
        results: {},
        error: error instanceof Error ? error.message : "Analysis failed",
      }
    }
  }

  /**
   * Calculate design score (placeholder implementation)
   */
  private static calculateDesignScore(cvData: CVData) {
    let score = 70 // Base score

    // Bonus for having all sections
    if (cvData.personalInfo.name) score += 5
    if (cvData.personalInfo.summary) score += 5
    if (cvData.experience.length > 0) score += 5
    if (cvData.education.length > 0) score += 5
    if (cvData.skills.length > 0) score += 5
    if (cvData.personalInfo.profilePhoto) score += 5

    return {
      overall: Math.min(100, score),
      layout: {
        score: 85,
        whitespace: 15,
        margins: "Appropriate" as const,
        sections: "Well-organized" as const,
      },
      typography: {
        score: 90,
        fontConsistency: true,
        fontSize: "Readable" as const,
        hierarchy: "Clear" as const,
      },
      professionalism: {
        score: 88,
        colorScheme: "Professional" as const,
        graphics: "Appropriate" as const,
      },
    }
  }

  /**
   * Calculate length analysis with proper word counting
   */
  private static calculateLengthAnalysis(cvData: CVData, industry: string) {
    const allText = this.extractAllText(cvData)

    // Improved word counting
    const words = allText
      .replace(/[^\w\s]/g, " ") // Replace punctuation with spaces
      .split(/\s+/) // Split on whitespace
      .filter((word) => word.trim().length > 0) // Filter out empty strings

    const wordCount = words.length
    console.log("📊 Length analysis - Word count:", wordCount, "from text:", allText.substring(0, 100) + "...")

    // Estimate pages (assuming ~250 words per page)
    const estimatedPages = Math.max(1, Math.ceil(wordCount / 250))

    // Industry benchmarks
    const benchmarks = {
      technology: { ideal: 400, min: 300, max: 600 },
      healthcare: { ideal: 500, min: 400, max: 800 },
      finance: { ideal: 450, min: 350, max: 650 },
      marketing: { ideal: 400, min: 300, max: 600 },
      education: { ideal: 500, min: 400, max: 700 },
    }

    const benchmark = benchmarks[industry as keyof typeof benchmarks] || benchmarks.technology

    let score = 100
    let action: "expand" | "condense" | "optimal" = "optimal"
    const suggestions = []

    if (wordCount < benchmark.min) {
      score = Math.max(60, (wordCount / benchmark.min) * 100)
      action = "expand"
      suggestions.push("Add more detail to your experience descriptions")
      suggestions.push("Include quantified achievements and specific examples")
    } else if (wordCount > benchmark.max) {
      score = Math.max(70, 100 - ((wordCount - benchmark.max) / benchmark.max) * 30)
      action = "condense"
      suggestions.push("Remove redundant information and focus on key achievements")
      suggestions.push("Use bullet points instead of long paragraphs")
    } else {
      suggestions.push("Your CV length is optimal for your industry")
    }

    return {
      overall: Math.round(score),
      currentStats: {
        pages: estimatedPages,
        words: wordCount,
        characters: allText.length,
        sections: [
          {
            section: "Summary",
            words: cvData.personalInfo.summary?.split(/\s+/).filter((w) => w.length > 0).length || 0,
            recommended: 50,
            status: "optimal" as const,
          },
          {
            section: "Experience",
            words: this.countSectionWords(cvData.experience),
            recommended: 200,
            status: "optimal" as const,
          },
          {
            section: "Education",
            words: this.countSectionWords(cvData.education),
            recommended: 50,
            status: "optimal" as const,
          },
          {
            section: "Skills",
            words: cvData.skills
              .join(" ")
              .split(/\s+/)
              .filter((w) => w.length > 0).length,
            recommended: 30,
            status: "optimal" as const,
          },
        ],
      },
      industryBenchmark: {
        idealPages: estimatedPages <= 2 ? "1-2 pages" : "2-3 pages",
        idealWords: benchmark.ideal,
        maxWords: benchmark.max,
        minWords: benchmark.min,
      },
      recommendations: {
        action,
        priority: (score < 80 ? "high" : score < 90 ? "medium" : "low") as "high" | "medium" | "low",
        suggestions,
      },
    }
  }

  /**
   * Perform keyword analysis
   */
  private static performKeywordAnalysis(cvData: CVData, jobDescription: string) {
    const cvText = this.extractAllText(cvData).toLowerCase()
    const jobText = jobDescription.toLowerCase()

    // Extract keywords from job description (simplified)
    const jobWords = jobText
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .filter((word) => !this.isStopWord(word))

    // Count frequency of each word
    const wordFreq: Record<string, number> = {}
    jobWords.forEach((word) => {
      wordFreq[word] = (wordFreq[word] || 0) + 1
    })

    // Get top keywords
    const topKeywords: KeywordItem[] = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([keyword, frequency]) => ({
        keyword,
        importance: (frequency > 3 ? "Critical" : frequency > 1 ? "Important" : "Nice-to-have") as ImportanceLevel,
        frequency,
        cvMatches: (cvText.match(new RegExp(keyword, "g")) || []).length,
        density: 0,
      }))

    // Calculate densities and matches
    const cvWords = cvText.split(/\s+/).length
    topKeywords.forEach((item) => {
      item.density = ((item.cvMatches ?? 0) / cvWords) * 100
    })

    const missing = topKeywords.filter((k) => k.cvMatches === 0 && k.importance === "Critical").map((k) => k.keyword)
    const underused = topKeywords.filter((k) => (k.cvMatches ?? 0) < 2 && k.importance === "Important").map((k) => k.keyword)
    const overused = topKeywords.filter((k) => (k.density ?? 0) > 5).map((k) => k.keyword)

    const totalMatches = topKeywords.reduce((sum, k) => sum + ((k.cvMatches ?? 0) > 0 ? 1 : 0), 0)
    const overallMatch = Math.round((totalMatches / topKeywords.length) * 100)

    return {
      jobKeywords: topKeywords,
      recommendations: {
        missing,
        underused,
        overused,
        synonyms: [], // Would implement synonym suggestions
      },
      overallMatch,
    }
  }

  /**
   * Helper methods
   */
  private static extractAllText(cvData: CVData): string {
    let text = ""

    // Personal information
    const personal = cvData.personalInfo
    text += `${personal.name || ""} `
    text += `${personal.title || ""} `
    text += `${personal.email || ""} `
    text += `${personal.phone || ""} `
    text += `${personal.location || ""} `
    text += `${personal.summary || ""} `
    text += `${personal.linkedin || ""} `
    text += `${personal.website || ""} `

    // Experience
    cvData.experience.forEach((exp) => {
      text += `${exp.title || ""} `
      text += `${exp.company || ""} `
      text += `${exp.location || ""} `
      text += `${exp.description || ""} `
    })

    // Education
    cvData.education.forEach((edu) => {
      text += `${edu.degree || ""} `
      text += `${edu.institution || ""} `
      text += `${edu.location || ""} `
      text += `${edu.description || ""} `
    })

    // Skills
    text += cvData.skills.join(" ") + " "

    // Certifications
    cvData.certifications.forEach((cert) => {
      text += `${cert.name || ""} `
      text += `${cert.issuer || ""} `
      text += `${cert.description || ""} `
    })

    return text.trim()
  }

  private static countSectionWords(section: Record<string, unknown>[]): number {
    return section.reduce((count, item) => {
      const text = Object.values(item)
        .filter((value) => typeof value === "string")
        .join(" ")
      return count + text.split(/\s+/).filter((w) => w.length > 0).length
    }, 0)
  }

  private static isStopWord(word: string): boolean {
    const stopWords = [
      "the",
      "and",
      "for",
      "are",
      "but",
      "not",
      "you",
      "all",
      "can",
      "had",
      "her",
      "was",
      "one",
      "our",
      "out",
      "day",
      "get",
      "has",
      "him",
      "his",
      "how",
      "man",
      "new",
      "now",
      "old",
      "see",
      "two",
      "way",
      "who",
      "boy",
      "did",
      "its",
      "let",
      "put",
      "say",
      "she",
      "too",
      "use",
      "with",
      "have",
      "this",
      "will",
      "your",
      "from",
      "they",
      "know",
      "want",
      "been",
      "good",
      "much",
      "some",
      "time",
      "very",
      "when",
      "come",
      "here",
      "just",
      "like",
      "long",
      "make",
      "many",
      "over",
      "such",
      "take",
      "than",
      "them",
      "well",
      "were",
    ]
    return stopWords.includes(word.toLowerCase())
  }

  private static calculateCost(tokensUsed: number): number {
    // Rough cost calculation for GPT-4o-mini
    const inputTokens = tokensUsed * 0.7 // Assume 70% input
    const outputTokens = tokensUsed * 0.3 // Assume 30% output

    const inputCost = (inputTokens / 1000) * 0.00015
    const outputCost = (outputTokens / 1000) * 0.0006

    return inputCost + outputCost
  }
}
