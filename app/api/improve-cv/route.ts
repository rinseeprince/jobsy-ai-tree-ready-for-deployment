import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    console.log("=== CV IMPROVEMENT API ROUTE CALLED ===")

    const { cvContent, jobDescription } = await request.json()

    if (!cvContent || !jobDescription) {
      return NextResponse.json({ error: "CV content and job description are required" }, { status: 400 })
    }

    console.log("CV Content length:", cvContent.length)
    console.log("Job Description length:", jobDescription.length)

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `You are an expert CV optimization specialist with deep knowledge of Applicant Tracking Systems (ATS) and modern recruitment practices. 

TASK: Analyze the provided CV against the job description and provide comprehensive, ATS-optimized improvement recommendations.

ATS OPTIMIZATION REQUIREMENTS:
- Use exact keywords and phrases from the job description
- Recommend industry-standard section headings (EXPERIENCE, EDUCATION, SKILLS, etc.)
- Suggest quantifiable achievements with specific metrics
- Ensure proper formatting for ATS parsing
- Recommend relevant technical and soft skills
- Optimize for keyword density without stuffing

CV CONTENT:
${cvContent}

JOB DESCRIPTION:
${jobDescription}

Please provide detailed, actionable recommendations in the following format:

## ATS OPTIMIZATION SUMMARY
[Brief overview of ATS compatibility and keyword matching score]

## KEYWORD OPTIMIZATION
- Missing critical keywords from job description
- Recommended keyword placement strategies
- Industry-specific terminology to include

## PROFESSIONAL SUMMARY IMPROVEMENTS
[Detailed rewrite suggestions with ATS-friendly language and job-specific keywords]

## EXPERIENCE SECTION ENHANCEMENTS
- Quantify achievements with specific metrics (percentages, dollar amounts, team sizes)
- Use action verbs that match job requirements
- Include relevant technologies, methodologies, and tools mentioned in job posting
- Structure bullet points for maximum ATS readability

## SKILLS SECTION OPTIMIZATION
- Technical skills that match job requirements
- Soft skills mentioned in job description
- Industry certifications and tools
- Proper skill categorization for ATS parsing

## EDUCATION & CERTIFICATIONS
[Recommendations for highlighting relevant education and adding missing certifications]

## FORMATTING FOR ATS SUCCESS
- Section heading recommendations
- Bullet point structure
- File format suggestions
- Font and layout considerations

## ADDITIONAL RECOMMENDATIONS
- Industry-specific improvements
- Missing sections that could strengthen application
- Tailoring strategies for this specific role

Provide specific, actionable advice with examples. Focus on making the CV both human-readable and ATS-friendly while maintaining authenticity.`,
    })

    console.log("✅ AI CV improvement generated successfully")

    return NextResponse.json({
      improvedCV: text,
    })
  } catch (error) {
    console.error("❌ Error in CV improvement API:", error)
    return NextResponse.json({ error: "Failed to generate CV improvements" }, { status: 500 })
  }
}
