import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { cvText } = await request.json()

    if (!cvText) {
      return NextResponse.json({ error: "CV text is required" }, { status: 400 })
    }

    console.log("🤖 Starting AI CV parsing...")
    console.log("📄 CV text length:", cvText.length)

    const prompt = `
You are an expert resume parser. Extract structured information from the following resume text and return it as a JSON object.

IMPORTANT: Return ONLY valid JSON, no additional text or formatting.

For SKILLS extraction, be very specific and only include:
- Technical skills (programming languages, software, tools, frameworks)
- Professional skills (project management, data analysis, etc.)
- Soft skills (leadership, communication, problem-solving, etc.)
- Industry-specific skills and competencies

DO NOT include:
- Company names
- Location names (cities, countries)
- Dates or time periods
- Job titles or positions
- Educational institutions
- Sentence fragments or incomplete phrases
- Common words that aren't skills

Extract the following information:
- Personal information (name, email, phone, location, job title, professional summary)
- Work experience (job titles, companies, dates, descriptions)
- Education (degrees, institutions, dates)
- Skills (ONLY actual skills, competencies, and technologies)
- Certifications (professional certifications, licenses)

Return the data in this exact JSON structure:
{
  "personal": {
    "firstName": "string",
    "lastName": "string", 
    "email": "string",
    "phone": "string",
    "location": "string",
    "jobTitle": "string",
    "summary": "string",
    "linkedin": "string (optional)",
    "website": "string (optional)"
  },
  "experience": [
    {
      "title": "string",
      "company": "string", 
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "current": boolean,
      "description": "string"
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "location": "string", 
      "startDate": "string",
      "endDate": "string",
      "current": boolean,
      "description": "string"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string",
      "description": "string"
    }
  ]
}

Resume text:
${cvText}
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert resume parser that extracts structured data from resumes. 
          
          For skills extraction, be extremely careful to only include actual skills, not:
          - Company names (like "adMarketplace", "SevenRooms")
          - Locations (like "London", "UK")  
          - Dates (like "06/2024", "01/2023")
          - Sentence fragments (like "level blue", "engaging key decision")
          - Job titles or positions
          - Educational institutions
          
          Only include legitimate technical skills, soft skills, tools, technologies, and professional competencies.
          
          Always return valid JSON only.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      console.error("❌ No content received from OpenAI")
      return NextResponse.json({ error: "No response from AI" }, { status: 500 })
    }

    console.log("🤖 Raw AI response:", content)

    // Clean the response to extract JSON
    let jsonString = content.trim()

    // Remove markdown code blocks if present
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (jsonString.startsWith("```")) {
      jsonString = jsonString.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    // Parse the JSON
    const parsedData = JSON.parse(jsonString)

    console.log("✅ Successfully parsed CV data:", {
      personalInfo: !!parsedData.personal,
      experienceCount: parsedData.experience?.length || 0,
      educationCount: parsedData.education?.length || 0,
      skillsCount: parsedData.skills?.length || 0,
      certificationsCount: parsedData.certifications?.length || 0,
      extractedSkills: parsedData.skills,
    })

    // Validate that we have the required structure
    if (!parsedData.personal || !Array.isArray(parsedData.experience) || !Array.isArray(parsedData.skills)) {
      console.error("❌ Invalid parsed data structure")
      return NextResponse.json({ error: "Invalid data structure from AI" }, { status: 500 })
    }

    return NextResponse.json({ parsedCV: parsedData })
  } catch (error) {
    console.error("❌ Error in AI CV parser:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to parse CV" }, { status: 500 })
  }
}
