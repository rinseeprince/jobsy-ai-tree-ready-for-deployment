"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Plus,
  Search,
  Edit,
  Download,
  Trash2,
  Copy,
  Calendar,
  Clock,
  Target,
  Users,
  RefreshCw,
  Eye,
  X,
} from "lucide-react"
import { ApplicationsService, type SavedCV, type CVData } from "@/lib/supabase"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { renderTemplate, getTemplateById } from "@/lib/cv-templates"
import { CVAnalysisButton } from "@/components/cv-analysis-button"

export default function MyCVsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [savedCVs, setSavedCVs] = useState<SavedCV[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "ready" | "sent">("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [cvToDelete, setCvToDelete] = useState<SavedCV | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewCV, setPreviewCV] = useState<SavedCV | null>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
        if (data.user) {
          await fetchSavedCVs()
        }
      } catch (error) {
        console.error("Error getting user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  const fetchSavedCVs = async () => {
    try {
      console.log("🔍 Fetching saved CVs...")
      const cvs = await ApplicationsService.getUserSavedCVs()
      console.log("📋 Fetched CVs:", cvs)
      console.log("📊 Number of CVs found:", cvs.length)
      setSavedCVs(cvs)
    } catch (error) {
      console.error("❌ Error fetching saved CVs:", error)
    }
  }

  const handleDeleteCV = async (cv: SavedCV) => {
    setCvToDelete(cv)
    setShowDeleteModal(true)
  }

  const handlePreviewCV = (cv: SavedCV) => {
    setPreviewCV(cv)
    setShowPreviewModal(true)
  }

  const confirmDelete = async () => {
    if (!cvToDelete) return

    try {
      await ApplicationsService.deleteSavedCV(cvToDelete.id)
      setSavedCVs(savedCVs.filter((cv) => cv.id !== cvToDelete.id))
      setShowDeleteModal(false)
      setCvToDelete(null)
    } catch (error) {
      console.error("Error deleting CV:", error)
    }
  }

  const handleDuplicateCV = async (cv: SavedCV) => {
    try {
      await ApplicationsService.duplicateSavedCV(cv.id)
      await fetchSavedCVs()
    } catch (error) {
      console.error("Error duplicating CV:", error)
    }
  }

  const downloadCVAsPDF = (cv: SavedCV) => {
    try {
      const printWindow = window.open("", "_blank")
      if (!printWindow) return

      // Get the template and render with proper styling
      const template = getTemplateById(cv.template_id || "ats-optimized")
      let renderedHTML = ""

      if (template) {
        renderedHTML = renderTemplate(cv.cv_data, template)
      } else {
        // Fallback to simple rendering if template not found
        renderedHTML = renderSimpleCV(cv.cv_data)
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${cv.title}</title>
            <meta charset="utf-8">
            <style>
              @page { margin: 0.5in; size: A4; }
              @media print { 
                body { margin: 0; padding: 0; } 
                .no-print { display: none; }
              }
              body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6; 
                margin: 0;
                padding: 0;
              }
              /* Ensure template styles are preserved */
              * { box-sizing: border-box; }
            </style>
          </head>
          <body>
            ${renderedHTML}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 500);
              }
            </script>
          </body>
        </html>
      `

      printWindow.document.write(htmlContent)
      printWindow.document.close()
    } catch (error) {
      console.error("Error downloading CV as PDF:", error)
      alert("Error generating PDF. Please try again.")
    }
  }

  const renderSimpleCV = (cvData: CVData): string => {
    try {
      let html = ""

      // Personal Info
      if (cvData.personalInfo) {
        const p = cvData.personalInfo
        html += `<div class="section">
          <h1>${p.name || ""}</h1>
          <p>${p.title || ""}</p>
          <p>${p.email || ""} | ${p.phone || ""} | ${p.location || ""}</p>
          ${p.linkedin ? `<p>LinkedIn: ${p.linkedin}</p>` : ""}
          ${p.website ? `<p>Website: ${p.website}</p>` : ""}
          <p>${p.summary || ""}</p>
        </div>`
      }

      // Experience
      if (cvData.experience && cvData.experience.length > 0) {
        html += `<h2>Experience</h2>`
        cvData.experience.forEach((exp) => {
          html += `<div class="section">
            <h3>${exp.title || ""} | ${exp.company || ""}</h3>
            <p>${exp.startDate || ""} - ${exp.current ? "Present" : exp.endDate || ""} | ${exp.location || ""}</p>
            <p>${exp.description || ""}</p>
          </div>`
        })
      }

      // Education
      if (cvData.education && cvData.education.length > 0) {
        html += `<h2>Education</h2>`
        cvData.education.forEach((edu) => {
          html += `<div class="section">
            <h3>${edu.degree || ""} | ${edu.institution || ""}</h3>
            <p>${edu.startDate || ""} - ${edu.current ? "Present" : edu.endDate || ""} | ${edu.location || ""}</p>
            <p>${edu.description || ""}</p>
          </div>`
        })
      }

      // Skills
      if (cvData.skills && cvData.skills.length > 0) {
        html += `<h2>Skills</h2><p>${cvData.skills.join(", ")}</p>`
      }

      // Certifications
      if (cvData.certifications && cvData.certifications.length > 0) {
        html += `<h2>Certifications</h2>`
        cvData.certifications.forEach((cert) => {
          html += `<div class="section">
            <h3>${cert.name || ""} | ${cert.issuer || ""}</h3>
            <p>${cert.date || ""}</p>
            ${cert.description ? `<p>${cert.description}</p>` : ""}
          </div>`
        })
      }

      return html
    } catch (error) {
      console.error("Error rendering CV:", error)
      return "<p>Error rendering CV</p>"
    }
  }

  const filteredCVs = savedCVs.filter((cv) => {
    const matchesSearch = cv.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || cv.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "ready":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "sent":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  const getNextStatus = (currentStatus: string): "draft" | "ready" | "sent" => {
    switch (currentStatus) {
      case "draft":
        return "ready"
      case "ready":
        return "sent"
      case "sent":
        return "draft"
      default:
        return "draft"
    }
  }

  const getStatusTitle = (currentStatus: string): string => {
    switch (currentStatus) {
      case "draft":
        return "Click to mark as Ready"
      case "ready":
        return "Click to mark as Sent"
      case "sent":
        return "Click to mark as Draft"
      default:
        return "Click to change status"
    }
  }

  const handleStatusChange = async (cvId: string, newStatus: "draft" | "ready" | "sent") => {
    try {
      console.log(`🔄 Updating CV ${cvId} status to ${newStatus}`)
      await ApplicationsService.updateSavedCV(cvId, { status: newStatus })
      // Update local state immediately
      setSavedCVs(savedCVs.map((cv) => (cv.id === cvId ? { ...cv, status: newStatus } : cv)))
      console.log(`✅ CV status updated to ${newStatus}`)
    } catch (error) {
      console.error("❌ Error updating CV status:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      alert(`Failed to update CV status: ${errorMessage}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg">Loading your CVs...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-lg text-gray-600 mb-8">Please sign in to view your CVs</p>
            <Button onClick={() => (window.location.href = "/")}>Return to Home</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                My CVs
              </h1>
              <p className="text-gray-600 mt-2">Manage and organize your professional CVs</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={fetchSavedCVs}
                variant="outline"
                className="px-6 py-3 rounded-2xl border-2 border-gray-200 hover:border-blue-400"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => (window.location.href = "/dashboard/cv-builder")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New CV
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total CVs</p>
                  <p className="text-3xl font-bold text-blue-900">{savedCVs.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-2xl">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Drafts</p>
                  <p className="text-3xl font-bold text-yellow-900">
                    {savedCVs.filter((cv) => cv.status === "draft").length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-2xl">
                  <Edit className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Ready</p>
                  <p className="text-3xl font-bold text-green-900">
                    {savedCVs.filter((cv) => cv.status === "ready").length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-2xl">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Sent</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {savedCVs.filter((cv) => cv.status === "sent").length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-2xl">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search CVs by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-gray-200 focus:border-blue-400 rounded-xl"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  onClick={() => setFilterStatus("all")}
                  className="rounded-xl"
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === "draft" ? "default" : "outline"}
                  onClick={() => setFilterStatus("draft")}
                  className="rounded-xl"
                >
                  Drafts
                </Button>
                <Button
                  variant={filterStatus === "ready" ? "default" : "outline"}
                  onClick={() => setFilterStatus("ready")}
                  className="rounded-xl"
                >
                  Ready
                </Button>
                <Button
                  variant={filterStatus === "sent" ? "default" : "outline"}
                  onClick={() => setFilterStatus("sent")}
                  className="rounded-xl"
                >
                  Sent
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CVs Grid */}
        {filteredCVs.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-blue-100 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || filterStatus !== "all" ? "No CVs found" : "No CVs yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first professional CV to get started"}
              </p>
              <Button
                onClick={() => (window.location.href = "/dashboard/cv-builder")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First CV
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCVs.map((cv) => (
              <Card
                key={cv.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-3xl overflow-hidden group cursor-pointer"
                onClick={() => handlePreviewCV(cv)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg line-clamp-2">{cv.title}</h3>
                      <div className="flex items-center gap-2">
                        <button
                          className={`${getStatusColor(cv.status)} border-0 capitalize px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:shadow-md transition-all duration-200 flex items-center gap-1 hover:scale-105`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusChange(cv.id, getNextStatus(cv.status))
                          }}
                          title={getStatusTitle(cv.status)}
                        >
                          {cv.status}
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        </button>
                        <span className="text-xs text-gray-400">Click to change</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{cv.title.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Created {formatDate(cv.created_at)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Updated {formatTimeAgo(cv.updated_at)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="w-4 h-4 mr-2" />
                      <span>{cv.word_count} words</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.location.href = `/dashboard/cv-builder?cv=${cv.id}`
                      }}
                      className="rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadCVAsPDF(cv)
                      }}
                      className="rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                    <CVAnalysisButton
                      cvData={cv.cv_data}
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 col-span-2"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDuplicateCV(cv)
                      }}
                      className="rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteCV(cv)
                      }}
                      className="rounded-xl border-2 border-gray-200 hover:border-red-400 hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        {showPreviewModal && previewCV && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold flex items-center">
                      <Eye className="w-6 h-6 mr-3" />
                      {previewCV.title}
                    </h2>
                    <p className="text-blue-100 mt-2">CV Preview</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreviewModal(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="bg-white border rounded-lg p-8 shadow-sm">
                  {(() => {
                    try {
                      const template = getTemplateById(previewCV.template_id || "modern")
                      if (template) {
                        const renderedHTML = renderTemplate(previewCV.cv_data, template)
                        return <div dangerouslySetInnerHTML={{ __html: renderedHTML }} />
                      } else {
                        return <div className="text-center text-gray-500">Template not found</div>
                      }
                    } catch (error) {
                      console.error("Error rendering template:", error)
                      return <div className="text-center text-red-500">Error rendering CV preview</div>
                    }
                  })()}
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowPreviewModal(false)} className="px-6 py-2 rounded-xl">
                  Close
                </Button>
                <Button
                  onClick={() => {
                    window.location.href = `/dashboard/cv-builder?cv=${previewCV.id}`
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit CV
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && cvToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 text-white rounded-t-3xl">
                <h2 className="text-xl font-bold flex items-center">
                  <Trash2 className="w-6 h-6 mr-3" />
                  Delete CV
                </h2>
                <p className="text-red-100 mt-2">This action cannot be undone</p>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete &quot;{cvToDelete.title}&quot;? This will permanently remove the CV
                  and all its data.
                </p>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="px-6 py-2 rounded-xl">
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDelete}
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-2 rounded-xl"
                  >
                    Delete CV
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
