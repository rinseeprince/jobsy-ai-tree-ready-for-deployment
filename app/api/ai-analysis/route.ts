import { type NextRequest, NextResponse } from "next/server"
import type { CVData } from "@/lib/cv-templates"

interface AnalysisRequest {
  cvData: CVData
  analysisTypes: string[]
  jobDescription?: string
  industry?: string
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

interface ExperienceSection {
  index: number
  title: string
  company: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  sentences: string[]
  achievements: string[]
  nonAchievements: string[]
}

let validatedResults: Record<string, unknown> = {}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("🔍 Enhanced AI Analysis API called")

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OpenAI API key not configured")
      return NextResponse.json(
        {
          success: false,
          error: "OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.",
        },
        { status: 500 },
      )
    }

    const body: AnalysisRequest = await request.json()
    const { cvData, jobDescription, industry = "technology" } = body

    console.log("📋 Received CV data for enhanced analysis:", {
      name: cvData.personalInfo?.name,
      experienceCount: cvData.experience?.length,
      skillsCount: cvData.skills?.length,
    })

    // Parse ALL experience sections comprehensively
    const allExperienceSections = parseAllExperienceSections(cvData)
    console.log("📄 Parsed ALL experience sections:", {
      totalSections: allExperienceSections.length,
      totalSentences: allExperienceSections.reduce((sum, exp) => sum + exp.sentences.length, 0),
      totalAchievements: allExperienceSections.reduce((sum, exp) => sum + exp.achievements.length, 0),
      totalNonAchievements: allExperienceSections.reduce((sum, exp) => sum + exp.nonAchievements.length, 0),
    })

    if (allExperienceSections.length === 0) {
      return NextResponse.json({
        success: false,
        error: "CV content is too short for meaningful analysis. Please add more details to your CV.",
      })
    }

    // Enhanced analysis prompt covering ALL experiences
    const analysisPrompt = createComprehensiveAnalysisPrompt(allExperienceSections, cvData, jobDescription, industry)

    console.log("🤖 Sending comprehensive request to OpenAI GPT-4o...")

    // Use GPT-4o for better context understanding with increased token limit
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a senior executive recruiter and ATS optimization expert with 15+ years of experience. 

CRITICAL ANALYSIS REQUIREMENTS:
1. ANALYZE ALL WORK EXPERIENCE SECTIONS - not just the first one
2. Provide recommendations for EVERY experience that has improvement opportunities
3. Focus on ATS scoring improvements across ALL sections
4. Identify keyword gaps across ALL experiences
5. Ensure contextual relevance for each specific role
6. Maintain variety - no repetitive recommendations across experiences
7. NEVER suggest changes that make language more repetitive or boring
8. Preserve all quantified achievements (numbers, percentages, revenue figures)
9. Provide unlimited recommendations as long as they genuinely improve ATS scores

You must analyze EVERY experience section and return comprehensive recommendations.`,
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        temperature: 0.15, // Very low for consistent analysis
        max_tokens: 8000, // Increased significantly for comprehensive analysis
      }),
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error("❌ OpenAI API error:", errorText)
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${errorText}`)
    }

    const completion: OpenAIResponse = await openaiResponse.json()
    const analysisText = completion.choices[0]?.message?.content
    console.log("🤖 OpenAI response received, length:", analysisText?.length)

    if (!analysisText) {
      throw new Error("No response from OpenAI")
    }

    // Parse the JSON response
    let analysisResults: Record<string, unknown>
    try {
      const cleanedResponse = analysisText.replace(/```json\n?|\n?```/g, "").trim()
      analysisResults = JSON.parse(cleanedResponse)
      console.log("✅ Successfully parsed comprehensive OpenAI analysis")
    } catch (parseError) {
      console.error("❌ Failed to parse OpenAI response:", parseError)
      console.log("Raw response:", analysisText)
      throw new Error("Failed to parse analysis results")
    }

    // Calculate accurate word count
    const wordCount = calculateAccurateWordCount(cvData)

    // Override word count in results
    if (analysisResults.lengthAnalysis) {
      const lengthAnalysis = analysisResults.lengthAnalysis as Record<string, unknown>
      lengthAnalysis.wordCount = wordCount
      lengthAnalysis.pageEstimate = Math.ceil(wordCount / 250)
      lengthAnalysis.isOptimal = wordCount >= 200 && wordCount <= 600

      // Update recommendation based on actual word count
      if (wordCount < 200) {
        lengthAnalysis.recommendation = "Your CV is too short. Add more details to reach 200-600 words."
      } else if (wordCount > 600) {
        lengthAnalysis.recommendation =
          "Your CV is quite long. Consider condensing to 400-600 words for optimal impact."
      } else {
        lengthAnalysis.recommendation = "Your CV length is optimal for most positions."
      }
    }

    // Apply quality control to filter out poor suggestions while preserving comprehensive analysis
    validatedResults = validateAndEnhanceComprehensiveResults(analysisResults, allExperienceSections)

    // Also override in the validated results to be sure
    if (validatedResults.lengthAnalysis) {
      const lengthAnalysis = validatedResults.lengthAnalysis as Record<string, unknown>
      lengthAnalysis.wordCount = wordCount
      lengthAnalysis.pageEstimate = Math.ceil(wordCount / 250)
    }

    console.log("📊 Comprehensive analysis completed successfully:", {
      atsScore: (validatedResults.atsScore as Record<string, unknown>)?.overall,
      contentQuality: (validatedResults.contentQuality as Record<string, unknown>)?.overall,
      wordCount: (validatedResults.lengthAnalysis as Record<string, unknown>)?.wordCount,
      totalWeakVerbs: ((validatedResults.contentQuality as Record<string, unknown>)?.impact as Record<string, unknown>)
        ?.weakVerbs as unknown[],
      totalQuantificationOpportunities: (
        (validatedResults.contentQuality as Record<string, unknown>)?.impact as Record<string, unknown>
      )?.missingQuantification as unknown[],
      totalMissingKeywords: (validatedResults.industryFit as Record<string, unknown>)?.missingKeywords as unknown[],
      experienceSectionsAnalyzed: allExperienceSections.length,
    })

    return NextResponse.json({
      success: true,
      results: validatedResults,
    })
  } catch (error) {
    console.error("❌ Comprehensive analysis error:", error)
    const errorMessage = error instanceof Error ? error.message : "Analysis failed"
    return NextResponse.json(
      {
        success: false,
        error: `Analysis failed: ${errorMessage}`,
      },
      { status: 500 },
    )
  }
}

function parseAllExperienceSections(cvData: CVData): ExperienceSection[] {
  const experienceSections: ExperienceSection[] = []

  console.log("🔍 Parsing ALL experience sections comprehensively...")

  cvData.experience?.forEach((exp, expIndex) => {
    if (exp.description && exp.description.trim().length > 0) {
      const description = exp.description.trim()

      // Split into sentences more accurately
      const sentences = description
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 10)

      // Categorize sentences as achievements vs non-achievements
      const achievements: string[] = []
      const nonAchievements: string[] = []

      sentences.forEach((sentence) => {
        // More comprehensive achievement detection
        const isAchievement =
          /(\d+%|\$\d+|£\d+|€\d+|\d+k|\d+m|\d+\+|\d+ months?|\d+ years?|increased|improved|achieved|generated|saved|reduced|grew|exceeded|delivered|drove|led to|resulted in|boosted|enhanced|optimized|streamlined|accelerated)/i.test(
            sentence,
          )

        if (isAchievement) {
          achievements.push(sentence)
        } else {
          nonAchievements.push(sentence)
        }
      })

      experienceSections.push({
        index: expIndex,
        title: exp.title || "",
        company: exp.company || "",
        location: exp.location || "",
        startDate: exp.startDate || "",
        endDate: exp.endDate || "",
        current: exp.current || false,
        description,
        sentences,
        achievements,
        nonAchievements,
      })

      console.log(`📊 Experience ${expIndex + 1} (${exp.title} at ${exp.company}):`)
      console.log(`   - Total sentences: ${sentences.length}`)
      console.log(`   - Achievements: ${achievements.length}`)
      console.log(`   - Non-achievements: ${nonAchievements.length}`)
    }
  })

  return experienceSections
}

function createComprehensiveAnalysisPrompt(
  allExperiences: ExperienceSection[],
  cvData: CVData,
  jobDescription?: string,
  industry = "technology",
) {
  // Build detailed analysis for each experience section
  const experienceAnalysis = allExperiences
    .map(
      (exp, index) => `
EXPERIENCE SECTION ${index + 1}:
Position: ${exp.title}
Company: ${exp.company}
Duration: ${exp.startDate} - ${exp.current ? "Present" : exp.endDate}

ACHIEVEMENT SENTENCES (PRESERVE THESE - ALREADY STRONG):
${exp.achievements.map((achievement) => `- ${achievement}`).join("\n")}

NON-ACHIEVEMENT SENTENCES (ANALYZE FOR IMPROVEMENTS):
${exp.nonAchievements.map((sentence) => `- ${sentence}`).join("\n")}

FULL DESCRIPTION:
${exp.description}
`,
    )
    .join("\n" + "=".repeat(80) + "\n")

  const professionalSummary = cvData.personalInfo?.summary || ""
  const skills = cvData.skills?.join(", ") || ""

  return `
COMPREHENSIVE CV ANALYSIS - ALL EXPERIENCE SECTIONS

PROFESSIONAL SUMMARY:
${professionalSummary}

SKILLS:
${skills}

${experienceAnalysis}

${jobDescription ? `TARGET JOB DESCRIPTION: ${jobDescription}` : ""}
INDUSTRY: ${industry}

COMPREHENSIVE ANALYSIS REQUIREMENTS:

1. ATS SCORING IMPROVEMENTS:
   - Analyze EVERY experience section for ATS optimization opportunities
   - Identify missing industry keywords across ALL experiences
   - Suggest improvements to increase keyword density and relevance
   - Ensure proper formatting and structure recommendations

2. KEYWORD TARGETING:
   - Identify missing keywords specific to each role and the target industry
   - Suggest natural integration of relevant keywords
   - Ensure keyword variety across different experience sections
   - Match keywords to the target job description if provided

3. CONTEXTUAL RELEVANCE:
   - Provide role-specific improvements for each experience
   - Ensure suggestions are relevant to the specific position and company
   - Consider career progression and skill development
   - Maintain consistency with overall professional narrative

4. VARIETY AND NON-REPETITION:
   - Use different action verbs across experiences
   - Vary sentence structures and improvement approaches
   - Ensure each experience section has unique, tailored recommendations
   - Avoid repetitive language patterns

ANALYSIS INSTRUCTIONS:
1. ANALYZE ALL ${allExperiences.length} EXPERIENCE SECTIONS - provide recommendations for each one that needs improvement
2. For each experience, identify specific weak verbs and improvement opportunities
3. Suggest missing quantification opportunities across all experiences
4. Identify industry keywords missing from each relevant experience
5. Provide grammar and clarity improvements where needed
6. Ensure recommendations are unlimited but high-quality
7. Focus on genuine ATS score improvements
8. Maintain professional variety and engagement

Provide comprehensive analysis in this EXACT JSON format:

{
  "atsScore": {
    "overall": <number 0-100>,
    "breakdown": {
      "formatting": <number 0-100>,
      "keywords": <number 0-100>,
      "structure": <number 0-100>,
      "readability": <number 0-100>,
      "fileFormat": 85
    },
    "recommendations": [
      "Comprehensive ATS improvement recommendations covering all experiences"
    ],
    "passRate": "<High|Medium|Low>"
  },
  "contentQuality": {
    "overall": <number 0-100>,
    "grammar": {
      "score": <number 0-100>,
      "issues": [
        {
          "type": "grammar|spelling|punctuation",
          "originalText": "EXACT text with error",
          "correctedText": "EXACT corrected version",
          "message": "Description of error",
          "suggestion": "How to fix",
          "severity": "high|medium|low",
          "location": "Specific experience section and company"
        }
      ]
    },
    "impact": {
      "score": <number 0-100>,
      "weakVerbs": [
        {
          "verb": "exact weak verb found",
          "originalSentence": "COMPLETE EXACT sentence from specific experience",
          "improvedSentence": "COMPLETE improved sentence with strong, unique action verb",
          "location": "EXACT job title and company where found",
          "improvementReason": "Why this change increases ATS score and impact",
          "experienceIndex": <number indicating which experience section>
        }
      ],
      "missingQuantification": [
        {
          "originalText": "EXACT text needing quantification",
          "suggestedText": "EXACT suggested quantified version with realistic metrics",
          "location": "EXACT job title and company",
          "metricType": "percentage|number|timeframe|currency|volume",
          "experienceIndex": <number indicating which experience section>
        }
      ],
      "passiveVoiceCount": <number>,
      "passiveVoiceExamples": [
        {
          "originalText": "EXACT passive voice sentence",
          "improvedText": "EXACT active voice version",
          "location": "Specific experience section",
          "experienceIndex": <number>
        }
      ]
    },
    "clarity": {
      "score": <number 0-100>,
      "avgSentenceLength": <number>,
      "readabilityScore": <number>,
      "improvementSuggestions": [
        {
          "issue": "Specific clarity issue",
          "originalText": "EXACT problematic text",
          "improvedText": "EXACT improved version",
          "location": "Specific experience section",
          "experienceIndex": <number>
        }
      ]
    }
  },
  "lengthAnalysis": {
    "wordCount": 0,
    "pageEstimate": 0,
    "recommendation": "Length recommendation",
    "isOptimal": false,
    "sectionsAnalysis": {
      "tooLong": ["specific experience sections that are too verbose"],
      "tooShort": ["specific experience sections that need more detail"],
      "suggestions": ["specific suggestions for each experience section"]
    }
  },
  "industryFit": {
    "score": <number 0-100>,
    "matchedKeywords": [
      {
        "keyword": "found keyword",
        "context": "where it appears in which experience",
        "relevance": "why it's valuable for ATS",
        "experienceIndex": <number>
      }
    ],
    "missingKeywords": [
      {
        "keyword": "missing keyword critical for ATS",
        "importance": "why important for industry and ATS scoring",
        "suggestedPlacement": "which specific experience section to add to",
        "exampleUsage": "how to integrate naturally into that experience",
        "experienceIndex": <number indicating suggested placement>
      }
    ],
    "recommendations": [
      "Industry-specific recommendations for each relevant experience section"
    ]
  }
}

CRITICAL REQUIREMENTS:
1. Analyze ALL ${allExperiences.length} experience sections - not just the first one
2. Provide unlimited recommendations as long as they genuinely improve ATS scores
3. Ensure each experience section gets appropriate analysis and recommendations
4. Maintain variety across recommendations - no repetitive patterns
5. Focus on contextual relevance for each specific role
6. Preserve all quantified achievements
7. Include experienceIndex in all recommendations to identify which section they apply to
`
}

function calculateAccurateWordCount(cvData: CVData): number {
  let text = ""

  // Extract all meaningful text
  if (cvData.personalInfo) {
    const personal = cvData.personalInfo
    text +=
      [personal.name, personal.title, personal.summary, personal.email, personal.phone, personal.location]
        .filter(Boolean)
        .join(" ") + " "
  }

  if (cvData.experience?.length) {
    cvData.experience.forEach((exp) => {
      text += [exp.title, exp.company, exp.location, exp.description].filter(Boolean).join(" ") + " "
    })
  }

  if (cvData.education?.length) {
    cvData.education.forEach((edu) => {
      text += [edu.degree, edu.institution, edu.location, edu.description].filter(Boolean).join(" ") + " "
    })
  }

  if (cvData.skills?.length) {
    text += cvData.skills.join(" ") + " "
  }

  if (cvData.certifications?.length) {
    cvData.certifications.forEach((cert) => {
      text += [cert.name, cert.issuer, cert.description].filter(Boolean).join(" ") + " "
    })
  }

  console.log("📄 Extracted CV text with sections:", text.substring(0, 500) + "...")
  console.log("📊 Total text length:", text.length)

  return text
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.trim().length > 0).length
}

function validateAndEnhanceComprehensiveResults(
  results: Record<string, unknown>,
  allExperiences: ExperienceSection[],
): Record<string, unknown> {
  // Enhanced validation for comprehensive analysis
  if (results.contentQuality && typeof results.contentQuality === "object") {
    const contentQuality = results.contentQuality as Record<string, unknown>
    if (contentQuality.impact && typeof contentQuality.impact === "object") {
      const impact = contentQuality.impact as Record<string, unknown>

      // Validate weak verbs against ALL experience sections
      if (Array.isArray(impact.weakVerbs)) {
        // Track used verbs per experience to prevent repetition within each section
        const usedVerbsByExperience = new Map<number, Set<string>>()

        // Filter and enhance weak verb suggestions
        impact.weakVerbs = impact.weakVerbs
          .filter((item: unknown) => {
            if (typeof item === "object" && item !== null) {
              const weakVerb = item as Record<string, unknown>
              const originalSentence = weakVerb.originalSentence as string
              const improvedSentence = weakVerb.improvedSentence as string
              const experienceIndex = (weakVerb.experienceIndex as number) || 0

              // Initialize tracking for this experience if needed
              if (!usedVerbsByExperience.has(experienceIndex)) {
                usedVerbsByExperience.set(experienceIndex, new Set<string>())
              }

              const usedVerbs = usedVerbsByExperience.get(experienceIndex)!

              // Check if this sentence exists in the specified experience and is not an achievement
              const targetExperience = allExperiences[experienceIndex]
              if (!targetExperience) return false

              const foundInAchievements = targetExperience.achievements.some((achievement) =>
                achievement.toLowerCase().includes(originalSentence?.toLowerCase() || ""),
              )

              // Skip if it's a strong achievement
              if (foundInAchievements) return false

              // Extract the main verb from the improved sentence
              const mainVerbMatch = improvedSentence?.match(/(?:I |^)(\w+)/) || []
              const mainVerb = mainVerbMatch[1]?.toLowerCase()

              // Allow some repetition across different experiences, but limit within same experience
              if (mainVerb && usedVerbs.has(mainVerb)) {
                // Allow if it's a different experience and the verb is commonly needed
                const commonVerbs = ["led", "managed", "developed", "implemented", "created", "improved"]
                if (!commonVerbs.includes(mainVerb)) {
                  return false
                }
              }

              // Skip if the improvement is minimal
              if (
                originalSentence &&
                improvedSentence &&
                originalSentence.replace(/(?:I |^)\w+/, "").trim() ===
                  improvedSentence.replace(/(?:I |^)\w+/, "").trim()
              ) {
                return false
              }

              // Add the verb to our tracking set for this experience
              if (mainVerb) usedVerbs.add(mainVerb)

              return true
            }
            return false
          })
          .map((item: unknown) => {
            // Add improvement reason if missing
            if (typeof item === "object" && item !== null) {
              const weakVerb = item as Record<string, unknown>
              if (!weakVerb.improvementReason) {
                weakVerb.improvementReason = "Replaces generic language with more impactful, ATS-optimized action verb"
              }
            }
            return item
          })
      }

      // Validate missing quantification opportunities
      if (Array.isArray(impact.missingQuantification)) {
        impact.missingQuantification = impact.missingQuantification.filter((item: unknown) => {
          if (typeof item === "object" && item !== null) {
            const quantItem = item as Record<string, unknown>
            const experienceIndex = (quantItem.experienceIndex as number) || 0
            const targetExperience = allExperiences[experienceIndex]

            // Ensure the suggestion is for a valid experience
            return targetExperience !== undefined
          }
          return false
        })
      }
    }
  }

  // Validate industry fit recommendations
  if (results.industryFit && typeof results.industryFit === "object") {
    const industryFit = results.industryFit as Record<string, unknown>

    if (Array.isArray(industryFit.missingKeywords)) {
      industryFit.missingKeywords = industryFit.missingKeywords.filter((item: unknown) => {
        if (typeof item === "object" && item !== null) {
          const keywordItem = item as Record<string, unknown>
          const experienceIndex = (keywordItem.experienceIndex as number) || 0
          const targetExperience = allExperiences[experienceIndex]

          // Ensure the suggestion is for a valid experience
          return targetExperience !== undefined
        }
        return false
      })
    }
  }

  // Provide defaults for any missing fields
  return {
    atsScore: {
      overall: (results.atsScore as Record<string, unknown>)?.overall || 0,
      breakdown: {
        formatting:
          ((results.atsScore as Record<string, unknown>)?.breakdown as Record<string, unknown>)?.formatting || 0,
        keywords: ((results.atsScore as Record<string, unknown>)?.breakdown as Record<string, unknown>)?.keywords || 0,
        structure:
          ((results.atsScore as Record<string, unknown>)?.breakdown as Record<string, unknown>)?.structure || 0,
        readability:
          ((results.atsScore as Record<string, unknown>)?.breakdown as Record<string, unknown>)?.readability || 0,
        fileFormat:
          ((results.atsScore as Record<string, unknown>)?.breakdown as Record<string, unknown>)?.fileFormat || 85,
      },
      recommendations: (results.atsScore as Record<string, unknown>)?.recommendations || [],
      passRate: (results.atsScore as Record<string, unknown>)?.passRate || "Low",
    },
    contentQuality: {
      overall: (results.contentQuality as Record<string, unknown>)?.overall || 0,
      grammar: {
        score: ((results.contentQuality as Record<string, unknown>)?.grammar as Record<string, unknown>)?.score || 0,
        issues: ((results.contentQuality as Record<string, unknown>)?.grammar as Record<string, unknown>)?.issues || [],
      },
      impact: {
        score: ((results.contentQuality as Record<string, unknown>)?.impact as Record<string, unknown>)?.score || 0,
        weakVerbs:
          ((results.contentQuality as Record<string, unknown>)?.impact as Record<string, unknown>)?.weakVerbs || [],
        missingQuantification:
          ((results.contentQuality as Record<string, unknown>)?.impact as Record<string, unknown>)
            ?.missingQuantification || [],
        passiveVoiceCount:
          ((results.contentQuality as Record<string, unknown>)?.impact as Record<string, unknown>)?.passiveVoiceCount ||
          0,
        passiveVoiceExamples:
          ((results.contentQuality as Record<string, unknown>)?.impact as Record<string, unknown>)
            ?.passiveVoiceExamples || [],
      },
      clarity: {
        score: ((results.contentQuality as Record<string, unknown>)?.clarity as Record<string, unknown>)?.score || 0,
        avgSentenceLength:
          ((results.contentQuality as Record<string, unknown>)?.clarity as Record<string, unknown>)
            ?.avgSentenceLength || 0,
        readabilityScore:
          ((results.contentQuality as Record<string, unknown>)?.clarity as Record<string, unknown>)?.readabilityScore ||
          0,
        improvementSuggestions:
          ((results.contentQuality as Record<string, unknown>)?.clarity as Record<string, unknown>)
            ?.improvementSuggestions || [],
      },
    },
    lengthAnalysis: {
      wordCount: (results.lengthAnalysis as Record<string, unknown>)?.wordCount || 0,
      pageEstimate: (results.lengthAnalysis as Record<string, unknown>)?.pageEstimate || 0,
      recommendation:
        (results.lengthAnalysis as Record<string, unknown>)?.recommendation || "Add more content to your CV",
      isOptimal: (results.lengthAnalysis as Record<string, unknown>)?.isOptimal || false,
      sectionsAnalysis: (results.lengthAnalysis as Record<string, unknown>)?.sectionsAnalysis || {
        tooLong: [],
        tooShort: [],
        suggestions: [],
      },
    },
    industryFit: {
      score: (results.industryFit as Record<string, unknown>)?.score || 0,
      matchedKeywords: (results.industryFit as Record<string, unknown>)?.matchedKeywords || [],
      missingKeywords: (results.industryFit as Record<string, unknown>)?.missingKeywords || [],
      recommendations: (results.industryFit as Record<string, unknown>)?.recommendations || [],
    },
  }
}
