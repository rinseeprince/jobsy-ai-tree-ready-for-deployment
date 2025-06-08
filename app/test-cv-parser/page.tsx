"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react"

export default function TestCVParserPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<{
    text: string
    fileName: string
    fileSize: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check if it's a .docx or .doc file
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ]

      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Please select a .docx or .doc file only")
        setFile(null)
        return
      }

      setFile(selectedFile)
      setError(null)
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setError(null)

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
      setResult({
        text: data.text,
        fileName: data.fileName,
        fileSize: data.fileSize,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse CV")
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CV Parser Test</h1>
        <p className="text-muted-foreground">
          Test the .docx parsing functionality before integrating into the main CV builder.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload CV
            </CardTitle>
            <CardDescription>Select a .docx or .doc file to test the parsing functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cv-file">CV File (.docx or .doc only)</Label>
              <Input id="cv-file" type="file" accept=".docx,.doc" onChange={handleFileChange} className="mt-1" />
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileText className="h-4 w-4" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
              {isUploading ? "Parsing..." : "Parse CV"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Parsing Results
              </CardTitle>
              <CardDescription>
                Successfully parsed: {result.fileName} ({formatFileSize(result.fileSize)})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="parsed-text">Extracted Text</Label>
                <Textarea
                  id="parsed-text"
                  value={result.text}
                  readOnly
                  className="mt-1 min-h-[300px] font-mono text-sm"
                  placeholder="Parsed text will appear here..."
                />
              </div>
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>File Info:</strong> {result.fileName} • {formatFileSize(result.fileSize)} •
                  {result.text.length} characters extracted
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">1. Select a .docx or .doc file using the file input above</p>
            <p className="text-sm text-muted-foreground">
              2. Click &quot;Parse CV&quot; to test the parsing functionality
            </p>
            <p className="text-sm text-muted-foreground">3. Review the extracted text in the results section</p>
            <p className="text-sm text-muted-foreground">
              4. If parsing works correctly, we can proceed to integrate it into the CV builder
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
