"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Database, User, Shield, Save, Eye, Trash2 } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

type TestResult = {
  name: string
  status: "pending" | "success" | "error"
  message: string
  details?: string
}

type SavedCV = {
  id: string
  user_id: string
  title: string
  cv_data: Record<string, unknown>
  template_id: string
  status: string
  word_count: number
  created_at: string
  updated_at: string
}

type CVData = {
  personalInfo: {
    name: string
    email: string
    summary: string
  }
  experience: unknown[]
  education: unknown[]
  skills: string[]
  certifications: unknown[]
}

export default function TestCVSavePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [testCVTitle, setTestCVTitle] = useState("Test CV " + Date.now())
  const [savedCVs, setSavedCVs] = useState<SavedCV[]>([])

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
  }

  const updateTestResult = (name: string, status: "success" | "error", message: string, details?: string) => {
    setTestResults((prev) => {
      const existing = prev.find((r) => r.name === name)
      if (existing) {
        existing.status = status
        existing.message = message
        existing.details = details
        return [...prev]
      } else {
        return [...prev, { name, status, message, details }]
      }
    })
  }

  const runAllTests = async () => {
    if (!user) {
      alert("Please sign in first to run tests")
      return
    }

    setIsRunning(true)
    setTestResults([])

    // Initialize all tests as pending
    const tests = [
      "Database Connection",
      "Table Access",
      "Insert Test CV",
      "Read Test CV",
      "Update Test CV",
      "RLS Security Test",
      "Delete Test CV",
    ]

    setTestResults(tests.map((name) => ({ name, status: "pending" as const, message: "Running..." })))

    try {
      // Test 1: Database Connection
      await testDatabaseConnection()

      // Test 2: Table Access
      await testTableAccess()

      // Test 3: Insert Test CV
      const testCVId = await testInsertCV()

      // Test 4: Read Test CV
      await testReadCV(testCVId)

      // Test 5: Update Test CV
      await testUpdateCV(testCVId)

      // Test 6: RLS Security Test
      await testRLSSecurity()

      // Test 7: Delete Test CV
      await testDeleteCV(testCVId)

      // Refresh the CV list
      await loadUserCVs()
    } catch (error) {
      console.error("Test suite failed:", error)
    } finally {
      setIsRunning(false)
    }
  }

  const testDatabaseConnection = async () => {
    try {
      const { error } = await supabase.from("saved_cvs").select("count").limit(1)

      if (error) {
        updateTestResult("Database Connection", "error", "Failed to connect", error.message)
        throw error
      }

      updateTestResult("Database Connection", "success", "✅ Connected successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      updateTestResult("Database Connection", "error", "❌ Connection failed", errorMessage)
      throw error
    }
  }

  const testTableAccess = async () => {
    if (!user) throw new Error("User not authenticated")

    try {
      const { error } = await supabase.from("saved_cvs").select("id").eq("user_id", user.id).limit(1)

      if (error) {
        updateTestResult("Table Access", "error", "Failed to access table", error.message)
        throw error
      }

      updateTestResult("Table Access", "success", "✅ Table accessible")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      updateTestResult("Table Access", "error", "❌ Table access failed", errorMessage)
      throw error
    }
  }

  const testInsertCV = async (): Promise<string> => {
    if (!user) throw new Error("User not authenticated")

    try {
      const testData: CVData = {
        personalInfo: {
          name: "Test User",
          email: "test@example.com",
          summary: "This is a test CV for database validation",
        },
        experience: [],
        education: [],
        skills: ["Testing", "Database", "Supabase"],
        certifications: [],
      }

      const insertData = {
        user_id: user.id,
        title: testCVTitle,
        cv_data: testData,
        template_id: "modern",
        status: "draft",
        word_count: 15,
      }

      const { data, error } = await supabase.from("saved_cvs").insert(insertData).select().single()

      if (error) {
        updateTestResult("Insert Test CV", "error", "Failed to insert CV", error.message)
        throw error
      }

      updateTestResult("Insert Test CV", "success", `✅ CV inserted with ID: ${data.id}`)
      return data.id as string
    } catch (error) {
      let errorMessage = "Unknown error occurred"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = String((error as { message: unknown }).message)
      }

      updateTestResult("Insert Test CV", "error", "❌ Insert failed", errorMessage)
      throw error
    }
  }

  const testReadCV = async (cvId: string) => {
    try {
      const { data, error } = await supabase.from("saved_cvs").select("*").eq("id", cvId).single()

      if (error) {
        updateTestResult("Read Test CV", "error", "Failed to read CV", error.message)
        throw error
      }

      if (data.title !== testCVTitle) {
        updateTestResult("Read Test CV", "error", "Data mismatch", `Expected title: ${testCVTitle}, got: ${data.title}`)
        throw new Error("Data validation failed")
      }

      updateTestResult("Read Test CV", "success", "✅ CV read successfully with correct data")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      updateTestResult("Read Test CV", "error", "❌ Read failed", errorMessage)
      throw error
    }
  }

  const testUpdateCV = async (cvId: string) => {
    try {
      const updatedTitle = testCVTitle + " (Updated)"

      const { data, error } = await supabase
        .from("saved_cvs")
        .update({
          title: updatedTitle,
          word_count: 20,
        })
        .eq("id", cvId)
        .select()
        .single()

      if (error) {
        updateTestResult("Update Test CV", "error", "Failed to update CV", error.message)
        throw error
      }

      if (data.title !== updatedTitle) {
        updateTestResult("Update Test CV", "error", "Update verification failed", "Title not updated correctly")
        throw new Error("Update validation failed")
      }

      updateTestResult("Update Test CV", "success", "✅ CV updated successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      updateTestResult("Update Test CV", "error", "❌ Update failed", errorMessage)
      throw error
    }
  }

  const testRLSSecurity = async () => {
    if (!user) throw new Error("User not authenticated")

    try {
      // Try to access all CVs (should only return user's own CVs)
      const { data, error } = await supabase.from("saved_cvs").select("*")

      if (error) {
        updateTestResult("RLS Security Test", "error", "RLS test failed", error.message)
        throw error
      }

      // Check that all returned CVs belong to the current user
      const invalidCVs = data.filter((cv) => cv.user_id !== user.id)

      if (invalidCVs.length > 0) {
        updateTestResult(
          "RLS Security Test",
          "error",
          "❌ RLS SECURITY BREACH!",
          `Found ${invalidCVs.length} CVs from other users`,
        )
        throw new Error("RLS security failed")
      }

      updateTestResult(
        "RLS Security Test",
        "success",
        `✅ RLS working correctly (${data.length} CVs, all belong to user)`,
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      updateTestResult("RLS Security Test", "error", "❌ RLS test failed", errorMessage)
      throw error
    }
  }

  const testDeleteCV = async (cvId: string) => {
    try {
      const { error } = await supabase.from("saved_cvs").delete().eq("id", cvId)

      if (error) {
        updateTestResult("Delete Test CV", "error", "Failed to delete CV", error.message)
        throw error
      }

      // Verify deletion
      const { data: checkData } = await supabase.from("saved_cvs").select("id").eq("id", cvId).single()

      if (checkData) {
        updateTestResult("Delete Test CV", "error", "Delete verification failed", "CV still exists after deletion")
        throw new Error("Delete verification failed")
      }

      updateTestResult("Delete Test CV", "success", "✅ CV deleted successfully")
    } catch (error) {
      // If the error is "No rows found", that's actually success for deletion test
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      if (errorMessage.includes("No rows") || (error as { code?: string }).code === "PGRST116") {
        updateTestResult("Delete Test CV", "success", "✅ CV deleted successfully")
      } else {
        updateTestResult("Delete Test CV", "error", "❌ Delete failed", errorMessage)
        throw error
      }
    }
  }

  const loadUserCVs = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("saved_cvs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading CVs:", error)
        return
      }

      setSavedCVs((data as SavedCV[]) || [])
    } catch (error) {
      console.error("Error in loadUserCVs:", error)
    }
  }, [user])

  const cleanupTestCVs = async () => {
    if (!user) return

    try {
      const { error } = await supabase.from("saved_cvs").delete().eq("user_id", user.id).like("title", "Test CV%")

      if (error) {
        alert(`Error cleaning up: ${error.message}`)
        return
      }

      alert("Test CVs cleaned up successfully!")
      await loadUserCVs()
    } catch (error) {
      console.error("Cleanup error:", error)
    }
  }

  useEffect(() => {
    if (user) {
      loadUserCVs()
    }
  }, [user, loadUserCVs])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  if (!user) {
    return (
      <div className="p-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-6 h-6" />
              CV Database Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
              <p className="text-gray-600 mb-6">Please sign in to test the CV database functionality</p>
              <Button onClick={() => (window.location.href = "/")}>Go to Home Page</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-6 h-6" />
              CV Database Test Suite
            </CardTitle>
            <p className="text-gray-600">Testing the saved_cvs table functionality and security</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-sm">Signed in as: {user.email}</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <Shield className="w-3 h-3 mr-1" />
                Authenticated
              </Badge>
            </div>

            <div className="flex gap-4">
              <Input
                placeholder="Test CV Title"
                value={testCVTitle}
                onChange={(e) => setTestCVTitle(e.target.value)}
                className="flex-1"
              />
              <Button onClick={runAllTests} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700">
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Run All Tests
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{result.name}</span>
                        <Badge className={getStatusColor(result.status)}>{result.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                      {result.details && (
                        <p className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 p-2 rounded">{result.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Your Saved CVs ({savedCVs.length})
              </CardTitle>
              <Button variant="outline" size="sm" onClick={cleanupTestCVs} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Clean Test CVs
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {savedCVs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Save className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No saved CVs found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedCVs.map((cv) => (
                  <div key={cv.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{cv.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Template: {cv.template_id}</span>
                        <span>Status: {cv.status}</span>
                        <span>Words: {cv.word_count}</span>
                        <span>Created: {new Date(cv.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Badge
                      className={
                        cv.title.includes("Test") ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"
                      }
                    >
                      {cv.title.includes("Test") ? "Test CV" : "Regular CV"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
