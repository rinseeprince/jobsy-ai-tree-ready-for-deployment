import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { cvText } = await request.json()

    if (!cvText) {
      return NextResponse.json({ error: "CV text is required" }, { status: 400 })
    }

    const prompt = `You are an expert CV/Resume parser. Extract structured information from the following CV text.

IMPORTANT EXTRACTION RULES:
1. Full Name: Extract ONLY the person's name (first and last name), nothing else
2. Professional Title: Leave this BLANK (empty string) - user will fill this themselves
3. Location: Extract the full address/location where the person lives
4. Summary: Generate a NEW personalized professional summary (2-3 sentences) based on their experience
5. Extract clean, individual pieces of information - do not dump raw text

Return ONLY valid JSON (no markdown formatting, no code blocks):

{
  "personal": {
    "firstName": "First name only",
    "lastName": "Last name only", 
    "jobTitle": "",
    "email": "clean email address",
    "phone": "clean phone number",
    "location": "full address/city/country",
    "website": "website URL if found",
    "linkedin": "LinkedIn URL if found",
    "github": "GitHub URL if found",
    "twitter": "Twitter URL if found",
    "summary": "Generate a NEW 2-3 sentence professional summary highlighting their key strengths and experience"
  },
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, Country",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY or Present",
      "current": boolean,
      "description": "Clean job description with key achievements"
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "Institution Name", 
      "location": "City, Country",
      "startDate": "MM/YYYY",
      "endDate": "MM/YYYY or Present",
      "current": boolean,
      "description": "Relevant details about education"
    }
  ],
  "skills": ["Individual", "Skills", "Listed", "Separately"],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "MM/YYYY",
      "description": "Additional details"
    }
  ]
}

CV Text:
${cvText}`

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
  } catch (error) {
    console.error("Error in AI CV parser:", error)
    return NextResponse.json({ error: "Failed to parse CV with AI" }, { status: 500 })
  }
}
