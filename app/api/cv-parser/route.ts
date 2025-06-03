import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      console.log("❌ No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("📄 Processing file:", file.name, file.type, `${(file.size / 1024).toFixed(1)} KB`)

    let extractedText = ""

    try {
      if (file.type === "application/pdf") {
        console.log("🔍 PDF file detected...")

        // PDF processing is not available in this environment
        return NextResponse.json(
          {
            error: "PDF_PROCESSING_UNAVAILABLE",
            message: "PDF processing is temporarily unavailable in this environment.",
            suggestion: "Please convert your PDF to a Word document or copy and paste your CV text directly.",
            alternatives: [
              "Convert your PDF to a Word document (.docx)",
              "Copy and paste your CV text directly into the text area below",
              "Use an online PDF to text converter and paste the result",
            ],
          },
          { status: 400 },
        )
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword"
      ) {
        console.log("📝 Starting Word document parsing...")

        try {
          // Dynamic import to avoid build issues
          const mammoth = await import("mammoth")
          const buffer = Buffer.from(await file.arrayBuffer())
          const result = await mammoth.extractRawText({ buffer })
          extractedText = result.value

          console.log("✅ Word document parsed successfully")
          console.log("📝 Extracted text length:", extractedText.length, "characters")

          if (!extractedText.trim()) {
            return NextResponse.json(
              {
                error: "NO_TEXT_EXTRACTED",
                message: "No text could be extracted from the Word document.",
                suggestion: "The document might be empty or contain only images.",
                alternatives: [
                  "Check that your Word document contains text content",
                  "Try saving your document in a different format",
                  "Copy and paste your CV content directly into the text area",
                ],
              },
              { status: 400 },
            )
          }
        } catch (wordError: unknown) {
          console.error("❌ Word parsing error:", wordError)
          const errorMessage = wordError instanceof Error ? wordError.message : "Unknown Word parsing error"
          return NextResponse.json(
            {
              error: "WORD_PARSING_FAILED",
              message: `Word document parsing failed: ${errorMessage}`,
              suggestion: "There was an issue processing your Word document.",
              alternatives: [
                "Try saving your document as a newer .docx format",
                "Check that the document is not corrupted",
                "Copy and paste your CV content directly into the text area",
              ],
            },
            { status: 400 },
          )
        }
      } else {
        console.log("❌ Unsupported file type:", file.type)
        return NextResponse.json(
          {
            error: "UNSUPPORTED_FILE_TYPE",
            message: `File type not supported: ${file.type}`,
            supportedTypes: ["Word Document (.docx, .doc)"],
            suggestion: "Please upload a Word document, or paste your CV text directly.",
            alternatives: [
              "Convert your file to Word format (.docx)",
              "Copy and paste your CV text directly into the text area below",
            ],
          },
          { status: 400 },
        )
      }

      // Clean up the extracted text
      extractedText = extractedText
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, "\n\n") // Clean up line breaks
        .trim()

      console.log("🎉 Successfully extracted and cleaned text")
      console.log("📊 Final text length:", extractedText.length, "characters")

      return NextResponse.json({ text: extractedText })
    } catch (parseError: unknown) {
      console.error("❌ General parsing error:", parseError)
      const errorMessage = parseError instanceof Error ? parseError.message : "Unknown parsing error"
      return NextResponse.json(
        {
          error: "GENERAL_PARSING_ERROR",
          message: `Could not parse the file: ${errorMessage}`,
          suggestion: "There was an unexpected error processing your file.",
          alternatives: [
            "Try uploading a different version of your CV",
            "Convert your file to Word format (.docx)",
            "Copy and paste your CV content manually in the text area",
          ],
        },
        { status: 400 },
      )
    }
  } catch (error: unknown) {
    console.error("❌ API Route error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown server error"
    return NextResponse.json(
      {
        error: "SERVER_ERROR",
        message: `Server error: ${errorMessage}`,
        suggestion: "There was a server error processing your request.",
        alternatives: [
          "Please try again in a moment",
          "Try uploading a Word document instead",
          "Copy and paste your CV text manually",
          "Contact support if the problem persists",
        ],
      },
      { status: 500 },
    )
  }
}
