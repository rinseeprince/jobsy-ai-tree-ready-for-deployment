// Core scoring algorithms for CV analysis

import type { CVData } from "../cv-templates"
import type { ATSScore, ContentQuality, GrammarIssue } from "../types/ai-analysis"

// Industry-specific data (moved here to fix import error)
const INDUSTRY_RULES: Record<string, { preferredTerms: string[]; avoidTerms: string[] }> = {
  technology: {
    preferredTerms: ["developed", "implemented", "architected", "optimized", "automated", "deployed"],
    avoidTerms: ["responsible for", "worked on", "helped with"],
  },
  healthcare: {
    preferredTerms: ["administered", "diagnosed", "treated", "coordinated", "monitored"],
    avoidTerms: ["assisted", "helped", "supported"],
  },
  finance: {
    preferredTerms: ["analyzed", "forecasted", "managed", "optimized", "streamlined"],
    avoidTerms: ["handled", "dealt with", "worked with"],
  },
  marketing: {
    preferredTerms: ["launched", "executed", "generated", "increased", "converted"],
    avoidTerms: ["created", "made", "did"],
  },
}

const WEAK_TO_STRONG_VERBS: Record<string, string[]> = {
  "responsible for": ["managed", "led", "oversaw", "directed"],
  "worked on": ["developed", "implemented", "created", "built"],
  "helped with": ["assisted", "supported", "facilitated", "contributed to"],
  did: ["executed", "performed", "completed", "accomplished"],
  made: ["created", "developed", "produced", "generated"],
  got: ["achieved", "obtained", "secured", "earned"],
  was: ["served as", "acted as", "functioned as"],
  had: ["possessed", "maintained", "held", "owned"],
}

export class CVScoringService {
  /**
   * Calculate ATS Compatibility Score
   */
  static calculateATSScore(cvData: CVData, jobDescription?: string, industry = "technology"): ATSScore {
    console.log("🔍 CVScoringService.calculateATSScore called")
    console.log("📋 Input CV Data:", cvData)

    const allText = this.extractAllText(cvData)
    console.log("📄 Extracted text length:", allText.length)
    console.log("📄 Extracted text preview:", allText.substring(0, 200) + "...")

    const formatting = this.scoreFormatting(cvData)
    const keywords = jobDescription ? this.scoreKeywords(cvData, jobDescription, industry) : 70
    const structure = this.scoreStructure(cvData, industry)
    const readability = this.scoreReadability(cvData)
    const fileFormat = 85 // Assume good format for now

    const overall = Math.round(
      formatting * 0.25 + keywords * 0.3 + structure * 0.2 + readability * 0.15 + fileFormat * 0.1,
    )

    const recommendations = this.generateATSRecommendations(
      { formatting, keywords, structure, readability, fileFormat },
      industry,
    )

    console.log("✅ ATS Score calculated:", { overall, formatting, keywords, structure, readability, fileFormat })

    return {
      overall,
      breakdown: { formatting, keywords, structure, readability, fileFormat },
      recommendations,
      passRate: overall >= 85 ? "High" : overall >= 70 ? "Medium" : "Low",
    }
  }

  /**
   * Score formatting for ATS compatibility
   */
  private static scoreFormatting(cvData: CVData): number {
    let score = 100

    // Check for ATS-unfriendly elements
    const cvText = this.extractAllText(cvData)

    // Penalize special characters (basic check)
    const specialChars = (cvText.match(/[★●◆▪▫]/g) || []).length
    score -= Math.min(specialChars * 5, 30)

    // Bonus for standard sections
    const hasStandardSections = this.hasStandardSections(cvData)
    if (hasStandardSections) score += 10

    // Penalize if too much formatting complexity (heuristic)
    if (cvText.includes("|") || cvText.includes("─")) {
      score -= 15 // Likely tables or complex formatting
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Score keyword relevance
   */
  private static scoreKeywords(cvData: CVData, jobDescription: string, industry: string): number {
    const cvText = this.extractAllText(cvData).toLowerCase()
    const jobText = jobDescription.toLowerCase()

    // Extract important keywords from job description
    const jobKeywords = this.extractKeywords(jobText)
    const industryTerms = INDUSTRY_RULES[industry]?.preferredTerms || []

    let matches = 0
    let totalImportant = 0

    // Check for keyword matches
    jobKeywords.forEach((keyword) => {
      totalImportant++
      if (cvText.includes(keyword.toLowerCase())) {
        matches++
      }
    })

    // Check for industry terms (fixed type annotation)
    industryTerms.forEach((term: string) => {
      if (cvText.includes(term.toLowerCase())) {
        matches += 0.5 // Bonus for industry terms
      }
    })

    const matchRate = totalImportant > 0 ? matches / totalImportant : 0.7
    return Math.round(Math.min(100, matchRate * 100))
  }

  /**
   * Score CV structure
   */
  private static scoreStructure(cvData: CVData, industry: string): number {
    let score = 0

    // Check for personal info
    if (cvData.personalInfo?.name && cvData.personalInfo?.email) score += 20

    // Check for required sections
    if (cvData.experience?.length > 0 && cvData.experience[0]?.title) score += 25
    if (cvData.education?.length > 0 && cvData.education[0]?.degree) score += 20
    if (cvData.skills?.length > 0) score += 20

    // Industry-specific bonuses
    if (industry === "technology" && cvData.personalInfo?.website) score += 5
    if (industry === "healthcare" && cvData.certifications?.length > 0) score += 10

    // Professional summary bonus
    if (cvData.personalInfo?.summary && cvData.personalInfo.summary.length > 50) score += 10

    return Math.min(100, score)
  }

  /**
   * Score readability
   */
  private static scoreReadability(cvData: CVData): number {
    const allText = this.extractAllText(cvData)

    if (!allText || allText.trim().length === 0) {
      console.log("⚠️ No text found for readability analysis")
      return 0
    }

    const sentences = allText.split(/[.!?]+/).filter((s) => s.trim().length > 0)

    if (sentences.length === 0) return 0

    // Calculate average sentence length
    const totalWords = allText.split(/\s+/).filter((word) => word.trim().length > 0).length
    const avgSentenceLength = totalWords / sentences.length

    console.log("📊 Readability stats:", { totalWords, sentences: sentences.length, avgSentenceLength })

    let score = 100

    // Penalize very long sentences (>25 words)
    if (avgSentenceLength > 25) score -= 20
    else if (avgSentenceLength > 20) score -= 10

    // Penalize very short sentences (<8 words)
    if (avgSentenceLength < 8) score -= 15

    // Check for bullet points (good for readability)
    const bulletPoints = (allText.match(/•|\*|-/g) || []).length
    if (bulletPoints > 5) score += 10

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Calculate Content Quality Score
   */
  static calculateContentQuality(cvData: CVData): ContentQuality {
    console.log("🔍 CVScoringService.calculateContentQuality called")

    const allText = this.extractAllText(cvData)
    console.log("📄 Content quality text length:", allText.length)
    console.log("📄 Content quality text preview:", allText.substring(0, 200) + "...")

    const grammar = this.analyzeGrammar(allText)
    const impact = this.analyzeImpact(cvData)
    const clarity = this.analyzeClarity(allText)

    const overall = Math.round((grammar.score + impact.score + clarity.score) / 3)

    console.log("✅ Content quality calculated:", {
      overall,
      grammar: grammar.score,
      impact: impact.score,
      clarity: clarity.score,
    })

    return {
      overall,
      grammar,
      impact,
      clarity,
    }
  }

  /**
   * Analyze impact and achievement focus
   */
  private static analyzeImpact(cvData: CVData) {
    let score = 100
    const weakVerbs: string[] = []
    const missingQuantification: string[] = []
    let passiveVoiceCount = 0

    console.log("🔍 Analyzing impact for experience entries:", cvData.experience?.length || 0)

    // Check experience descriptions for weak verbs
    cvData.experience?.forEach((exp, index) => {
      console.log(`📝 Experience ${index + 1}:`, exp.title, "Description length:", exp.description?.length || 0)

      if (exp.description) {
        // Remove this line: const words = exp.description.toLowerCase().split(/\s+/)

        // Check for weak verbs
        Object.keys(WEAK_TO_STRONG_VERBS).forEach((weakVerb) => {
          if (exp.description!.toLowerCase().includes(weakVerb)) {
            weakVerbs.push(weakVerb)
            score -= 5
          }
        })

        // Check for quantification
        const hasNumbers = /\d/.test(exp.description)
        const hasPercentage = /%/.test(exp.description)
        const hasCurrency = /\$|£|€/.test(exp.description)

        if (!hasNumbers && !hasPercentage && !hasCurrency) {
          missingQuantification.push(exp.title || "Experience item")
          score -= 10
        }

        // Basic passive voice detection
        const passiveIndicators = ["was", "were", "been", "being"]
        passiveIndicators.forEach((indicator) => {
          if (exp.description!.toLowerCase().includes(indicator)) {
            passiveVoiceCount++
          }
        })
      }
    })

    if (passiveVoiceCount > 3) score -= 15

    console.log("📊 Impact analysis results:", {
      score,
      weakVerbs: weakVerbs.length,
      missingQuantification: missingQuantification.length,
      passiveVoiceCount,
    })

    return {
      score: Math.max(0, score),
      weakVerbs: [...new Set(weakVerbs)],
      missingQuantification,
      passiveVoiceCount,
    }
  }

  /**
   * Analyze grammar (basic implementation)
   */
  private static analyzeGrammar(text: string) {
    const issues: GrammarIssue[] = []
    let score = 100

    console.log("🔍 Analyzing grammar for text length:", text.length)

    if (!text || text.trim().length === 0) {
      console.log("⚠️ No text provided for grammar analysis")
      return { score: 0, issues: [] }
    }

    // Basic grammar checks
    const commonErrors = [
      { pattern: /\bi\s/gi, error: 'Lowercase "i"', suggestion: 'Use "I"' },
      { pattern: /\s{2,}/g, error: "Multiple spaces", suggestion: "Use single spaces" },
      { pattern: /[.!?]\s*[a-z]/g, error: "Sentence not capitalized", suggestion: "Capitalize after periods" },
      // Add check for obvious typos (sequences of consonants without vowels)
      { pattern: /\b[bcdfghjklmnpqrstvwxyz]{4,}\b/gi, error: "Possible typo", suggestion: "Check spelling" },
      // Check for repeated characters
      { pattern: /(.)\1{3,}/g, error: "Repeated characters", suggestion: "Check for typos" },
    ]

    commonErrors.forEach((errorConfig) => {
      const matches = text.match(errorConfig.pattern)
      if (matches) {
        matches.forEach((match) => {
          issues.push({
            text: match.trim(),
            suggestion: errorConfig.suggestion,
            type: "grammar" as const,
            severity: "warning" as const,
            position: text.indexOf(match),
          })
        })
        score -= Math.min(matches.length * 5, 20)
      }
    })

    console.log("📊 Grammar analysis results:", { score, issues: issues.length })
    if (issues.length > 0) {
      console.log(
        "🔍 Grammar issues found:",
        issues.map((i) => i.text),
      )
    }

    return {
      score: Math.max(0, score),
      issues,
    }
  }

  /**
   * Analyze clarity and readability
   */
  private static analyzeClarity(text: string) {
    if (!text || text.trim().length === 0) {
      console.log("⚠️ No text provided for clarity analysis")
      return {
        score: 0,
        avgSentenceLength: 0,
        readabilityGrade: 0,
        jargonLevel: "Low" as const,
      }
    }

    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    const words = text.split(/\s+/).filter((w) => w.length > 0)

    const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0

    // Simple readability score (Flesch-like)
    const avgWordsPerSentence = avgSentenceLength
    const avgSyllablesPerWord = this.estimateSyllables(text) / words.length

    const readabilityGrade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59

    let score = 100

    // Penalize if too complex (grade level > 12)
    if (readabilityGrade > 12) score -= 20
    else if (readabilityGrade > 10) score -= 10

    // Check for jargon level
    const jargonWords = this.countJargonWords(text)
    const jargonRatio = jargonWords / words.length

    let jargonLevel: "Low" | "Medium" | "High" = "Low"
    if (jargonRatio > 0.1) {
      jargonLevel = "High"
      score -= 15
    } else if (jargonRatio > 0.05) {
      jargonLevel = "Medium"
      score -= 5
    }

    console.log("📊 Clarity analysis results:", {
      score,
      avgSentenceLength,
      readabilityGrade,
      jargonLevel,
      words: words.length,
    })

    return {
      score: Math.max(0, score),
      avgSentenceLength: Math.round(avgSentenceLength),
      readabilityGrade: Math.round(readabilityGrade),
      jargonLevel,
    }
  }

  /**
   * Helper methods
   */
  private static extractAllText(cvData: CVData): string {
    let text = ""

    console.log("🔍 Extracting text from CV data...")

    // Personal info
    if (cvData.personalInfo) {
      const personal = cvData.personalInfo
      text += `${personal.name || ""} `
      text += `${personal.title || ""} `
      text += `${personal.email || ""} `
      text += `${personal.phone || ""} `
      text += `${personal.location || ""} `
      text += `${personal.summary || ""} `
      text += `${personal.linkedin || ""} `
      text += `${personal.website || ""} `

      console.log("📋 Personal info extracted:", text.length, "characters")
    }

    // Experience
    if (cvData.experience && Array.isArray(cvData.experience)) {
      cvData.experience.forEach((exp, index) => {
        text += `${exp.title || ""} `
        text += `${exp.company || ""} `
        text += `${exp.location || ""} `
        text += `${exp.description || ""} `

        console.log(
          `💼 Experience ${index + 1} extracted:`,
          exp.title,
          "Description:",
          exp.description?.substring(0, 50) + "...",
        )
      })
    }

    // Education
    if (cvData.education && Array.isArray(cvData.education)) {
      cvData.education.forEach((edu, index) => {
        text += `${edu.degree || ""} `
        text += `${edu.institution || ""} `
        text += `${edu.location || ""} `
        text += `${edu.description || ""} `

        console.log(`🎓 Education ${index + 1} extracted:`, edu.degree)
      })
    }

    // Skills
    if (cvData.skills && Array.isArray(cvData.skills)) {
      text += cvData.skills.join(" ") + " "
      console.log("🛠️ Skills extracted:", cvData.skills.length, "skills")
    }

    // Certifications
    if (cvData.certifications && Array.isArray(cvData.certifications)) {
      cvData.certifications.forEach((cert, index) => {
        text += `${cert.name || ""} `
        text += `${cert.issuer || ""} `
        text += `${cert.description || ""} `

        console.log(`🏆 Certification ${index + 1} extracted:`, cert.name)
      })
    }

    const finalText = text.trim()
    console.log("✅ Total text extracted:", finalText.length, "characters")
    console.log("📄 Text preview:", finalText.substring(0, 200) + "...")

    return finalText
  }

  private static hasStandardSections(cvData: CVData): boolean {
    return !!(
      cvData.personalInfo?.name &&
      cvData.experience?.length > 0 &&
      cvData.education?.length > 0 &&
      cvData.skills?.length > 0
    )
  }

  private static extractKeywords(text: string): string[] {
    // Simple keyword extraction - in production, use more sophisticated NLP
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3)

    // Remove common words
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

    return words.filter((word) => !stopWords.includes(word))
  }

  private static estimateSyllables(text: string): number {
    // Simple syllable estimation
    const words = text.toLowerCase().split(/\s+/)
    let syllables = 0

    words.forEach((word) => {
      const vowels = word.match(/[aeiouy]+/g)
      syllables += vowels ? vowels.length : 1
    })

    return syllables
  }

  private static countJargonWords(text: string): number {
    // Simple jargon detection - words longer than 12 characters
    const words = text.split(/\s+/)
    return words.filter((word) => word.length > 12).length
  }

  /**
   * Generate ATS recommendations
   */
  private static generateATSRecommendations(
    scores: { formatting: number; keywords: number; structure: number; readability: number; fileFormat: number },
    industry: string,
  ): string[] {
    const recommendations = []

    if (scores.formatting < 80) {
      recommendations.push("Simplify formatting - avoid tables, graphics, and special characters")
      recommendations.push("Use standard bullet points (• or -) instead of fancy symbols")
    }

    if (scores.keywords < 70) {
      recommendations.push("Include more job-relevant keywords from the job description")
      const industryTerms = INDUSTRY_RULES[industry]?.preferredTerms || []
      if (industryTerms.length > 0) {
        recommendations.push(`Add industry-specific terms: ${industryTerms.slice(0, 3).join(", ")}`)
      }
    }

    if (scores.structure < 75) {
      recommendations.push("Ensure all standard sections are present: Contact, Summary, Experience, Education, Skills")
      recommendations.push("Add a professional summary at the top of your CV")
    }

    if (scores.readability < 80) {
      recommendations.push("Use shorter sentences and bullet points for better readability")
      recommendations.push("Break up long paragraphs into digestible chunks")
    }

    return recommendations
  }
}
