"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Upload, Download, Check, AlertCircle } from "lucide-react"

export default function CVBuilderPage() {
  const [loading, setLoading] = useState(false)
  const [cvContent, setCvContent] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [improvedCV, setImprovedCV] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("upload")

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is PDF
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file")
      return
    }

    setLoading(true)
    setError("")

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
      setCvContent(data.text)
      setActiveTab("edit")
      setSuccess("CV uploaded and parsed successfully!")
    } catch (err) {
      console.error("Error uploading CV:", err)
      setError("Failed to parse CV. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleImproveCV = async () => {
    if (!cvContent) {
      setError("Please upload or enter your CV content first")
      return
    }

    if (!jobDescription) {
      setError("Please enter a job description to tailor your CV")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/improve-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cvContent,
          jobDescription,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()
      setImprovedCV(data.improvedCV)
      setActiveTab("improved")
      setSuccess("CV improved successfully!")
    } catch (err) {
      console.error("Error improving CV:", err)
      setError("Failed to improve CV. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const downloadCV = () => {
    const element = document.createElement("a")
    const file = new Blob([improvedCV], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = "improved-cv.txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CV Builder</h1>
          <p className="text-gray-600 mt-2">
            Upload your CV and tailor it to specific job descriptions with AI assistance
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
            <Check className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="upload">Upload CV</TabsTrigger>
            <TabsTrigger value="edit">Edit & Tailor</TabsTrigger>
            <TabsTrigger value="improved" disabled={!improvedCV}>
              Improved CV
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Upload Your CV</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload your CV</h3>
                  <p className="text-gray-500 mb-4">PDF format only</p>
                  <div className="relative">
                    <Input
                      id="cv-upload"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={loading}
                    />
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                      disabled={loading}
                    >
                      {loading ? "Uploading..." : "Select File"}
                    </Button>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-500 mb-2">Or</p>
                  <Button variant="outline" onClick={() => setActiveTab("edit")}>
                    Enter CV Content Manually
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="edit">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Edit & Tailor Your CV</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cv-content">Your CV Content</Label>
                  <Textarea
                    id="cv-content"
                    value={cvContent}
                    onChange={(e) => setCvContent(e.target.value)}
                    placeholder="Paste or edit your CV content here..."
                    className="min-h-[200px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job-description">Job Description</Label>
                  <Textarea
                    id="job-description"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here to tailor your CV..."
                    className="min-h-[150px]"
                  />
                </div>

                <Button
                  onClick={handleImproveCV}
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  disabled={loading || !cvContent || !jobDescription}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Improving CV...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Improve My CV
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="improved">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Your Improved CV</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <pre className="whitespace-pre-wrap">{improvedCV}</pre>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setActiveTab("edit")}>
                    Edit Further
                  </Button>
                  <Button
                    onClick={downloadCV}
                    className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download CV
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
