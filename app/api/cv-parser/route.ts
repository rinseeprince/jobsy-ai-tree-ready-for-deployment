import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not supported. Please upload a PDF or Word document." },
        { status: 400 },
      )
    }

    // In a real implementation, you would use a library like pdf-parse or mammoth
    // to extract text from PDF or Word documents
    // For this example, we'll simulate text extraction

    // Simulated text extraction
    const extractedText = `John Doe
Software Engineer

EXPERIENCE
Senior Software Engineer | ABC Tech | 2020-Present
- Led development of cloud-based applications using React and Node.js
- Improved application performance by 40% through code optimization
- Mentored junior developers and conducted code reviews

Software Engineer | XYZ Solutions | 2018-2020
- Developed RESTful APIs using Express.js and MongoDB
- Implemented automated testing, achieving 90% code coverage
- Collaborated with UX designers to improve user experience

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2014-2018

SKILLS
JavaScript, TypeScript, React, Node.js, Express, MongoDB, AWS, Git, Docker`

    return NextResponse.json({ text: extractedText })
  } catch (error) {
    console.error("Error parsing CV:", error)
    return NextResponse.json({ error: "Failed to parse CV" }, { status: 500 })
  }
}
