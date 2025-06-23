"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Calendar, MoreVertical, Edit, Copy, Download, Trash2, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  getUserSavedCoverLetters,
  deleteSavedCoverLetter,
  duplicateSavedCoverLetter,
  type SavedCoverLetter,
} from "@/lib/cover-letter-service"
import { EmptyState } from "@/components/empty-state"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"
import { openPrintableVersion } from "@/lib/pdf-generator"
import { renderCoverLetterTemplate, getCoverLetterTemplateById } from "@/lib/cover-letter-templates"
import { toast } from "@/components/ui/use-toast"

export const MyCoverLettersPage = () => {
  const [coverLetters, setCoverLetters] = useState<SavedCoverLetter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; coverLetter: SavedCoverLetter | null }>({
    isOpen: false,
    coverLetter: null,
  })
  const [isExporting, setIsExporting] = useState<string | null>(null)

  useEffect(() => {
    loadCoverLetters()
  }, [])

  const loadCoverLetters = async () => {
    try {
      const data = await getUserSavedCoverLetters()
      setCoverLetters(data)
    } catch (error) {
      console.error("Failed to load cover letters:", error)
      toast({
        title: "Error",
        description: "Failed to load cover letters. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (coverLetter: SavedCoverLetter) => {
    try {
      await deleteSavedCoverLetter(coverLetter.id)
      setCoverLetters((prev) => prev.filter((cl) => cl.id !== coverLetter.id))
      setDeleteModal({ isOpen: false, coverLetter: null })
      toast({
        title: "Success",
        description: `"${coverLetter.title}" has been deleted successfully.`,
      })
    } catch (error) {
      console.error("Failed to delete cover letter:", error)
      toast({
        title: "Error",
        description: "Failed to delete cover letter. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDuplicate = async (coverLetter: SavedCoverLetter) => {
    try {
      const duplicated = await duplicateSavedCoverLetter(coverLetter.id)
      setCoverLetters((prev) => [duplicated, ...prev])
      toast({
        title: "Success",
        description: `"${coverLetter.title}" has been duplicated successfully.`,
      })
    } catch (error) {
      console.error("Failed to duplicate cover letter:", error)
      toast({
        title: "Error",
        description: "Failed to duplicate cover letter. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = async (coverLetter: SavedCoverLetter) => {
    setIsExporting(coverLetter.id)
    try {
      const template = getCoverLetterTemplateById(coverLetter.template_id)
      if (!template) {
        throw new Error(`Template not found: ${coverLetter.template_id}`)
      }
      
      const renderedContent = renderCoverLetterTemplate(coverLetter.cover_letter_data, template)
      await openPrintableVersion(renderedContent, coverLetter.title)
      
      toast({
        title: "Success",
        description: `"${coverLetter.title}" has been exported to PDF successfully.`,
      })
    } catch (error) {
      console.error("Failed to export cover letter:", error)
      toast({
        title: "Error",
        description: "Failed to export cover letter to PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(null)
    }
  }

  const getStatusColor = (status: SavedCoverLetter["status"]) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "ready":
        return "bg-green-100 text-green-800"
      case "sent":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Cover Letters</h1>
          <p className="text-gray-600 mt-1">Manage your saved cover letters</p>
        </div>
        <Link href="/dashboard/cover-letter-builder">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Cover Letter
          </Button>
        </Link>
      </div>

      {coverLetters.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No cover letters yet"
          description="Create your first cover letter to get started"
          action={
            <Link href="/dashboard/cover-letter-builder">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Cover Letter
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coverLetters.map((coverLetter) => (
            <Card key={coverLetter.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold truncate">{coverLetter.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getStatusColor(coverLetter.status)}>{coverLetter.status}</Badge>
                      <span className="text-sm text-gray-500">{coverLetter.word_count} words</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/cover-letter-builder?id=${coverLetter.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(coverLetter)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(coverLetter)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteModal({ isOpen: true, coverLetter })}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="h-4 w-4 mr-2" />
                    {coverLetter.cover_letter_data.jobInfo?.companyName || "No company"}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(coverLetter.updated_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/dashboard/cover-letter-builder?id=${coverLetter.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDownload(coverLetter)}
                    disabled={isExporting === coverLetter.id}
                  >
                    {isExporting === coverLetter.id ? (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setDeleteModal({ isOpen: true, coverLetter })}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, coverLetter: null })}
        onConfirm={() => deleteModal.coverLetter && handleDelete(deleteModal.coverLetter)}
        title="Delete Cover Letter"
        message={`Are you sure you want to delete "${deleteModal.coverLetter?.title}"? This action cannot be undone.`}
      />
    </div>
  )
}
