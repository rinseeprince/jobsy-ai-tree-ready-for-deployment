import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

const openaiClient = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
    }

    const { jobPosting, cvContent } = await request.json()

    if (!jobPosting || !cvContent) {
      return NextResponse.json({ error: "Job posting and CV content are required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: openaiClient("gpt-4o"),
      system: `You are an expert career coach and CV optimization specialist. Your task is to provide specific, actionable suggestions to improve a CV for a particular job application.

CRITICAL INSTRUCTIONS:
- ONLY provide recommendations and suggestions for improvement
- DO NOT invent, create, or suggest specific qualifications, degrees, companies, or achievements that are not in the original CV
- DO NOT write sample CV content or examples as if they were real
- Focus on optimizing what already exists in the CV
- If suggesting additions, clearly label them as "Consider adding..." or "If you have experience with..."

Guidelines:
- Provide specific, actionable recommendations
- Focus on keywords and phrases from the job posting
- Suggest improvements to formatting, content, and structure
- Highlight missing skills or experiences that should be emphasized IF they exist
- Recommend quantifiable achievements where the person can add their own metrics
- Ensure ATS optimization
- Be constructive and specific in feedback

Format your response with clear sections and numbered recommendations for easy reading.`,
      prompt: `Analyze the following CV against this job posting and provide detailed improvement suggestions:

JOB POSTING:
${jobPosting}

CURRENT CV:
${cvContent}

Please provide specific suggestions for improving this CV to better match the job requirements. Include:
1. Keywords to add or emphasize
2. Skills or experiences to highlight more prominently
3. Formatting or structure improvements
4. Missing elements that should be included
5. Specific examples or achievements to add`,
    })

    return NextResponse.json({ cvSuggestions: text })
  } catch (error) {
    console.error("Error generating CV improvements:", error)
    return NextResponse.json(
      { error: `Failed to generate CV improvements: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
