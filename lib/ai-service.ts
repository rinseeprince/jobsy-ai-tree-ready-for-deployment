export async function generateCoverLetter(jobPosting: string, cvContent: string): Promise<string> {
  try {
    console.log("=== NEW API ROUTE VERSION BEING CALLED ===")

    const response = await fetch("/api/generate-cover-letter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jobPosting, cvContent }),
    })

    console.log("API response status:", response.status)

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to generate cover letter")
    }

    return data.coverLetter
  } catch (error) {
    console.error("Error in NEW ai-service calling API route:", error)
    return "There was an error generating your cover letter. Please try again."
  }
}

export async function improveCv(jobPosting: string, cvContent: string): Promise<string> {
  try {
    console.log("=== NEW CV IMPROVEMENT API ROUTE VERSION ===")

    const response = await fetch("/api/improve-cv", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jobPosting, cvContent }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Failed to generate CV improvements")
    }

    return data.cvSuggestions
  } catch (error) {
    console.error("Error in NEW ai-service calling CV API route:", error)
    return "There was an error generating your CV improvement suggestions. Please try again."
  }
}
