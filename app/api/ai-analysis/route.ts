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

let validatedResults: Record<string, unknown> = {}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log("🔍 AI Analysis API called")

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

    console.log("📋 Received CV data for analysis:", {
      name: cvData.personalInfo?.name,
      experienceCount: cvData.experience?.length,
      skillsCount: cvData.skills?.length,
    })

    // Extract all text from CV
    const cvText = extractCVText(cvData)
    console.log("📄 Extracted CV text length:", cvText.length)
    console.log("📄 CV text preview:", cvText.substring(0, 200) + "...")

    // Improved word counting
    const words = cvText
      .replace(/[^\w\s]/g, " ") // Replace punctuation with spaces
      .split(/\s+/) // Split on whitespace
      .filter((word) => word.trim().length > 0) // Filter out empty strings

    console.log("📊 Actual word count:", words.length)
    console.log("📊 First 10 words:", words.slice(0, 10))

    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json({
        success: false,
        error: "CV content is too short for meaningful analysis. Please add more details to your CV.",
      })
    }

    // Create comprehensive analysis prompt with specific examples
    const analysisPrompt = `
You are an expert CV/Resume analyst and ATS specialist. Analyze the following CV and provide EXTREMELY COMPREHENSIVE and DETAILED feedback. I want you to find EVERY POSSIBLE improvement across ALL sections.

CV CONTENT:
${cvText}

${jobDescription ? `JOB DESCRIPTION: ${jobDescription}` : ""}

INDUSTRY: ${industry}

CRITICAL ANALYSIS REQUIREMENTS:
1. EXAMINE EVERY SINGLE SENTENCE in the professional summary and ALL work experience descriptions
2. IDENTIFY ALL weak verbs, passive voice, and non-action words throughout the ENTIRE CV
3. FIND ALL opportunities for quantification (numbers, percentages, timeframes, currency) in EVERY experience entry
4. ANALYZE ALL industry keywords that should be present vs. what's actually there
5. CHECK EVERY sentence for grammar, spelling, and punctuation errors
6. LOOK FOR ALL opportunities to make statements more impactful and specific
7. Be EXHAUSTIVE - don't miss anything, analyze every word and phrase

COMPREHENSIVE ANALYSIS INSTRUCTIONS:
- Go through EACH work experience entry individually and find ALL issues
- Examine the professional summary word by word for improvements
- Look for weak verbs like: involved, responsible for, worked on, helped, did, made, got, was, had, used, tried, participated, assisted, supported, handled, dealt with, managed (when vague), coordinated, organized, contributed, collaborated
- Find ALL statements that lack specific metrics, numbers, percentages, timeframes, or results
- Identify ALL missing industry-specific keywords and technical terms
- Check for ALL grammar issues including: comma splices, run-on sentences, incorrect punctuation, capitalization errors, subject-verb disagreement, tense inconsistencies

Please provide a comprehensive analysis in the following JSON format:

{
  "atsScore": {
    "overall": <number 0-100>,
    "breakdown": {
      "formatting": <number 0-100>,
      "keywords": <number 0-100>,
      "structure": <number 0-100>,
      "readability": <number 0-100>,
      "fileFormat": <number 0-100>
    },
    "recommendations": [
      "SPECIFIC ATS improvement with exact changes needed",
      "Another specific recommendation with exact action"
    ],
    "passRate": "<High|Medium|Low>"
  },
  "contentQuality": {
    "overall": <number 0-100>,
    "grammar": {
      "score": <number 0-100>,
      "issues": [
        {
          "type": "grammar|spelling|punctuation|capitalization|tense",
          "originalText": "EXACT text from CV with the error",
          "correctedText": "EXACT corrected version",
          "message": "Specific description of the error",
          "suggestion": "Exact fix to apply",
          "severity": "high|medium|low",
          "location": "Exact section name where this appears"
        }
      ]
    },
    "impact": {
      "score": <number 0-100>,
      "weakVerbs": [
        {
          "verb": "exact weak verb found",
          "originalSentence": "EXACT complete sentence containing weak verb",
          "improvedSentence": "EXACT improved sentence with strong action verb and more impact",
          "location": "Exact section/job title where this appears"
        }
      ],
      "missingQuantification": [
        {
          "originalText": "EXACT text that needs quantification",
          "suggestedText": "EXACT suggested text with specific realistic metrics",
          "location": "Exact section/job title where this appears",
          "metricType": "percentage|number|timeframe|currency|volume"
        }
      ],
      "passiveVoiceCount": <number>,
      "passiveVoiceExamples": [
        {
          "originalText": "EXACT passive voice sentence",
          "improvedText": "EXACT active voice version",
          "location": "Exact section where this appears"
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
          "location": "Exact section"
        }
      ]
    }
  },
  "lengthAnalysis": {
    "wordCount": <actual word count>,
    "pageEstimate": <estimated pages>,
    "recommendation": "<specific length recommendation>",
    "isOptimal": <boolean>,
    "sectionsAnalysis": {
      "tooLong": ["sections that are too verbose"],
      "tooShort": ["sections that need more detail"],
      "suggestions": ["specific suggestions for each section"]
    }
  },
  "industryFit": {
    "score": <number 0-100>,
    "matchedKeywords": [
      {
        "keyword": "exact keyword found",
        "context": "exact sentence where it appears",
        "relevance": "why this keyword is important for the industry"
      }
    ],
    "missingKeywords": [
      {
        "keyword": "exact missing keyword that should be added",
        "importance": "why this keyword is critical for the industry",
        "suggestedPlacement": "exact section where to add it",
        "exampleUsage": "exact sentence showing how to incorporate it naturally"
      }
    ],
    "recommendations": [
      "SPECIFIC industry improvement with exact changes",
      "Another specific recommendation with exact keywords to add"
    ]
  }
}

EXHAUSTIVE ANALYSIS REQUIREMENTS:
1. Find AT LEAST 10-15 weak verbs if the CV has multiple experience entries
2. Identify AT LEAST 5-10 quantification opportunities across all experiences
3. Find AT LEAST 15-20 missing industry keywords for a comprehensive CV
4. Identify ALL grammar and punctuation issues, no matter how minor
5. Provide specific improvements for EVERY work experience description
6. Analyze the professional summary for ALL possible improvements
7. Don't be conservative - find every possible enhancement

EXAMPLE OF COMPREHENSIVE ANALYSIS:
Instead of finding just 1-2 issues, find ALL issues like:
- "Responsible for managing" → "Led and optimized"
- "Worked with clients" → "Collaborated with 50+ enterprise clients"
- "Helped increase sales" → "Drove 25% increase in quarterly sales revenue"
- "Managed projects" → "Successfully delivered 15+ projects worth $2M+ in value"
- Missing keywords: "CRM", "Salesforce", "lead generation", "pipeline management", "revenue optimization", etc.

Be EXTREMELY thorough and comprehensive. Find EVERYTHING that can be improved.
`

    console.log("🤖 Sending enhanced comprehensive request to OpenAI...")

    // Use fetch to call OpenAI API directly
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert CV analyst who provides EXTREMELY COMPREHENSIVE analysis. Find EVERY possible improvement across ALL sections. Be thorough and exhaustive - analyze every sentence, every word choice, every opportunity for enhancement. Provide detailed, specific analysis with exact quotes and corrections in valid JSON format only. Always quote actual text from the CV, never make up examples. Find ALL weak verbs, ALL quantification opportunities, ALL missing keywords, ALL grammar issues.",
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        temperature: 0.1, // Very low temperature for consistent, thorough analysis
        max_tokens: 4000, // Increased for comprehensive response
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
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = analysisText.replace(/```json\n?|\n?```/g, "").trim()
      analysisResults = JSON.parse(cleanedResponse)
      console.log("✅ Successfully parsed comprehensive OpenAI analysis")
    } catch (parseError) {
      console.error("❌ Failed to parse OpenAI response:", parseError)
      console.log("Raw response:", analysisText)
      throw new Error("Failed to parse analysis results")
    }

    // Calculate actual word count from our extracted text
    const wordCount = cvText
      .replace(/[^\w\s]/g, " ") // Replace punctuation with spaces
      .split(/\s+/) // Split on whitespace
      .filter((word) => word.trim().length > 0).length // Filter out empty strings

    console.log("📊 Calculated word count:", wordCount)

    // Override the word count in the analysis results with our accurate calculation
    if (analysisResults.lengthAnalysis) {
      const lengthAnalysis = analysisResults.lengthAnalysis as Record<string, unknown>
      lengthAnalysis.wordCount = wordCount
      lengthAnalysis.pageEstimate = Math.ceil(wordCount / 250) // Estimate pages (250 words per page)
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

    // Also override in the validated results to be sure
    validatedResults = validateAnalysisResults(analysisResults)
    if (validatedResults.lengthAnalysis) {
      const lengthAnalysis = validatedResults.lengthAnalysis as Record<string, unknown>
      lengthAnalysis.wordCount = wordCount
      lengthAnalysis.pageEstimate = Math.ceil(wordCount / 250)
    }

    console.log("📊 Comprehensive analysis completed successfully:", {
      atsScore: (validatedResults.atsScore as Record<string, unknown>)?.overall,
      contentQuality: (validatedResults.contentQuality as Record<string, unknown>)?.overall,
      wordCount: (validatedResults.lengthAnalysis as Record<string, unknown>)?.wordCount,
      grammarIssues: ((validatedResults.contentQuality as Record<string, unknown>)?.grammar as Record<string, unknown>)
        ?.issues as unknown[],
      weakVerbs: ((validatedResults.contentQuality as Record<string, unknown>)?.impact as Record<string, unknown>)
        ?.weakVerbs as unknown[],
      quantificationOpportunities: (
        (validatedResults.contentQuality as Record<string, unknown>)?.impact as Record<string, unknown>
      )?.missingQuantification as unknown[],
      matchedKeywords: (validatedResults.industryFit as Record<string, unknown>)?.matchedKeywords as unknown[],
      missingKeywords: (validatedResults.industryFit as Record<string, unknown>)?.missingKeywords as unknown[],
    })

    return NextResponse.json({
      success: true,
      results: validatedResults,
    })
  } catch (error) {
    console.error("❌ Analysis error:", error)

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

function extractCVText(cvData: CVData): string {
  let text = ""

  // Personal information
  if (cvData.personalInfo) {
    const personal = cvData.personalInfo
    if (personal.name) text += `${personal.name} `
    if (personal.title) text += `${personal.title} `
    if (personal.email) text += `${personal.email} `
    if (personal.phone) text += `${personal.phone} `
    if (personal.location) text += `${personal.location} `
    if (personal.summary) text += `PROFESSIONAL SUMMARY: ${personal.summary} `
    if (personal.linkedin) text += `${personal.linkedin} `
    if (personal.website) text += `${personal.website} `
  }

  // Experience - with clear section markers
  if (cvData.experience && Array.isArray(cvData.experience)) {
    text += "\nWORK EXPERIENCE:\n"
    cvData.experience.forEach((exp, index) => {
      text += `\nEXPERIENCE ${index + 1}: `
      if (exp.title) text += `${exp.title} `
      if (exp.company) text += `at ${exp.company} `
      if (exp.location) text += `(${exp.location}) `
      if (exp.startDate || exp.endDate) {
        text += `${exp.startDate || "Start"} - ${exp.current ? "Present" : exp.endDate || "End"} `
      }
      if (exp.description) text += `DESCRIPTION: ${exp.description} `
    })
  }

  // Education
  if (cvData.education && Array.isArray(cvData.education)) {
    text += "\nEDUCATION:\n"
    cvData.education.forEach((edu, index) => {
      text += `\nEDUCATION ${index + 1}: `
      if (edu.degree) text += `${edu.degree} `
      if (edu.institution) text += `from ${edu.institution} `
      if (edu.location) text += `(${edu.location}) `
      if (edu.startDate || edu.endDate) {
        text += `${edu.startDate || "Start"} - ${edu.current ? "Present" : edu.endDate || "End"} `
      }
      if (edu.description) text += `DESCRIPTION: ${edu.description} `
    })
  }

  // Skills
  if (cvData.skills && Array.isArray(cvData.skills)) {
    text += "\nSKILLS: " + cvData.skills.join(", ") + " "
  }

  // Certifications
  if (cvData.certifications && Array.isArray(cvData.certifications)) {
    text += "\nCERTIFICATIONS:\n"
    cvData.certifications.forEach((cert, index) => {
      text += `\nCERTIFICATION ${index + 1}: `
      if (cert.name) text += `${cert.name} `
      if (cert.issuer) text += `by ${cert.issuer} `
      if (cert.date) text += `(${cert.date}) `
      if (cert.description) text += `DESCRIPTION: ${cert.description} `
    })
  }

  console.log("📄 Extracted CV text with sections:", text.substring(0, 500) + "...")
  console.log("📊 Total text length:", text.length)

  return text.trim()
}

function validateAnalysisResults(results: Record<string, unknown>): Record<string, unknown> {
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
      sectionsAnalysis: (results.lengthAnalysis as Record<string, unknown>)?.sectionsAnalysis || {},
    },
    industryFit: {
      score: (results.industryFit as Record<string, unknown>)?.score || 0,
      matchedKeywords: (results.industryFit as Record<string, unknown>)?.matchedKeywords || [],
      missingKeywords: (results.industryFit as Record<string, unknown>)?.missingKeywords || [],
      recommendations: (results.industryFit as Record<string, unknown>)?.recommendations || [],
    },
  }
}
