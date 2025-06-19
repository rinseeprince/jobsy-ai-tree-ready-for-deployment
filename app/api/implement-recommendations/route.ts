import { type NextRequest, NextResponse } from "next/server"
import type { CVData } from "@/lib/cv-templates"

interface Recommendation {
  section: string
  recommendation: string
  impact: string
  type: string
}

// More permissive filtering - keep almost all recommendations
function filterImplementableRecommendations(recommendations: Recommendation[]): Recommendation[] {
  const implementable = recommendations.filter((rec) => {
    const lowerRec = rec.recommendation.toLowerCase()

    // Only skip truly impossible recommendations
    if (
      lowerRec.includes("save as .docx") ||
      lowerRec.includes("save as .pdf") ||
      lowerRec.includes("change font to arial") ||
      lowerRec.includes("change font to calibri") ||
      lowerRec.includes("use 11pt font") ||
      lowerRec.includes("use 12pt font") ||
      lowerRec.includes("print on") ||
      lowerRec.includes("use letterhead")
    ) {
      console.log("🚫 Skipping truly unimplementable:", rec.recommendation.substring(0, 100))
      return false
    }

    console.log("✅ Keeping implementable:", rec.recommendation.substring(0, 100))
    return true
  })

  console.log(`📊 Filtered ${recommendations.length} → ${implementable.length} implementable recommendations`)
  return implementable
}

// Quality validation function
function validateResponseQuality(content: string, originalCV: CVData): { isValid: boolean; reason?: string } {
  console.log("🔍 Validating response quality...")

  // Check minimum length (should be substantial for a comprehensive CV)
  if (content.length < 2000) {
    console.log("❌ Response too short:", content.length, "characters")
    return { isValid: false, reason: "Response too short" }
  }

  // Parse and check content structure
  let parsedCV: CVData
  try {
    parsedCV = JSON.parse(content) as CVData
  } catch {
    console.log("❌ Invalid JSON structure")
    return { isValid: false, reason: "Invalid JSON" }
  }

  // Check if professional summary was enhanced (should be longer than original)
  const originalSummaryLength = originalCV.personalInfo?.summary?.length || 0
  const newSummaryLength = parsedCV.personalInfo?.summary?.length || 0

  if (newSummaryLength <= originalSummaryLength + 50) {
    console.log("❌ Summary not sufficiently enhanced")
    return { isValid: false, reason: "Insufficient summary enhancement" }
  }

  // Check if experience descriptions were enhanced
  if (originalCV.experience && parsedCV.experience) {
    let enhancementCount = 0
    for (let i = 0; i < Math.min(originalCV.experience.length, parsedCV.experience.length); i++) {
      const originalDesc = originalCV.experience[i]?.description?.length || 0
      const newDesc = parsedCV.experience[i]?.description?.length || 0
      if (newDesc > originalDesc + 100) {
        enhancementCount++
      }
    }

    if (enhancementCount === 0 && originalCV.experience.length > 0) {
      console.log("❌ Experience descriptions not sufficiently enhanced")
      return { isValid: false, reason: "Insufficient experience enhancement" }
    }
  }

  // Check if skills were enhanced (should have more skills than original)
  const originalSkillsCount = originalCV.skills?.length || 0
  const newSkillsCount = parsedCV.skills?.length || 0

  if (originalSkillsCount > 0 && newSkillsCount <= originalSkillsCount) {
    console.log("❌ Skills not enhanced")
    return { isValid: false, reason: "Skills not enhanced" }
  }

  console.log("✅ Response quality validation passed")
  return { isValid: true }
}

// Robust JSON completion function
function ensureCompleteJSON(jsonString: string): string {
  console.log("🔧 Ensuring JSON completeness...")

  let cleaned = jsonString.trim()

  // Remove any markdown formatting
  cleaned = cleaned.replace(/```json\s*/g, "").replace(/```\s*/g, "")

  // Find JSON start
  const startIndex = cleaned.indexOf("{")
  if (startIndex > 0) {
    cleaned = cleaned.substring(startIndex)
  }

  // Track braces and strings properly
  let braceCount = 0
  let inString = false
  let escapeNext = false

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i]

    if (escapeNext) {
      escapeNext = false
      continue
    }

    if (char === "\\") {
      escapeNext = true
      continue
    }

    if (char === '"' && !escapeNext) {
      inString = !inString
      continue
    }

    if (!inString) {
      if (char === "{") {
        braceCount++
      } else if (char === "}") {
        braceCount--
        if (braceCount === 0) {
          console.log("✅ Found complete JSON at position", i)
          return cleaned.substring(0, i + 1)
        }
      }
    }
  }

  // If we reach here, JSON is incomplete
  console.log(`🔧 JSON incomplete, missing ${braceCount} closing braces`)

  // Find the last complete key-value pair
  let cutPosition = cleaned.length
  let inQuotes = false
  let escapeChar = false

  // Work backwards to find last complete field
  for (let i = cleaned.length - 1; i >= 0; i--) {
    const char = cleaned[i]

    if (escapeChar) {
      escapeChar = false
      continue
    }

    if (char === "\\") {
      escapeChar = true
      continue
    }

    if (char === '"' && !escapeChar) {
      inQuotes = !inQuotes
    }

    if (!inQuotes && (char === "," || char === "{")) {
      cutPosition = char === "," ? i : i + 1
      break
    }
  }

  // Cut at the last complete field
  let result = cleaned.substring(0, cutPosition)

  // Remove trailing comma if present
  result = result.replace(/,\s*$/, "")

  // Close all open braces
  result += "}".repeat(braceCount)

  console.log("🔧 Completed truncated JSON")
  return result
}

// Enhanced retry mechanism with quality validation
async function callOpenAIWithQualityRetry(
  openaiKey: string,
  payload: Record<string, unknown>,
  originalCV: CVData,
  maxRetries = 3,
): Promise<{ content: string; attempt: number }> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 OpenAI API attempt ${attempt}/${maxRetries}`)

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(60000), // 60 second timeout
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`OpenAI API error ${response.status}: ${errorText}`)
      }

      const data: { choices?: { message?: { content?: string } }[] } = await response.json()
      const content = data?.choices?.[0]?.message?.content?.trim() as string | undefined

      if (!content) {
        throw new Error("No content in OpenAI response")
      }

      // Validate response quality
      const qualityCheck = validateResponseQuality(content, originalCV)

      if (qualityCheck.isValid) {
        console.log(`✅ High-quality response achieved on attempt ${attempt}`)
        return { content, attempt }
      } else {
        console.log(`⚠️ Quality check failed on attempt ${attempt}: ${qualityCheck.reason}`)
        if (attempt < maxRetries) {
          console.log("🔄 Retrying for better quality...")
          continue
        } else {
          console.log("⚠️ Using last attempt despite quality issues")
          return { content, attempt }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        lastError = error
        console.error(`❌ OpenAI API attempt ${attempt} failed:`, error.message)
      } else {
        lastError = new Error("Unknown error occurred during OpenAI API call")
        console.error(`❌ OpenAI API attempt ${attempt} failed: Unknown error`)
      }

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
        console.log(`⏳ Retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting implement recommendations API call")

    // Parse request body
    let body: { currentCV: CVData; recommendations: Recommendation[] }
    try {
      body = await request.json()
      console.log("📥 Request body parsed successfully")
    } catch (parseError: unknown) {
      if (parseError instanceof Error) {
        console.error("❌ Failed to parse request body:", parseError)
      } else {
        console.error("❌ Failed to parse request body: Unknown error")
      }
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { currentCV, recommendations } = body

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
    const openaiKey = process.env.OPENAI_API_KEY
    if (!openaiKey) {
      console.error("❌ OpenAI API key not found in environment variables")
      return NextResponse.json({ error: "AI service is not configured" }, { status: 500 })
    }

    console.log("✅ OpenAI API key found")

    // Filter recommendations (very permissive now)
    const implementableRecs = filterImplementableRecommendations(recommendations)

    if (implementableRecs.length === 0) {
      console.log("⚠️ No implementable recommendations found, returning original CV")
      return NextResponse.json({
        updatedCV: currentCV,
        message: "No applicable recommendations found for the current CV structure.",
      })
    }

    // Create comprehensive improvement instructions
    const improvementInstructions = implementableRecs.map((rec, i) => `${i + 1}. ${rec.recommendation}`).join("\n")

    console.log("🤖 Calling OpenAI API with comprehensive recommendations...")

    // Prepare OpenAI payload with enhanced consistency settings
    const openaiPayload = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert CV enhancement specialist that returns ONLY valid, complete JSON with CONSISTENT HIGH QUALITY.

CRITICAL REQUIREMENTS:
1. Return ONLY a JSON object - no explanations, no markdown, no extra text
2. Start with { and end with }
3. Preserve the exact JSON structure provided
4. Use proper JSON escaping for all strings
5. ENSURE the JSON is complete and properly closed - this is CRITICAL
6. Make responses rich, detailed, and comprehensive EVERY TIME
7. MAINTAIN CONSISTENT QUALITY across all sections and fields
8. Apply the SAME LEVEL OF DETAIL to every enhancement

ENHANCEMENT PHILOSOPHY - BE COMPREHENSIVE AND CONSISTENT:
- Transform weak verbs into powerful action verbs (e.g., "managed" → "orchestrated", "helped" → "spearheaded", "worked on" → "pioneered")
- Add specific technologies, tools, and methodologies naturally into descriptions
- Include quantifiable metrics and achievements wherever logical
- Enhance professional summaries with industry-specific keywords and compelling value propositions
- Expand skill sets with relevant technical and soft skills based on experience
- Make every bullet point impactful with concrete examples and results
- Use sophisticated vocabulary while maintaining professional clarity
- Add industry certifications and technical competencies to skills section when relevant
- Enhance job descriptions with specific achievements and technologies used
- Improve education descriptions with relevant projects or achievements

CONSISTENCY REQUIREMENTS:
- Ensure uniform enhancement quality across ALL sections
- Apply the same level of sophistication to every field
- Maintain consistent professional language throughout
- Every description should be substantially enhanced and detailed
- Professional summary should be compelling and comprehensive (minimum 200 words)
- Each experience description should be rich and detailed (minimum 150 words each)
- Skills section should be comprehensive with relevant technical and soft skills
- Use consistent formatting and professional terminology

SPECIFIC TRANSFORMATIONS:
- Basic verbs → Dynamic action verbs (led → spearheaded, did → executed, made → generated)
- Generic descriptions → Specific, results-oriented descriptions with metrics
- Simple skills → Comprehensive technical and soft skills relevant to experience
- Basic summaries → Compelling professional narratives with value propositions
- Plain job titles → Enhanced with key technologies and methodologies used

FORBIDDEN:
- Adding new job experiences or education entries that don't exist
- Changing the fundamental JSON structure
- Any text outside the JSON object
- Incomplete or truncated JSON responses
- Adding false information not supported by existing content
- CRITICAL: Do NOT enhance or add content to sections that are empty or contain no meaningful data in the original CV
- If education array is empty or contains placeholder/empty entries, do NOT add education content
- If certifications array is empty or contains placeholder/empty entries, do NOT add certification content
- If skills array is empty or minimal, only enhance based on experience content, do NOT fabricate skills
- Only enhance sections that contain actual, substantial content from the user's original CV
- Inconsistent quality or brief enhancements
`,
        },
        {
          role: "user",
          content: `ENHANCE THIS CV WITH RICH, COMPREHENSIVE, CONSISTENT IMPROVEMENTS:

INPUT CV:
${JSON.stringify(currentCV)}

APPLY ALL THESE RECOMMENDATIONS COMPREHENSIVELY:
${improvementInstructions}

INSTRUCTIONS:
- Apply ALL recommendations with rich, detailed enhancements
- Transform every weak verb into a powerful action verb
- Add relevant technologies and tools naturally throughout
- Include quantifiable achievements and metrics where logical
- Enhance skills section with comprehensive technical and soft skills
- Improve professional summary with compelling, keyword-rich content (minimum 200 words)
- Make every description impactful and results-oriented (minimum 150 words per experience)
- Use industry-specific terminology and advanced vocabulary
- Ensure every enhancement adds significant professional value
- MAINTAIN CONSISTENT HIGH QUALITY across all sections

CRITICAL CONTENT VALIDATION:
- ONLY enhance sections that contain actual content in the original CV
- If education section is empty/minimal, do NOT add or enhance education content
- If certifications section is empty/minimal, do NOT add or enhance certification content  
- If any section lacks substantial original content, skip enhancements for that section
- Focus enhancements on sections with existing, meaningful content only

QUALITY REQUIREMENTS:
- Every enhanced section must be substantially improved
- Professional summary must be comprehensive and compelling
- Experience descriptions must be detailed and achievement-focused
- Skills must be relevant and comprehensive
- Language must be sophisticated and professional throughout
`,
        },
      ],
      temperature: 0.1, // Lower temperature for maximum consistency
      max_tokens: 6000, // Maintained high token limit for rich responses
      response_format: { type: "json_object" },
    }

    // Call OpenAI with enhanced quality retry mechanism
    let result: { content: string; attempt: number }
    try {
      result = await callOpenAIWithQualityRetry(openaiKey, openaiPayload, currentCV, 3)
    } catch (fetchError: unknown) {
      if (fetchError instanceof Error) {
        console.error("❌ Failed to call OpenAI API after retries:", fetchError)
      } else {
        console.error("❌ Failed to call OpenAI API after retries: Unknown error")
      }
      return NextResponse.json(
        {
          error: "Failed to connect to AI service after multiple attempts",
          details: fetchError instanceof Error ? fetchError.message : "Unknown fetch error",
        },
        { status: 500 },
      )
    }

    const { content, attempt } = result

    console.log("🔄 Processing AI response...")
    console.log("Response length:", content.length)
    console.log("Quality achieved on attempt:", attempt)
    console.log("Response preview:", content.substring(0, 100))

    let updatedCV: CVData
    try {
      // First attempt: direct parsing
      updatedCV = JSON.parse(content) as CVData
      console.log("✅ Successfully parsed AI response on first try")
    } catch (jsonError: unknown) {
      if (jsonError instanceof Error) {
        console.log("⚠️ Initial JSON parse failed, attempting completion...")
        console.log("Parse error:", jsonError.message)
      } else {
        console.log("⚠️ Initial JSON parse failed, attempting completion... (Unknown error)")
      }

      try {
        // Use robust JSON completion
        const completedContent = ensureCompleteJSON(content)
        updatedCV = JSON.parse(completedContent) as CVData
        console.log("✅ Successfully parsed completed AI response")
      } catch (completionError: unknown) {
        console.error("❌ Failed to parse even after completion:", completionError)
        if (jsonError instanceof Error) {
          console.error("Original error:", jsonError.message)
        } else {
          console.error("Original error: Unknown error")
        }
        if (completionError instanceof Error) {
          console.error("Completion error:", completionError.message)
        } else {
          console.error("Completion error: Unknown error")
        }
        console.error("Raw response start:", content.substring(0, 500))
        console.error("Raw response end:", content.substring(Math.max(0, content.length - 500)))

        // Final fallback with detailed error info
        return NextResponse.json({
          updatedCV: currentCV,
          appliedRecommendations: 0,
          skippedRecommendations: recommendations.length,
          message:
            "AI service returned an incomplete response. Your original CV has been preserved. This may be due to high server load - please try again in a moment.",
          error: "JSON parsing failed after completion attempts",
          debug: {
            responseLength: content.length,
            originalError: jsonError instanceof Error ? jsonError.message : "Unknown error",
            completionError: completionError instanceof Error ? completionError.message : "Unknown error",
          },
        })
      }
    }

    // Validate structure thoroughly
    const requiredFields = ["personalInfo", "experience", "education", "skills"]
    for (const field of requiredFields) {
      if (!updatedCV[field as keyof CVData]) {
        console.error(`❌ Missing required field: ${field}`)
        return NextResponse.json({
          updatedCV: currentCV,
          appliedRecommendations: 0,
          skippedRecommendations: recommendations.length,
          message: `AI response was missing the ${field} section. Your original CV has been preserved.`,
          error: `Missing required field: ${field}`,
        })
      }
    }

    // Additional validation for array fields
    if (!Array.isArray(updatedCV.experience)) {
      console.error("❌ Experience field is not an array")
      updatedCV.experience = currentCV.experience
    }

    if (!Array.isArray(updatedCV.education)) {
      console.error("❌ Education field is not an array")
      updatedCV.education = currentCV.education
    }

    if (!Array.isArray(updatedCV.skills)) {
      console.error("❌ Skills field is not an array")
      updatedCV.skills = currentCV.skills
    }

    console.log("✅ CV successfully enhanced with comprehensive, consistent, high-quality improvements")
    console.log("Applied improvements:", implementableRecs.length)
    console.log("Quality attempt:", attempt)
    console.log("Enhanced sections: personalInfo, experience, education, skills")

    return NextResponse.json({
      updatedCV,
      appliedRecommendations: implementableRecs.length,
      skippedRecommendations: recommendations.length - implementableRecs.length,
      message: `Successfully applied ${implementableRecs.length} comprehensive enhancements to your CV with consistent high quality.`,
      qualityAttempt: attempt,
    })
  } catch (error) {
    console.error("❌ Unexpected error in implement-recommendations API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        message: "An unexpected error occurred. Please try again.",
      },
      { status: 500 },
    )
  }
}
