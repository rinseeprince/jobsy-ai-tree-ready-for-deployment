/**
 * PDF parsing utility using browser APIs
 * For production, consider using libraries like pdf-parse or pdf2pic
 */

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // This is a basic implementation
    // For better PDF parsing, you'd want to use a dedicated library
    const arrayBuffer = await file.arrayBuffer()

    // Try to extract text using basic methods
    // This won't work for all PDFs, especially image-based ones
    const uint8Array = new Uint8Array(arrayBuffer)
    let text = ""

    // Look for text objects in PDF
    for (let i = 0; i < uint8Array.length - 1; i++) {
      if (uint8Array[i] === 40 && uint8Array[i + 1] !== 40) {
        // Look for '(' not followed by '('
        let j = i + 1
        let textChunk = ""
        while (j < uint8Array.length && uint8Array[j] !== 41) {
          // Until ')'
          if (uint8Array[j] >= 32 && uint8Array[j] <= 126) {
            // Printable ASCII
            textChunk += String.fromCharCode(uint8Array[j])
          }
          j++
        }
        if (textChunk.length > 2) {
          text += textChunk + " "
        }
        i = j
      }
    }

    // Clean up the extracted text
    text = text
      .replace(/\s+/g, " ")
      .replace(/[^\w\s@.-]/g, " ")
      .trim()

    if (text.length < 50) {
      throw new Error("Unable to extract sufficient text from PDF")
    }

    return text
  } catch (error) {
    console.error("PDF parsing error:", error)
    throw new Error("Failed to parse PDF file. Please try uploading a text file or a different PDF.")
  }
}
