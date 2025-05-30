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
        console.log("🔍 Starting PDF parsing with pdf-parse...")

        try {
          // Try to import and use pdf-parse
          const pdfParse = (await import("pdf-parse")).default
          const buffer = Buffer.from(await file.arrayBuffer())

          console.log("📊 Buffer created, size:", buffer.length, "bytes")

          // Try parsing with different options
          const pdfData = await pdfParse(buffer, {
            max: 0, // Parse all pages
            version: "v1.10.100", // Specify version for compatibility
          })

          extractedText = pdfData.text
          console.log("✅ PDF parsed successfully")
          console.log("📝 Extracted text length:", extractedText.length, "characters")
          console.log("📄 Number of pages:", pdfData.numpages)

          // Check if we got meaningful text
          if (extractedText && extractedText.trim().length > 10) {
            console.log("🔤 First 200 chars:", extractedText.substring(0, 200))
          } else {
            throw new Error("PDF appears to be image-based or contains no extractable text")
          }
        } catch (pdfError) {
          console.error("❌ PDF parsing error:", pdfError)

          // Return a more helpful error message
          return NextResponse.json(
            {
              error: "PDF_PARSING_FAILED",
              message: "This PDF cannot be processed automatically. This usually happens with:",
              details: [
                "• Scanned documents (image-based PDFs)",
                "• Password-protected PDFs",
                "• PDFs with complex formatting",
                "• Older PDF formats",
              ],
              suggestion: "Please try one of these alternatives:",
              alternatives: [
                "• Convert your PDF to a Word document (.docx)",
                "• Copy and paste your CV text directly into the text area",
                "• Use a different PDF if you have one",
              ],
            },
            { status: 400 },
          )
        }
      } else if (
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword"
      ) {
        console.log("📝 Starting Word document parsing with mammoth...")

        try {
          const mammoth = await import("mammoth")
          const buffer = Buffer.from(await file.arrayBuffer())
          const result = await mammoth.extractRawText({ buffer })
          extractedText = result.value

          console.log("✅ Word document parsed successfully")
          console.log("📝 Extracted text length:", extractedText.length, "characters")
        } catch (wordError) {
          console.error("❌ Word parsing error:", wordError)
          return NextResponse.json(
            {
              error: "WORD_PARSING_FAILED",
              message: `Word document parsing failed: ${wordError instanceof Error ? wordError.message : "Unknown error"}`,
              suggestion: "Please try pasting your CV content directly into the text area.",
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
            supportedTypes: ["PDF (.pdf)", "Word Document (.docx, .doc)"],
            suggestion: "Please upload a supported file type or paste your CV text directly.",
          },
          { status: 400 },
        )
      }

      // Final check for extracted text
      if (!extractedText || extractedText.trim().length < 10) {
        return NextResponse.json(
          {
            error: "NO_TEXT_EXTRACTED",
            message: "No meaningful text could be extracted from this file.",
            suggestion: "Please copy and paste your CV content directly into the text area below.",
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
    } catch (parseError) {
      console.error("❌ General parsing error:", parseError)
      return NextResponse.json(
        {
          error: "GENERAL_PARSING_ERROR",
          message: `Could not parse the file: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
          suggestion: "Please try pasting your CV content manually in the text area below.",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("❌ API Route error:", error)
    return NextResponse.json(
      {
        error: "SERVER_ERROR",
        message: `Server error: ${error instanceof Error ? error.message : "Unknown error"}`,
        suggestion: "Please try again or contact support if the problem persists.",
      },
      { status: 500 },
    )
  }
}
