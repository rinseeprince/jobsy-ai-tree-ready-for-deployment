import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Enhanced skill validation function
function isValidSkill(skill: string): boolean {
  const trimmedSkill = skill.trim()

  // Basic length and character validation
  if (trimmedSkill.length < 2 || trimmedSkill.length > 50) return false
  if (/^\d+$/.test(trimmedSkill)) return false // Numbers only
  if (!/^[a-zA-Z0-9\s+#.\-/$$$$]+$/.test(trimmedSkill)) return false // Invalid characters

  // Date patterns
  const datePatterns = [
    /\d{1,2}\/\d{4}/, // MM/YYYY or M/YYYY
    /\d{4}-\d{2}/, // YYYY-MM
    /\d{1,2}\/\d{1,2}\/\d{4}/, // MM/DD/YYYY or DD/MM/YYYY
    /(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{4}/i,
    /\d{4}\s*-\s*\d{4}/, // Year ranges
    /(present|current|ongoing)/i,
  ]

  if (datePatterns.some((pattern) => pattern.test(trimmedSkill))) return false

  // Location patterns
  const locationPatterns = [
    /\b(london|manchester|birmingham|glasgow|edinburgh|cardiff|belfast|liverpool|leeds|sheffield|bristol|newcastle|nottingham|leicester|coventry|hull|stoke|derby|plymouth|wolverhampton|southampton|reading|oxford|cambridge|brighton|bournemouth|swindon|northampton|luton|warrington|dudley|york|stockport|west bromwich|blackpool|bolton|middlesbrough|huddersfield|peterborough|barnsley|oldham|portsmouth|preston|telford|milton keynes|gloucester|crawley|gillingham|rotherham|st helens|sutton coldfield|exeter|scunthorpe|watford|eastbourne|blackburn|ipswich|oxford|slough|thurrock|burnley|bedford|chelmsford|lincoln|chesterfield|basingstoke|worcester|mansfield|carlisle|hartlepool|halifax|poole|maidstone|nuneaton|aylesbury|shrewsbury|colchester|redditch|grimsby|rhondda|barry|caerphilly|newport|swansea|dundee|paisley|east kilbride|livingston|cumbernauld|hamilton|kirkcaldy|ayr|perth|kilmarnock|inverness|greenock|airdrie|falkirk|stirling|irvine|dumfries|motherwell|rutherglen|wishaw|clydebank|bearsden|cambuslang|bishopbriggs|musselburgh|arbroath|elgin|dumbarton|stranraer|stenhousemuir|bellshill|penicuik|alloa|grangemouth|johnstone|dalkeith|larkhall|barrhead|troon|prestwick|stevenston|saltcoats|ardrossan|largs|millport|rothesay|campbeltown|oban|fort william|mallaig|portree|stornoway|kirkwall|lerwick)\b/i,
    /\b(uk|united kingdom|england|scotland|wales|northern ireland|gb|great britain)\b/i,
    /\b\w+,\s*(uk|gb|united kingdom)\b/i,
  ]

  if (locationPatterns.some((pattern) => pattern.test(trimmedSkill))) return false

  // Common non-skill words and phrases
  const invalidWords = [
    "level",
    "blue",
    "green",
    "red",
    "basic",
    "intermediate",
    "advanced",
    "beginner",
    "engaging",
    "key",
    "decision",
    "makers",
    "address",
    "objections",
    "fully",
    "company",
    "organization",
    "team",
    "department",
    "role",
    "position",
    "experience",
    "years",
    "months",
    "week",
    "day",
    "time",
    "period",
    "responsible",
    "duties",
    "tasks",
    "achievements",
    "accomplishments",
    "is a",
    "was a",
    "were",
    "has been",
    "have been",
    "will be",
    "the",
    "and",
    "or",
    "but",
    "with",
    "for",
    "in",
    "on",
    "at",
    "to",
    "from",
  ]

  const lowerSkill = trimmedSkill.toLowerCase()
  if (
    invalidWords.some(
      (word) => lowerSkill === word || lowerSkill.includes(word + " ") || lowerSkill.includes(" " + word),
    )
  ) {
    return false
  }

  // Sentence fragments (contains multiple words that form sentences)
  if (
    trimmedSkill.split(" ").length > 4 &&
    /\b(is|was|are|were|have|has|will|can|could|should|would)\b/i.test(trimmedSkill)
  ) {
    return false
  }

  // Positive validation for known skill patterns
  const skillPatterns = [
    /^[A-Z][a-zA-Z+#]*$/, // Programming languages (Java, C++, C#, etc.)
    /^[A-Z][a-zA-Z]*\s+(Development|Programming|Management|Analysis|Design)$/i,
    /^(Microsoft|Adobe|Google|Amazon|Oracle|SAP|Salesforce)\s+\w+$/i, // Software tools
    /^\w+\.(js|py|java|cpp|cs|php|rb|go|rs|swift|kt)$/i, // File extensions as skills
    /^(HTML|CSS|SQL|API|REST|GraphQL|JSON|XML|YAML|Docker|Kubernetes|AWS|Azure|GCP)$/i, // Common tech acronyms
  ]

  // If it matches a positive pattern, it's likely a valid skill
  if (skillPatterns.some((pattern) => pattern.test(trimmedSkill))) {
    return true
  }

  // Additional validation: must not be a complete sentence
  if (trimmedSkill.includes(".") && trimmedSkill.split(".").length > 2) return false

  return true
}

// Function to clean and validate skills array
function cleanSkillsArray(skills: string[]): string[] {
  return skills
    .map((skill) => skill.trim())
    .filter((skill) => skill.length > 0)
    .filter(isValidSkill)
    .filter((skill, index, array) => array.indexOf(skill) === index) // Remove duplicates
    .slice(0, 20) // Limit to 20 skills max
}

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

SPECIAL INSTRUCTIONS FOR SKILLS EXTRACTION:
For the "skills" array, ONLY extract legitimate technical, soft, and hard skills. DO NOT include:
- Company names (e.g., "Google", "Microsoft" as employers, but "Google Analytics" as a tool is OK)
- Locations or addresses (e.g., "London", "UK", "New York")
- Dates or time periods (e.g., "2023", "06/2024", "January")
- Job titles or positions (e.g., "Manager", "Developer" - unless it's a skill like "Project Management")
- Sentence fragments or incomplete phrases
- Random words that aren't skills
- Numbers alone
- Common words like "level", "blue", "engaging", "key", "decision", "makers"

VALID SKILLS INCLUDE:
- Programming languages (JavaScript, Python, Java, C++)
- Software tools (Photoshop, Excel, Salesforce, HubSpot)
- Technical skills (SEO, Project Management, Data Analysis)
- Soft skills (Leadership, Communication, Problem Solving)
- Certifications or methodologies (Agile, Scrum, Six Sigma)
- Industry-specific knowledge (Digital Marketing, Financial Analysis)

PARAGRAPH PRESERVATION EXAMPLES:
- If the original has multiple paragraphs, separate them with \\n\\n
- If the original has bullet points, keep them as bullet points
- If there are line breaks between achievements, preserve them with \\n

SPECIAL INSTRUCTIONS FOR PROFESSIONAL TITLE:
For the "jobTitle" field, prioritize in this order:
1. The job title from the most recent/current work experience entry (where current: true)
2. The most recent job title from work experience if no current position
3. Any professional title mentioned in the header/contact section of the CV
4. If none found, leave empty

CV Content to parse:
${cvText}

Extract and return ONLY the exact content in this JSON format:
{
  "personal": {
    "firstName": "exact first name from CV",
    "lastName": "exact last name from CV", 
    "jobTitle": "exact current job title from CV - prioritize the most recent/current position title from work experience section, or if not available, use any professional title mentioned at the top of the CV",
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
  "skills": ["ONLY legitimate skills - no dates, locations, company names, or sentence fragments"],
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
- Extract EXACTLY - do not improve, rephrase, or generate new content
- For skills: ONLY extract actual skills, not dates, locations, or random text fragments`

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

      // Additional validation and cleaning of skills array
      if (parsedCV.skills && Array.isArray(parsedCV.skills)) {
        console.log("Original skills:", parsedCV.skills)
        parsedCV.skills = cleanSkillsArray(parsedCV.skills)
        console.log("Cleaned skills:", parsedCV.skills)
      }
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
