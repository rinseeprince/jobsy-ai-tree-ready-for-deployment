import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { recommendationsText } = await request.json()

    if (!recommendationsText) {
      return NextResponse.json({ error: "Recommendations text is required" }, { status: 400 })
    }

    if (typeof recommendationsText !== "string" || recommendationsText.trim().length < 50) {
      return NextResponse.json(
        {
          error: "Please provide a complete AI recommendations report (minimum 50 characters)",
        },
        { status: 400 },
      )
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key not found, using fallback parsing")
      // Use fallback parsing when OpenAI is not available
      const fallbackRecommendations = parseFallbackRecommendations(recommendationsText)
      return NextResponse.json({ recommendations: fallbackRecommendations })
    }

    // Use OpenAI to parse the recommendations into structured format
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert CV optimization assistant. Parse the provided AI recommendations report and extract individual actionable recommendations.

Return a JSON array of recommendations, each with:
- section: The CV section this applies to (Personal Info, Experience, Education, Skills, etc.)
- recommendation: Clear description of what to improve
- impact: Expected impact level (High, Medium, Low)
- type: Type of improvement (keyword, grammar, structure, quantification, etc.)

Only extract clear, actionable recommendations. Ignore general advice or explanatory text.

Example format:
[
  {
    "section": "Experience",
    "recommendation": "Add quantifiable metrics to Senior Sales Manager role - include revenue figures and team size",
    "impact": "High",
    "type": "quantification"
  },
  {
    "section": "Skills",
    "recommendation": "Add 'Salesforce CRM' and 'Lead Generation' keywords from job description",
    "impact": "Medium", 
    "type": "keyword"
  }
]`,
          },
          {
            role: "user",
            content: recommendationsText,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      console.error(`OpenAI API error: ${response.status}`)
      // Fallback to manual parsing if OpenAI fails
      const fallbackRecommendations = parseFallbackRecommendations(recommendationsText)
      return NextResponse.json({ recommendations: fallbackRecommendations })
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      console.error("No content from OpenAI response")
      const fallbackRecommendations = parseFallbackRecommendations(recommendationsText)
      return NextResponse.json({ recommendations: fallbackRecommendations })
    }

    try {
      const recommendations = JSON.parse(content)

      if (!Array.isArray(recommendations)) {
        throw new Error("Invalid recommendations format from AI")
      }

      // Validate each recommendation has required fields
      const validRecommendations = recommendations
        .filter(
          (rec) =>
            rec.section &&
            rec.recommendation &&
            typeof rec.section === "string" &&
            typeof rec.recommendation === "string",
        )
        .map((rec) => ({
          section: rec.section,
          recommendation: rec.recommendation,
          impact: rec.impact || "Medium",
          type: rec.type || "improvement",
        }))

      if (validRecommendations.length === 0) {
        // If no valid recommendations from AI, use fallback
        const fallbackRecommendations = parseFallbackRecommendations(recommendationsText)
        return NextResponse.json({ recommendations: fallbackRecommendations })
      }

      return NextResponse.json({ recommendations: validRecommendations })
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      // Use fallback parsing when AI response can't be parsed
      const fallbackRecommendations = parseFallbackRecommendations(recommendationsText)
      return NextResponse.json({ recommendations: fallbackRecommendations })
    }
  } catch (error) {
    console.error("Error parsing recommendations:", error)
    return NextResponse.json(
      {
        error: "Failed to parse recommendations. Please check the format and try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Fallback parsing function for when AI is not available
function parseFallbackRecommendations(
  text: string,
): Array<{ section: string; recommendation: string; impact: string; type: string }> {
  const recommendations: Array<{ section: string; recommendation: string; impact: string; type: string }> = []

  // Common patterns to look for in recommendations text
  const sections = ["Experience", "Skills", "Education", "Personal Info", "Summary", "Certifications"]
  let currentSection = "General"

  // Split text into lines and process each line
  const lines = text.split("\n").filter((line) => line.trim().length > 10)

  lines.forEach((line) => {
    const trimmedLine = line.trim()

    // Check if line indicates a section
    const sectionMatch = sections.find((section) => trimmedLine.toLowerCase().includes(section.toLowerCase()))
    if (sectionMatch) {
      currentSection = sectionMatch
    }

    // Look for actionable recommendations
    if (trimmedLine.match(/^[•\-*\d+.]/)) {
      const cleanRec = trimmedLine.replace(/^[•\-*\d+.]\s*/, "").trim()
      if (cleanRec.length > 15) {
        recommendations.push({
          section: currentSection,
          recommendation: cleanRec,
          impact: determineImpact(cleanRec),
          type: determineType(cleanRec),
        })
      }
    }

    // Look for action words
    const actionMatch = trimmedLine.match(/(add|include|update|remove|consider|improve|enhance)\s+(.+)/i)
    if (actionMatch && actionMatch[2] && actionMatch[2].length > 10) {
      recommendations.push({
        section: currentSection,
        recommendation: trimmedLine,
        impact: determineImpact(trimmedLine),
        type: determineType(trimmedLine),
      })
    }
  })

  // If no recommendations found, create some generic ones
  if (recommendations.length === 0) {
    recommendations.push({
      section: "General",
      recommendation: "Review and implement the AI recommendations provided in the text",
      impact: "Medium",
      type: "general",
    })
  }

  return recommendations.slice(0, 10) // Limit to 10 recommendations
}

function determineImpact(text: string): string {
  const highImpactWords = ["critical", "important", "essential", "key", "major", "significant"]
  const lowImpactWords = ["minor", "small", "slight", "optional", "consider"]

  const lowerText = text.toLowerCase()

  if (highImpactWords.some((word) => lowerText.includes(word))) {
    return "High"
  }
  if (lowImpactWords.some((word) => lowerText.includes(word))) {
    return "Low"
  }
  return "Medium"
}

function determineType(text: string): string {
  const lowerText = text.toLowerCase()

  if (lowerText.includes("keyword") || lowerText.includes("skill")) return "keyword"
  if (lowerText.includes("quantif") || lowerText.includes("number") || lowerText.includes("metric"))
    return "quantification"
  if (lowerText.includes("grammar") || lowerText.includes("spelling")) return "grammar"
  if (lowerText.includes("format") || lowerText.includes("structure")) return "structure"

  return "improvement"
}
