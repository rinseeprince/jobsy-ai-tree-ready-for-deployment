import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { cvText } = await request.json()

    if (!cvText) {
      return NextResponse.json({ error: "CV text is required" }, { status: 400 })
    }

    const prompt = `You are a CV/Resume parser. Your job is to extract the EXACT text content from the provided CV and structure it into JSON format. DO NOT rewrite, improve, or generate new content - only extract what is already there.

CRITICAL FORMATTING RULES:
1. Extract text EXACTLY as written - preserve ALL original formatting, spacing, and structure
2. For work experience descriptions: PRESERVE paragraph breaks, bullet points, and line spacing using \\n\\n for paragraph breaks and \\n for line breaks
3. For professional summary: Copy the exact text with original paragraph structure
4. Maintain original bullet points, dashes, or numbering exactly as they appear
5. Preserve spacing between sentences and paragraphs
6. If information is missing, leave fields empty - do not generate placeholder content
7. Do not combine separate paragraphs into one block of text
8. Keep the original voice, tone, and writing style exactly as written

PARAGRAPH PRESERVATION EXAMPLES:
- If the original has multiple paragraphs, separate them with \\n\\n
- If the original has bullet points, keep them as bullet points
- If there are line breaks between achievements, preserve them with \\n

CV Content to parse:
${cvText}

Extract and return ONLY the exact content in this JSON format:
{
  "personal": {
    "firstName": "exact first name from CV",
    "lastName": "exact last name from CV", 
    "jobTitle": "exact job title/professional title from CV",
    "email": "exact email from CV",
    "phone": "exact phone number from CV",
    "location": "exact location/address from CV",
    "website": "exact website URL from CV",
    "linkedin": "exact LinkedIn URL from CV",
    "github": "exact GitHub URL from CV", 
    "twitter": "exact Twitter handle from CV",
    "summary": "EXACT professional summary/objective text from CV - preserve all paragraph breaks with \\n\\n and line breaks with \\n"
  },
  "experience": [
    {
      "title": "exact job title from CV",
      "company": "exact company name from CV", 
      "location": "exact job location from CV",
      "startDate": "exact start date from CV",
      "endDate": "exact end date from CV or empty if current",
      "current": boolean if currently employed,
      "description": "EXACT job description from CV - preserve ALL paragraph breaks with \\n\\n, line breaks with \\n, bullet points, achievements sections, and original formatting structure exactly as written"
    }
  ],
  "education": [
    {
      "degree": "exact degree name from CV",
      "institution": "exact school/university name from CV",
      "location": "exact education location from CV", 
      "startDate": "exact start date from CV",
      "endDate": "exact end date from CV",
      "current": boolean if currently studying,
      "description": "exact additional education details from CV with preserved formatting using \\n\\n for paragraphs and \\n for line breaks"
    }
  ],
  "skills": ["exact skill 1 from CV", "exact skill 2 from CV"],
  "certifications": [
    {
      "name": "exact certification name from CV",
      "issuer": "exact issuing organization from CV",
      "date": "exact certification date from CV", 
      "description": "exact certification description from CV with preserved formatting"
    }
  ]
}

REMEMBER: 
- Use \\n\\n to separate paragraphs
- Use \\n for single line breaks
- Preserve bullet points, achievements sections, and all original structure
- Do NOT combine separate paragraphs or sections into one block
- Extract EXACTLY - do not improve, rephrase, or generate new content`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.1,
    })

    // Extract JSON from markdown code blocks if present
    let jsonText = text.trim()

    // Remove markdown code block formatting if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    // Parse the JSON response
    let parsedCV
    try {
      parsedCV = JSON.parse(jsonText)
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError)
      console.error("Cleaned JSON text:", jsonText)
      console.error("Original AI Response:", text)
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    return NextResponse.json({ parsedCV })
  } catch (error: unknown) {
    console.error("Error in AI CV parser:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to parse CV with AI"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
