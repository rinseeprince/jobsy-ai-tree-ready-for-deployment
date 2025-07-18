import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { PaywallService } from "@/lib/paywall"
import { SubscriptionService } from "@/lib/subscription"

const openaiClient = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    console.log("🔍 Cover Letter Generation API called")

    // Check paywall for cover letters
    const paywallCheck = await PaywallService.checkAndRecordUsage("cover_letters")
    if (!paywallCheck.allowed) {
      console.log("🚫 Paywall triggered for cover letters")
      return NextResponse.json(
        {
          success: false,
          error: "Usage limit reached",
          paywallInfo: paywallCheck.paywallInfo,
        },
        { status: 402 }
      )
    }

    console.log("API Route - Environment check:")
    console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY)
    console.log("OPENAI_API_KEY length:", process.env.OPENAI_API_KEY?.length || 0)

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
    }

    const { jobPosting, cvContent } = await request.json()

    if (!jobPosting || !cvContent) {
      return NextResponse.json({ error: "Job posting and CV content are required" }, { status: 400 })
    }

    // Determine AI model based on user tier
    const userTier = await SubscriptionService.getUserTier()
    const aiModel = userTier === "free" ? "gpt-3.5-turbo" : "gpt-4o"
    
    console.log(`🤖 Using ${aiModel} for user tier: ${userTier}`)

    const { text } = await generateText({
      model: openaiClient(aiModel),
      system: `You are an expert career coach and professional writer specializing in creating compelling cover letters. Your task is to write personalized, professional cover letters that effectively match candidates to job opportunities.

Guidelines:
- Write in a professional, confident tone
- Highlight relevant experience from the CV that matches job requirements
- Show enthusiasm for the specific role and company
- Keep it concise (3-4 paragraphs)
- Include specific examples and achievements when possible
- Avoid generic phrases and clichés
- Make it ATS-friendly`,
      prompt: `Based on the following job posting and candidate's CV, write a compelling cover letter:

JOB POSTING:
${jobPosting}

CANDIDATE'S CV:
${cvContent}

Please write a professional cover letter that specifically addresses the job requirements and highlights the most relevant qualifications from the CV.`,
    })

    return NextResponse.json({ coverLetter: text })
  } catch (error) {
    console.error("Error generating cover letter:", error)
    return NextResponse.json(
      { error: `Failed to generate cover letter: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 },
    )
  }
}
