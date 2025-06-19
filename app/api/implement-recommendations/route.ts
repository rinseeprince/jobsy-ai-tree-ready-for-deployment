import { type NextRequest, NextResponse } from "next/server"
import type { CVData } from "@/lib/cv-templates"

interface Recommendation {
  section: string
  recommendation: string
  impact: string
  type: string
}

// Filter out unimplementable recommendations
function filterImplementableRecommendations(recommendations: Recommendation[]): Recommendation[] {
  const implementable = recommendations.filter((rec) => {
    const lowerRec = rec.recommendation.toLowerCase()
    const lowerSection = rec.section.toLowerCase()

    // Skip recommendations about adding new sections
    if (
      lowerRec.includes("add a") ||
      lowerRec.includes("create a") ||
      lowerRec.includes("consider adding") ||
      lowerRec.includes("include a new") ||
      lowerSection.includes("new section") ||
      lowerSection.includes("additional section")
    ) {
      console.log("🚫 Skipping unimplementable:", rec.recommendation.substring(0, 100))
      return false
    }

    // Skip formatting recommendations (HTML/CSS related)
    if (
      lowerRec.includes("font") ||
      lowerRec.includes("formatting") ||
      lowerRec.includes("bullet points") ||
      lowerRec.includes("save as") ||
      lowerRec.includes(".docx") ||
      lowerRec.includes(".pdf") ||
      lowerRec.includes("arial") ||
      lowerRec.includes("calibri") ||
      lowerSection.includes("formatting")
    ) {
      console.log("🚫 Skipping formatting:", rec.recommendation.substring(0, 100))
      return false
    }

    // Skip recommendations about adding content that doesn't exist
    if (
      (lowerRec.includes("education") || lowerRec.includes("certification")) &&
      (lowerRec.includes("add") || lowerRec.includes("list") || lowerRec.includes("include"))
    ) {
      console.log("🚫 Skipping missing content:", rec.recommendation.substring(0, 100))
      return false
    }

    console.log("✅ Keeping implementable:", rec.recommendation.substring(0, 100))
    return true
  })

  console.log(`📊 Filtered ${recommendations.length} → ${implementable.length} implementable recommendations`)
  return implementable
}

// Create focused recommendations for existing content
function createFocusedRecommendations(
  implementableRecs: Recommendation[],
): Array<{ section: string; action: string; focus: string }> {
  const focused = []

  for (const rec of implementableRecs) {
    const lowerRec = rec.recommendation.toLowerCase()

    // Keywords and skills enhancement
    if (lowerRec.includes("keyword") || lowerRec.includes("skill")) {
      focused.push({
        section: "skills",
        action: "enhance_keywords",
        focus: rec.recommendation,
      })
    }

    // Experience improvements
    if (lowerRec.includes("experience") || lowerRec.includes("achievement") || lowerRec.includes("quantif")) {
      focused.push({
        section: "experience",
        action: "improve_descriptions",
        focus: rec.recommendation,
      })
    }

    // Summary/profile improvements
    if (lowerRec.includes("summary") || lowerRec.includes("profile") || lowerRec.includes("about")) {
      focused.push({
        section: "personalInfo",
        action: "enhance_summary",
        focus: rec.recommendation,
      })
    }

    // General content improvements
    if (lowerRec.includes("grammar") || lowerRec.includes("action verb") || lowerRec.includes("improve")) {
      focused.push({
        section: "general",
        action: "improve_content",
        focus: rec.recommendation,
      })
    }
  }

  return focused
}

export async function POST(request: NextRequest) {
  try {
    const { currentCV, recommendations } = await request.json()

    console.log("🔍 Implement recommendations request received")
    console.log("Current CV:", currentCV ? "Present" : "Missing")
    console.log("Recommendations count:", recommendations?.length || 0)

    if (!currentCV || !recommendations) {
      console.error("❌ Missing required data")
      return NextResponse.json({ error: "CV data and recommendations are required" }, { status: 400 })
    }

    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      console.error("❌ Invalid recommendations format")
      return NextResponse.json({ error: "Valid recommendations array is required" }, { status: 400 })
    }

    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OpenAI API key not found")
      return NextResponse.json({ error: "AI service is not configured" }, { status: 500 })
    }

    // Filter out unimplementable recommendations
    const implementableRecs = filterImplementableRecommendations(recommendations)

    if (implementableRecs.length === 0) {
      console.log("⚠️ No implementable recommendations found, returning original CV")
      return NextResponse.json({
        updatedCV: currentCV,
        message: "No applicable recommendations found for the current CV structure.",
      })
    }

    // Create focused recommendations
    const focusedRecs = createFocusedRecommendations(implementableRecs)

    console.log("🤖 Calling OpenAI API with filtered recommendations...")

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a JSON-only CV enhancement API. You MUST respond with valid JSON only.

CRITICAL RULES:
1. Your response must be ONLY a JSON object
2. Start with { and end with }
3. No explanations, no markdown, no code blocks, no text outside JSON
4. Enhance EXISTING content only - do not add new sections
5. Preserve the exact JSON structure provided
6. Use proper JSON escaping for all strings

ENHANCEMENT GUIDELINES:
- Improve grammar and sentence structure
- Add relevant keywords naturally
- Enhance action verbs
- Optimize professional summary
- Make content more impactful

FORBIDDEN:
- Adding new sections or fields
- Creating new experiences/education entries
- Adding certifications that don't exist
- Changing JSON structure
- Any text outside the JSON object`,
          },
          {
            role: "user",
            content: `INPUT CV JSON:
${JSON.stringify(currentCV)}

APPLY THESE IMPROVEMENTS:
${focusedRecs.map((rec, i) => `${i + 1}. ${rec.section}: ${rec.focus}`).join("\n")}

OUTPUT: Return the enhanced CV as a JSON object with the same structure. Apply improvements to existing content only. Response must be valid JSON starting with { and ending with }.`,
          },
        ],
        temperature: 0.05, // Very low for consistent JSON output
        max_tokens: 4000,
        response_format: { type: "json_object" }, // Force JSON response
      }),
    })

    console.log("📡 OpenAI API response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ OpenAI API error:", response.status, errorText)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content?.trim()

    if (!content) {
      console.error("❌ No content in OpenAI response")
      throw new Error("No response from AI")
    }

    console.log("🔄 Processing AI response...")
    console.log("Response length:", content.length)
    console.log("Response starts with:", content.substring(0, 50))

    try {
      // Since we're using response_format: json_object, the response should be valid JSON
      const updatedCV: CVData = JSON.parse(content)

      // Validate structure
      const requiredFields = ["personalInfo", "experience", "education", "skills"]
      for (const field of requiredFields) {
        if (!updatedCV[field as keyof CVData]) {
          throw new Error(`Missing required field: ${field}`)
        }
      }

      // Ensure arrays are arrays
      if (!Array.isArray(updatedCV.experience)) updatedCV.experience = []
      if (!Array.isArray(updatedCV.education)) updatedCV.education = []
      if (!Array.isArray(updatedCV.skills)) updatedCV.skills = []
      if (!Array.isArray(updatedCV.certifications)) updatedCV.certifications = []

      console.log("✅ CV successfully enhanced")
      console.log("Applied improvements:", focusedRecs.length)

      return NextResponse.json({
        updatedCV,
        appliedRecommendations: focusedRecs.length,
        skippedRecommendations: recommendations.length - implementableRecs.length,
      })
    } catch (parseError) {
      console.error("❌ Failed to parse AI response:", parseError)
      console.error("Raw response:", content)

      // Return original CV with error info
      return NextResponse.json(
        {
          error: "AI response could not be processed",
          details: parseError instanceof Error ? parseError.message : "Parse error",
          fallback: currentCV,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Error implementing recommendations:", error)
    return NextResponse.json(
      {
        error: "Failed to implement recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}