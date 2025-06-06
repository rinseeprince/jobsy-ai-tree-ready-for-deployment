// Resume parser utility - browser-compatible version
// Server-side parsing is handled by /api/cv-parser

// Define the interfaces here (using the existing structure from your codebase)
export interface ParsedResumeData {
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

interface ParsedResume {
  text: string
  structured?: ParsedResumeData | null
}

// Browser-compatible function that calls the API
export async function parseResume(file: File): Promise<ParsedResume> {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/cv-parser", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()
    return {
      text: data.text,
      structured: data.structured || null,
    }
  } catch (error) {
    console.error("Error parsing resume:", error)
    throw new Error("Failed to parse resume")
  }
}

// Mock function for testing - browser compatible
export async function parseResumeFromFile(file: File): Promise<ParsedResumeData> {
  console.log("Parsing resume file:", file.name, file.type)

  // Simulate parsing delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Return mock data
  return {
    personal: {
      firstName: "Samuel",
      lastName: "James Willdridge Kalepa",
      jobTitle: "Senior Sales Manager",
      email: "",
      phone: "07435532945",
      location: "London, GB",
      website: "",
      linkedin: "",
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
}
