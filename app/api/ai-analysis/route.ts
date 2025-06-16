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

    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json({
        success: false,
        error: "CV content is too short for meaningful analysis. Please add more details to your CV.",
      })
    }

    // Create comprehensive analysis prompt with specific examples
    const analysisPrompt = `
You are an expert CV/Resume analyst and ATS specialist. Analyze the following CV and provide EXTREMELY DETAILED feedback with SPECIFIC EXAMPLES.

CV CONTENT:
${cvText}

${jobDescription ? `JOB DESCRIPTION: ${jobDescription}` : ""}

INDUSTRY: ${industry}

CRITICAL INSTRUCTIONS:
1. For grammar issues: Quote the EXACT text with the error and provide the EXACT correction
2. For weak verbs: Quote the EXACT sentence and provide the EXACT replacement sentence
3. For keywords: List the EXACT words found and EXACT words missing
4. For quantification: Quote the EXACT sentence that needs metrics and suggest SPECIFIC numbers/percentages
5. Be extremely specific - no generic advice

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
          "type": "grammar|spelling|punctuation",
          "originalText": "EXACT text from CV with the error",
          "correctedText": "EXACT corrected version",
          "message": "Specific description of the error",
          "suggestion": "Exact fix to apply",
          "severity": "high|medium|low",
          "location": "Which section this appears in"
        }
      ]
    },
    "impact": {
      "score": <number 0-100>,
      "weakVerbs": [
        {
          "verb": "exact weak verb found",
          "originalSentence": "EXACT sentence containing weak verb",
          "improvedSentence": "EXACT improved sentence with strong action verb",
          "location": "Which section this appears in"
        }
      ],
      "missingQuantification": [
        {
          "originalText": "EXACT text that needs quantification",
          "suggestedText": "EXACT suggested text with specific metrics",
          "location": "Which section this appears in",
          "metricType": "percentage|number|timeframe|currency"
        }
      ],
      "passiveVoiceCount": <number>,
      "passiveVoiceExamples": [
        {
          "originalText": "EXACT passive voice sentence",
          "improvedText": "EXACT active voice version",
          "location": "Which section this appears in"
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
          "location": "Which section"
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
        "keyword": "exact missing keyword",
        "importance": "why this keyword is critical",
        "suggestedPlacement": "where to add it in the CV",
        "exampleUsage": "exact sentence showing how to use it"
      }
    ],
    "recommendations": [
      "SPECIFIC industry improvement with exact changes",
      "Another specific recommendation with exact keywords to add"
    ]
  }
}

ANALYSIS REQUIREMENTS:
1. Count actual words in the CV content accurately
2. Find and quote EXACT grammar, spelling, and punctuation errors with EXACT corrections
3. Identify EXACT weak action verbs with EXACT sentence replacements
4. List EXACT industry keywords found and EXACT keywords missing
5. Provide EXACT text improvements, not generic advice
6. Quote actual sentences from the CV, don't make up examples
7. Be extremely specific and actionable

EXAMPLE OF GOOD ANALYSIS:
Instead of: "Use stronger verbs"
Provide: "Replace 'was responsible for managing' with 'Led and optimized' in the sentence 'I was responsible for managing a team of 5 developers' → 'Led and optimized a team of 5 developers, increasing productivity by 25%'"

Be thorough, accurate, and provide EXACT quotes and corrections.
`

    console.log("🤖 Sending enhanced request to OpenAI...")

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
              "You are an expert CV analyst. Provide extremely detailed, specific analysis with exact quotes and corrections in valid JSON format only. No additional text outside the JSON. Always quote actual text from the CV, never make up examples.",
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        temperature: 0.2, // Lower temperature for more precise analysis
        max_tokens: 3000, // Increased for more detailed response
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
      console.log("✅ Successfully parsed OpenAI analysis")
    } catch (parseError) {
      console.error("❌ Failed to parse OpenAI response:", parseError)
      console.log("Raw response:", analysisText)
      throw new Error("Failed to parse analysis results")
    }

    // Validate and ensure all required fields are present
    const validatedResults = validateAnalysisResults(analysisResults)

    console.log("📊 Enhanced analysis completed successfully:", {
      atsScore: (validatedResults.atsScore as Record<string, unknown>)?.overall,
      contentQuality: (validatedResults.contentQuality as Record<string, unknown>)?.overall,
      wordCount: (validatedResults.lengthAnalysis as Record<string, unknown>)?.wordCount,
      grammarIssues: ((validatedResults.contentQuality as Record<string, unknown>)?.grammar as Record<string, unknown>)
        ?.issues as unknown[],
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

  // Personal info
  if (cvData.personalInfo) {
    const personal = cvData.personalInfo
    if (personal.name) text += `${personal.name}\n`
    if (personal.title) text += `${personal.title}\n`
    if (personal.email) text += `Email: ${personal.email}\n`
    if (personal.phone) text += `Phone: ${personal.phone}\n`
    if (personal.location) text += `Location: ${personal.location}\n`
    if (personal.linkedin) text += `LinkedIn: ${personal.linkedin}\n`
    if (personal.website) text += `Website: ${personal.website}\n`
    if (personal.summary) text += `\nPROFESSIONAL SUMMARY:\n${personal.summary}\n`
  }

  // Experience
  if (cvData.experience && cvData.experience.length > 0) {
    text += "\nWORK EXPERIENCE:\n"
    cvData.experience.forEach((exp) => {
      if (exp.title || exp.company) {
        text += `\n${exp.title || "Position"} at ${exp.company || "Company"}\n`
        if (exp.location) text += `Location: ${exp.location}\n`
        if (exp.startDate || exp.endDate) {
          text += `Duration: ${exp.startDate || "Start"} - ${exp.current ? "Present" : exp.endDate || "End"}\n`
        }
        if (exp.description) text += `${exp.description}\n`
      }
    })
  }

  // Education
  if (cvData.education && cvData.education.length > 0) {
    text += "\nEDUCATION:\n"
    cvData.education.forEach((edu) => {
      if (edu.degree || edu.institution) {
        text += `\n${edu.degree || "Degree"} from ${edu.institution || "Institution"}\n`
        if (edu.location) text += `Location: ${edu.location}\n`
        if (edu.startDate || edu.endDate) {
          text += `Duration: ${edu.startDate || "Start"} - ${edu.current ? "Present" : edu.endDate || "End"}\n`
        }
        if (edu.description) text += `${edu.description}\n`
      }
    })
  }

  // Skills
  if (cvData.skills && cvData.skills.length > 0) {
    text += "\nSKILLS:\n"
    text += cvData.skills.join(", ") + "\n"
  }

  // Certifications
  if (cvData.certifications && cvData.certifications.length > 0) {
    text += "\nCERTIFICATIONS:\n"
    cvData.certifications.forEach((cert) => {
      if (cert.name) {
        text += `\n${cert.name}`
        if (cert.issuer) text += ` - ${cert.issuer}`
        if (cert.date) text += ` (${cert.date})`
        text += "\n"
        if (cert.description) text += `${cert.description}\n`
      }
    })
  }

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
