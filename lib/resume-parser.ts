// CV/Resume parser utility - browser-compatible version
// Server-side parsing is handled by /api/cv-parser

// Define the interfaces here (using the existing structure from your codebase)
export interface CVData {
  id?: string
  user_id?: string
  name: string
  original_filename: string
  file_size: number
  raw_text: string
  created_at?: string
  updated_at?: string
}

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

interface ParsedCV {
  text: string
  fileName: string
  fileSize: number
}

interface ParsedResume {
  text: string
  structured?: ParsedResumeData | null
}

// Browser-compatible function that calls the API
export async function parseCV(file: File): Promise<ParsedCV> {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/cv-parser", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error: ${response.status}`)
    }

    const data = await response.json()
    return {
      text: data.text,
      fileName: data.fileName,
      fileSize: data.fileSize,
    }
  } catch (error) {
    console.error("Error parsing CV:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to parse CV")
  }
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

// NEW: AI parsing function that calls the API endpoint
export async function parseResumeWithAI(cvText: string): Promise<ParsedResumeData | null> {
  try {
    console.log("🤖 Starting AI resume parsing...")
    console.log("📄 Resume text length:", cvText.length)

    const response = await fetch("/api/ai-cv-parser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cvText }),
    })

    if (!response.ok) {
      console.error(`❌ AI parsing API error: ${response.status}`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("🤖 Raw AI response:", data)

    if (data.error) {
      console.error("❌ AI parsing error:", data.error)
      throw new Error(data.error)
    }

    if (data.parsedCV) {
      console.log("✅ AI parsing successful")
      console.log("🔍 Extracted skills:", data.parsedCV.skills)
      console.log("📊 Skills count:", data.parsedCV.skills?.length || 0)
      return data.parsedCV
    }

    console.warn("⚠️ No parsed CV data in response")
    return null
  } catch (error) {
    console.error("❌ Error parsing resume with AI:", error)
    return null
  }
}

// Function to extract skills from text using simple pattern matching as fallback
export const extractSkillsFromText = (text: string): string[] => {
  const skillKeywords = [
    // Programming languages
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "C#",
    "PHP",
    "Ruby",
    "Go",
    "Rust",
    "Swift",
    "Kotlin",
    "Scala",
    "R",
    "MATLAB",
    // Web technologies
    "React",
    "Vue",
    "Angular",
    "Node.js",
    "Express",
    "Next.js",
    "Nuxt.js",
    "HTML",
    "CSS",
    "SASS",
    "SCSS",
    "Bootstrap",
    "Tailwind",
    "jQuery",
    // Databases
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "SQLite",
    "Oracle",
    "SQL Server",
    "Cassandra",
    "DynamoDB",
    "Firebase",
    // Cloud & DevOps
    "AWS",
    "Azure",
    "Google Cloud",
    "GCP",
    "Docker",
    "Kubernetes",
    "Jenkins",
    "Git",
    "GitHub",
    "GitLab",
    "CI/CD",
    "Terraform",
    "Ansible",
    // Tools & Software
    "Salesforce",
    "HubSpot",
    "Slack",
    "Jira",
    "Confluence",
    "Figma",
    "Adobe",
    "Photoshop",
    "Illustrator",
    "InDesign",
    "Sketch",
    "Canva",
    // Business skills
    "Project Management",
    "Leadership",
    "Communication",
    "Team Management",
    "Strategic Planning",
    "Data Analysis",
    "Problem Solving",
    "Customer Service",
    "Sales",
    "Marketing",
    "SEO",
    "SEM",
    "Content Marketing",
    "Social Media Marketing",
    "Email Marketing",
    // Analytics
    "Google Analytics",
    "Google Ads",
    "Facebook Ads",
    "LinkedIn Ads",
    "Excel",
    "PowerBI",
    "Tableau",
    "Looker",
    "Mixpanel",
    // Mobile Development
    "iOS",
    "Android",
    "React Native",
    "Flutter",
    "Xamarin",
    // Data Science & AI
    "Machine Learning",
    "Deep Learning",
    "TensorFlow",
    "PyTorch",
    "Pandas",
    "NumPy",
    "Scikit-learn",
    "Data Mining",
    "Statistics",
    // Design
    "UI/UX",
    "User Experience",
    "User Interface",
    "Wireframing",
    "Prototyping",
    "Design Thinking",
    // Methodologies
    "Agile",
    "Scrum",
    "Kanban",
    "Waterfall",
    "Lean",
    "Six Sigma",
    // Soft Skills
    "Critical Thinking",
    "Creativity",
    "Adaptability",
    "Time Management",
    "Multitasking",
    "Attention to Detail",
    "Public Speaking",
    "Presentation",
    "Negotiation",
    "Conflict Resolution",
  ]

  const foundSkills: string[] = []
  const textLower = text.toLowerCase()

  // Look for exact skill matches
  skillKeywords.forEach((skill) => {
    if (textLower.includes(skill.toLowerCase())) {
      foundSkills.push(skill)
    }
  })

  // Also look for skills sections and extract from there
  const skillsSectionRegex =
    /(?:skills?|competencies|technologies|tools|technical skills|core competencies)[\s\S]*?(?:\n\n|\n[A-Z][A-Z\s]+\n|$)/gi
  const skillsSectionMatch = text.match(skillsSectionRegex)

  if (skillsSectionMatch) {
    skillsSectionMatch.forEach((section) => {
      console.log("🔍 Found skills section:", section.substring(0, 100) + "...")

      // Extract comma-separated items and bullet points
      const items = section
        .split(/[,\n•·-]/)
        .map((item) => item.trim())
        .filter(
          (item) =>
            item.length > 2 &&
            item.length < 30 &&
            !item.match(/^(skills?|competencies|technologies|tools|technical skills|core competencies)$/i) &&
            !item.match(/^\d+$/) && // Remove numbers
            !item.match(/^[^\w\s]+$/), // Remove special characters only
        )

      console.log("🔧 Extracted items from skills section:", items)
      foundSkills.push(...items)
    })
  }

  // Look for programming languages pattern
  const programmingPattern = /(?:programming languages?|languages?|coding)[\s:]*([^\n]+)/gi
  const programmingMatch = text.match(programmingPattern)
  if (programmingMatch) {
    programmingMatch.forEach((match) => {
      const languages = match
        .replace(/(?:programming languages?|languages?|coding)[\s:]*/gi, "")
        .split(/[,&]/)
        .map((lang) => lang.trim())
        .filter((lang) => lang.length > 1 && lang.length < 20)
      foundSkills.push(...languages)
    })
  }

  // Remove duplicates and clean up
  const uniqueSkills = [...new Set(foundSkills)]
    .filter((skill) => skill && skill.trim().length > 0)
    .map((skill) => skill.trim())
    .slice(0, 25) // Limit to 25 skills

  console.log("🎯 Final extracted skills:", uniqueSkills)
  return uniqueSkills
}

// Basic fallback parser (existing functionality)
export function parseBasicResume(text: string) {
  // Basic parsing logic as fallback
  return {
    personal: {
      firstName: "",
      lastName: "",
      jobTitle: "",
      email: extractEmail(text) || "",
      phone: extractPhone(text) || "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
      twitter: "",
      summary: "",
    },
    experience: [],
    education: [],
    skills: extractSkillsFromText(text),
    certifications: [],
  }
}

function extractEmail(text: string): string | null {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
  const match = text.match(emailRegex)
  return match ? match[0] : null
}

function extractPhone(text: string): string | null {
  const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\(?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/
  const match = text.match(phoneRegex)
  return match ? match[0] : null
}
