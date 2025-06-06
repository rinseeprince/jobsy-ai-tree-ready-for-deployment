import { type NextRequest, NextResponse } from "next/server"

// Define the resume data type
interface ResumeData {
  personal: {
    firstName: string
    lastName: string
    jobTitle: string
    email: string
    phone: string
    location: string
    website: string
    linkedin: string
    github: string
    twitter: string
    summary: string
  }
  experience: Array<{
    title: string
    company: string
    location: string
    startDate: string
    endDate: string
    current: boolean
    description: string
  }>
  education: Array<{
    degree: string
    institution: string
    location: string
    startDate: string
    endDate: string
    current: boolean
    description: string
  }>
  skills: string[]
  certifications: Array<{
    name: string
    issuer: string
    date: string
    description: string
  }>
}

// Mock resume data for testing
const mockResumeData: ResumeData = {
  personal: {
    firstName: "Samuel",
    lastName: "Kalepa",
    jobTitle: "Senior Sales Manager",
    email: "s.kalepa@example.com",
    phone: "07435532945",
    location: "London, GB",
    website: "",
    linkedin: "linkedin.com/in/samuelkalepa",
    github: "",
    twitter: "",
    summary:
      "Results-driven sales professional with over 8 years of experience in B2B software sales. Proven track record of exceeding targets and building strong client relationships. Skilled in consultative selling, team leadership, and sales strategy development.",
  },
  experience: [
    {
      title: "Senior Sales Manager",
      company: "TechSolutions Inc.",
      location: "London, UK",
      startDate: "2020-06",
      endDate: "",
      current: true,
      description:
        "• Led a team of 8 sales representatives, achieving 127% of annual revenue target\n• Implemented new sales methodology that increased average deal size by 32%\n• Developed strategic partnerships with 5 enterprise clients worth £2.5M in annual revenue\n• Reduced sales cycle by 15% through process optimization and improved qualification",
    },
    {
      title: "Sales Team Lead",
      company: "CloudServices Ltd.",
      location: "Manchester, UK",
      startDate: "2017-03",
      endDate: "2020-05",
      current: false,
      description:
        "• Managed a team of 5 sales representatives, consistently exceeding quarterly targets\n• Onboarded and trained 12 new sales representatives with 90% retention rate\n• Developed and implemented new outreach strategy that increased qualified leads by 45%\n• Recognized as Top Sales Performer for 7 consecutive quarters",
    },
  ],
  education: [
    {
      degree: "Bachelor of Business Administration",
      institution: "University of Manchester",
      location: "Manchester, UK",
      startDate: "2013-09",
      endDate: "2017-06",
      current: false,
      description:
        "• Specialization in Marketing and Sales Management\n• Graduated with First Class Honours\n• President of Business Society\n• Completed internship with leading technology company",
    },
  ],
  skills: [
    "B2B Sales",
    "Team Leadership",
    "CRM Systems",
    "Sales Strategy",
    "Client Relationship Management",
    "Negotiation",
    "Sales Analytics",
    "Consultative Selling",
    "Pipeline Management",
    "Sales Forecasting",
  ],
  certifications: [
    {
      name: "Certified Sales Professional (CSP)",
      issuer: "National Association of Sales Professionals",
      date: "2019-05",
      description: "",
    },
    {
      name: "Salesforce Certified Administrator",
      issuer: "Salesforce",
      date: "2018-11",
      description: "",
    },
  ],
}

async function extractTextFromFile(file: File): Promise<string> {
  try {
    // Simple text extraction - works for TXT files
    if (file.type === "text/plain") {
      return await file.text()
    }

    // For other file types, try to read as text
    const text = await file.text()
    return text
  } catch (error) {
    console.error("Error reading file:", error)
    throw new Error("Unable to read file content")
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Parse resume API called")

    // Get the form data from the request
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      console.error("No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("Processing file:", file.name, "Size:", file.size, "Type:", file.type)

    // Extract text content from the file
    let textContent = ""
    try {
      textContent = await extractTextFromFile(file)
      console.log("Text extracted, length:", textContent.length)
    } catch (error) {
      console.warn("Could not extract text from file:", error instanceof Error ? error.message : "Unknown error")
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // For now, return mock data but you could analyze textContent here
    const result = {
      ...mockResumeData,
      // You could customize based on file content in the future
    }

    console.log("Resume parsed successfully for:", result.personal.firstName, result.personal.lastName)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Error parsing resume:", error)
    return NextResponse.json(
      {
        error: "Failed to parse resume",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
