"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  FileText,
  Target,
  TrendingUp,
  Calendar,
  Building,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  ClipboardList,
  Search,
  RefreshCw,
} from "lucide-react"
import type { User } from "@supabase/supabase-js"
import type { Application } from "@/lib/supabase"

// Update the InlineApplicationDetailModal component with animations and styling
function InlineApplicationDetailModal({
  isOpen,
  onClose,
  application,
}: {
  isOpen: boolean
  onClose: () => void
  application: Application
}) {
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      // Small delay for the animation to work properly
      setTimeout(() => setIsVisible(true), 10)
    }
    return () => setMounted(false)
  }, [isOpen])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(), 300) // Match this with the transition duration
  }

  if (!isOpen || !mounted) return null

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return "N/A"
    }
  }

  const modalContent = (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <Card
        className={`w-full max-w-4xl max-h-[85vh] overflow-y-auto relative shadow-xl border-0 transition-all duration-300 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-lg -z-10"></div>
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            {application.job_title}
          </CardTitle>
          <div className="flex items-center text-gray-600 mt-1">
            <Building className="w-4 h-4 mr-1" />
            <span>{application.company_name}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center text-gray-700">
                <Calendar className="w-4 h-4 mr-2 text-blue-500" /> Application Details
              </h3>
              <div className="space-y-2 text-sm rounded-lg bg-white p-4 shadow-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize">{application.status.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Applied Date:</span>
                  <span className="font-medium">{formatDate(application.applied_date)}</span>
                </div>
                {application.interview_date && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Interview Date:</span>
                    <span className="font-medium">{formatDate(application.interview_date)}</span>
                  </div>
                )}
                {application.location && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{application.location}</span>
                  </div>
                )}
                {application.salary_range && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Salary Range:</span>
                    <span className="font-medium">{application.salary_range}</span>
                  </div>
                )}
                {application.job_url && (
                  <div className="flex justify-between pb-2">
                    <span className="text-gray-600">Job URL:</span>
                    <a
                      href={application.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Original Posting
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center text-gray-700">
                <ClipboardList className="w-4 h-4 mr-2 text-blue-500" /> Notes
              </h3>
              <div className="bg-white p-4 rounded-lg shadow-sm min-h-[100px] text-sm">
                {application.notes || "No notes added yet."}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center text-gray-700">
                <FileText className="w-4 h-4 mr-2 text-blue-500" /> Cover Letter
              </h3>
              <div className="bg-white p-4 rounded-lg shadow-sm max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{application.cover_letter}</pre>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center text-gray-700">
                <FileText className="w-4 h-4 mr-2 text-blue-500" /> CV Recommendations
              </h3>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{application.cv_recommendations}</pre>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={handleClose} className="hover:bg-gray-100 transition-colors">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return createPortal(modalContent, document.body)
}

// Update the InlineApplicationEditModal component with animations and styling
function InlineApplicationEditModal({
  isOpen,
  onClose,
  application,
  onUpdate,
}: {
  isOpen: boolean
  onClose: () => void
  application: Application
  onUpdate: () => void
}) {
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    job_title: "",
    company_name: "",
    location: "",
    salary_range: "",
    job_url: "",
    notes: "",
    interview_date: "",
  })

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10)
    }
    return () => setMounted(false)
  }, [isOpen])

  useEffect(() => {
    if (application) {
      setFormData({
        job_title: application.job_title || "",
        company_name: application.company_name || "",
        location: application.location || "",
        salary_range: application.salary_range || "",
        job_url: application.job_url || "",
        notes: application.notes || "",
        interview_date: application.interview_date || "",
      })
    }
  }, [application])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(), 300)
  }

  if (!isOpen || !mounted) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("Attempting to update application:", application.id)
      console.log("Update data:", formData)

      // Process the form data to handle empty dates properly
      const processedData = {
        ...formData,
        // Convert empty date strings to null for database compatibility
        interview_date: formData.interview_date?.trim() || null,
        updated_at: new Date().toISOString(),
      }

      console.log("Processed data with null dates:", processedData)

      // Use direct Supabase query instead of ApplicationsService
      const { data, error } = await supabase
        .from("applications")
        .update(processedData)
        .eq("id", application.id)
        .select()

      console.log("Update response:", { data, error })

      if (error) {
        console.error("Detailed error updating application:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        alert(`Error updating application: ${error.message}`)
        return
      }

      console.log("Application updated successfully:", data)
      onUpdate()
      handleClose()
    } catch (error) {
      console.error("Unexpected error updating application:", error)
      alert(`Unexpected error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const modalContent = (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <Card
        className={`w-full max-w-2xl max-h-[85vh] overflow-y-auto relative shadow-xl border-0 transition-all duration-300 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-lg -z-10"></div>
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            Edit Application
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job_title" className="text-gray-700">
                  Job Title
                </Label>
                <Input
                  id="job_title"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  required
                  className="border-gray-200 focus:border-blue-300 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name" className="text-gray-700">
                  Company Name
                </Label>
                <Input
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  className="border-gray-200 focus:border-blue-300 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-gray-700">
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="border-gray-200 focus:border-blue-300 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_range" className="text-gray-700">
                  Salary Range
                </Label>
                <Input
                  id="salary_range"
                  name="salary_range"
                  value={formData.salary_range}
                  onChange={handleChange}
                  placeholder="e.g. $50,000 - $70,000"
                  className="border-gray-200 focus:border-blue-300 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_url" className="text-gray-700">
                  Job URL
                </Label>
                <Input
                  id="job_url"
                  name="job_url"
                  type="url"
                  value={formData.job_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="border-gray-200 focus:border-blue-300 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interview_date" className="text-gray-700">
                  Interview Date
                </Label>
                <Input
                  id="interview_date"
                  name="interview_date"
                  type="date"
                  value={formData.interview_date}
                  onChange={handleChange}
                  className="border-gray-200 focus:border-blue-300 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-700">
                Notes
              </Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Add any notes about this application..."
                className="border-gray-200 focus:border-blue-300 transition-colors resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="hover:bg-gray-100 transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 transition-all"
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )

  return createPortal(modalContent, document.body)
}

// Update the InlineApplicationStatusModal component with animations and styling
function InlineApplicationStatusModal({
  isOpen,
  onClose,
  application,
  onUpdate,
}: {
  isOpen: boolean
  onClose: () => void
  application: Application
  onUpdate: () => void
}) {
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<Application["status"]>("applied")
  const [interviewDate, setInterviewDate] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10)
    }
    return () => setMounted(false)
  }, [isOpen])

  useEffect(() => {
    if (application) {
      setStatus(application.status)
      setInterviewDate(application.interview_date || "")
      setNotes(application.notes || "")
    }
  }, [application])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(), 300)
  }

  if (!isOpen || !mounted) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log("Attempting to update application status:", application.id)

      const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      }

      // Handle interview date - convert empty string to null
      if (interviewDate !== undefined) {
        updateData.interview_date = interviewDate?.trim() || null
      }

      // Handle notes - convert empty string to null
      if (notes !== undefined) {
        updateData.notes = notes?.trim() || null
      }

      console.log("Status update data with proper null handling:", updateData)

      // Use direct Supabase query instead of ApplicationsService
      const { data, error } = await supabase.from("applications").update(updateData).eq("id", application.id).select()

      console.log("Status update response:", { data, error })

      if (error) {
        console.error("Detailed error updating application status:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        })
        alert(`Error updating status: ${error.message}`)
        return
      }

      console.log("Application status updated successfully:", data)
      onUpdate()
      handleClose()
    } catch (error) {
      console.error("Unexpected error updating application status:", error)
      alert(`Unexpected error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const statusOptions: { value: Application["status"]; label: string }[] = [
    { value: "applied", label: "Applied" },
    { value: "phone_screen", label: "Phone Screen" },
    { value: "first_interview", label: "First Interview" },
    { value: "second_interview", label: "Second Interview" },
    { value: "third_interview", label: "Third Interview" },
    { value: "final_interview", label: "Final Interview" },
    { value: "offer", label: "Offer" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
    { value: "withdrawn", label: "Withdrawn" },
    { value: "ghosted", label: "Ghosted" },
  ]

  const modalContent = (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <Card
        className={`w-full max-w-md max-h-[85vh] overflow-y-auto relative shadow-xl border-0 transition-all duration-300 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-lg -z-10"></div>
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            Update Application Status
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-700">
                Status
              </Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Application["status"])}
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interview_date" className="text-gray-700">
                Interview Date (Optional)
              </Label>
              <Input
                id="interview_date"
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="border-gray-200 focus:border-blue-300 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-700">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Add any notes about this status update..."
                className="border-gray-200 focus:border-blue-300 transition-colors resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="hover:bg-gray-100 transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 transition-all"
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Updating...
                  </span>
                ) : (
                  "Update Status"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )

  return createPortal(modalContent, document.body)
}

// Update the InlineDeleteConfirmationModal component with animations and styling
function InlineDeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
}) {
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10)
    }
    return () => setMounted(false)
  }, [isOpen])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(), 300)
  }

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      handleClose()
    } catch (error) {
      console.error("Error during deletion:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <Card
        className={`w-full max-w-md relative shadow-xl border-0 transition-all duration-300 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-lg -z-10"></div>

        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-xl text-red-600">{title}</CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <p className="text-gray-700 mb-6">{message}</p>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
              className="hover:bg-gray-100 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all"
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return createPortal(modalContent, document.body)
}

// Inline getUserProfile function
async function inlineGetUserProfile(): Promise<{ full_name?: string } | null> {
  if (!supabase) {
    return null
  }

  try {
    const { data } = await supabase.auth.getUser()
    const user = data.user

    if (!user) {
      return null
    }

    // Get user metadata which might contain the full name
    const metadata = user.user_metadata

    return {
      full_name: metadata?.full_name || metadata?.name || null,
    }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [applications, setApplications] = useState<Application[]>([])

  // Modal states
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<
    | "all"
    | "applied"
    | "phone_screen"
    | "first_interview"
    | "second_interview"
    | "third_interview"
    | "final_interview"
    | "offer"
    | "accepted"
    | "rejected"
    | "withdrawn"
    | "ghosted"
  >("all")

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        console.log("👤 Current user:", data.user?.email || "No user")
        setUser(data.user)

        // If user exists, fetch their applications and profile
        if (data.user) {
          await fetchApplications(data.user.id)
          await fetchUserProfile()
        }
      } catch (error) {
        console.error("Error getting user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  const fetchUserProfile = async () => {
    try {
      // Use the inline function instead of ApplicationsService
      const profile = await inlineGetUserProfile()
      if (profile?.full_name) {
        setUserName(profile.full_name)
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const fetchApplications = async (userId: string): Promise<void> => {
    try {
      console.log("🔍 Fetching applications for user:", userId)

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Error fetching applications:", error)
        return
      }

      console.log("✅ Raw applications data:", data)
      console.log("📊 Applications count:", data?.length || 0)

      // Helper function to safely get string value
      const getString = (value: unknown, fallback = ""): string => {
        return typeof value === "string" ? value : fallback
      }

      // Helper function to safely get string or null
      const getStringOrNull = (value: unknown): string | null => {
        return typeof value === "string" ? value : null
      }

      // Helper function to safely get boolean or null
      const getBooleanOrNull = (value: unknown): boolean | null => {
        return typeof value === "boolean" ? value : null
      }

      // More flexible type conversion using type guards
      const typedApplications = (data || []).map((app): Application => {
        // Type assertion for the raw data
        const rawApp = app as Record<string, unknown>

        return {
          id: getString(rawApp.id),
          user_id: getString(rawApp.user_id),
          job_title: getString(rawApp.job_title, "Untitled Position"),
          company_name: getString(rawApp.company_name, "Unknown Company"),
          job_posting: getString(rawApp.job_posting),
          cv_content: getString(rawApp.cv_content),
          cover_letter: getString(rawApp.cover_letter),
          cv_recommendations: getString(rawApp.cv_recommendations),
          status: getString(rawApp.status, "applied") as Application["status"],
          applied_date: getStringOrNull(rawApp.applied_date) || getString(rawApp.created_at),
          interview_date: getStringOrNull(rawApp.interview_date),
          notes: getStringOrNull(rawApp.notes),
          job_url: getStringOrNull(rawApp.job_url),
          salary_range: getStringOrNull(rawApp.salary_range),
          location: getStringOrNull(rawApp.location),
          remote: getBooleanOrNull(rawApp.remote),
          created_at: getString(rawApp.created_at),
          updated_at: getString(rawApp.updated_at) || getString(rawApp.created_at),
        }
      })

      console.log("🔄 Processed applications:", typedApplications)
      setApplications(typedApplications)
    } catch (error) {
      console.error("❌ Failed to fetch applications:", error)
    }
  }

  // Replace the handleDeleteApplication function with this implementation
  const handleDeleteApplication = async () => {
    if (!selectedApplication) return

    try {
      console.log("Attempting to delete application:", selectedApplication.id)

      // Use direct Supabase query instead of ApplicationsService
      const { error } = await supabase.from("applications").delete().eq("id", selectedApplication.id)

      if (error) {
        console.error("Error deleting application:", error)
        return
      }

      console.log("Application deleted successfully")

      // Refresh applications after deletion
      if (user) {
        await fetchApplications(user.id)
      }
    } catch (error) {
      console.error("Error in delete operation:", error)
    }
  }

  const refreshApplications = async () => {
    if (user) {
      await fetchApplications(user.id)
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "applied":
        return "bg-blue-100 text-blue-800"
      case "phone_screen":
        return "bg-cyan-100 text-cyan-800"
      case "first_interview":
      case "second_interview":
      case "third_interview":
        return "bg-yellow-100 text-yellow-800"
      case "final_interview":
        return "bg-orange-100 text-orange-800"
      case "offer":
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
      case "withdrawn":
      case "ghosted":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusDisplay = (status: string): string => {
    // Convert snake_case to Title Case with spaces
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return "N/A"
    }
  }

  // Calculate stats
  const totalApplications = applications.length
  const thisMonthApplications = applications.filter((app) => {
    try {
      const appDate = new Date(app.created_at)
      const now = new Date()
      return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear()
    } catch {
      return false
    }
  }).length

  const interviewCount = applications.filter(
    (app) => app.status?.toLowerCase().includes("interview") || app.status?.toLowerCase() === "phone_screen",
  ).length

  const interviewRate = totalApplications > 0 ? Math.round((interviewCount / totalApplications) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-lg text-gray-600 mb-8">Please sign in to view your dashboard</p>
            <Button onClick={() => (window.location.href = "/")}>Return to Home</Button>
          </div>
        </div>
      </div>
    )
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || app.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userName || user.email?.split("@")[0] || "there"}!
              </h1>
              <p className="text-gray-600 mt-2">Track your job applications and career progress</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={refreshApplications}
                variant="outline"
                className="px-6 py-3 rounded-2xl border-2 border-gray-200 hover:border-blue-400"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => (window.location.href = "/generator")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Application
              </Button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-gray-900">{thisMonthApplications}</p>
                  <p className="text-sm text-gray-500 mt-1">Applications</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-3xl font-bold text-gray-900">{totalApplications}</p>
                  <p className="text-sm text-gray-500 mt-1">Applications</p>
                </div>
                <div className="p-3 bg-teal-100 rounded-full">
                  <Target className="w-6 h-6 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Interview Rate</p>
                  <p className="text-3xl font-bold text-gray-900">{interviewRate}%</p>
                  <p className="text-sm text-gray-500 mt-1">Success rate</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Interviews</p>
                  <p className="text-3xl font-bold text-gray-900">{interviewCount}</p>
                  <p className="text-sm text-gray-500 mt-1">Scheduled</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Calendar className="w-6 h-6 text-purple-600" />
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
                  placeholder="Search applications by job title or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-gray-200 focus:border-blue-400 rounded-xl"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  onClick={() => setFilterStatus("all")}
                  className="rounded-xl"
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === "applied" ? "default" : "outline"}
                  onClick={() => setFilterStatus("applied")}
                  className="rounded-xl"
                >
                  Applied
                </Button>
                <Button
                  variant={filterStatus === "phone_screen" ? "default" : "outline"}
                  onClick={() => setFilterStatus("phone_screen")}
                  className="rounded-xl"
                >
                  Phone Screen
                </Button>
                <Button
                  variant={filterStatus === "first_interview" ? "default" : "outline"}
                  onClick={() => setFilterStatus("first_interview")}
                  className="rounded-xl"
                >
                  Interview
                </Button>
                <Button
                  variant={filterStatus === "offer" ? "default" : "outline"}
                  onClick={() => setFilterStatus("offer")}
                  className="rounded-xl"
                >
                  Offer
                </Button>
                <Button
                  variant={filterStatus === "rejected" ? "default" : "outline"}
                  onClick={() => setFilterStatus("rejected")}
                  className="rounded-xl"
                >
                  Rejected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Your Applications ({filteredApplications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-600 mb-6">
                  Start by creating your first application with AI-powered cover letters
                </p>
                <Button
                  onClick={() => (window.location.href = "/generator")}
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Create Your First Application
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => (
                  <div key={app.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {app.company_name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{app.job_title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center">
                              <Building className="w-4 h-4 mr-1" />
                              {app.company_name}
                            </div>
                            {app.location && (
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {app.location}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-3">
                            <span className="text-sm text-gray-500">Applied: {formatDate(app.applied_date)}</span>
                            {app.interview_date && (
                              <span className="text-sm text-blue-600">Interview: {formatDate(app.interview_date)}</span>
                            )}
                            {app.salary_range && (
                              <span className="text-sm text-gray-500">Salary: {app.salary_range}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getStatusColor(app.status)} border-0`}>
                          {getStatusDisplay(app.status)}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            title="View Details"
                            onClick={() => {
                              setSelectedApplication(app)
                              setIsViewModalOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            title="Update Status"
                            onClick={() => {
                              setSelectedApplication(app)
                              setIsStatusModalOpen(true)
                            }}
                          >
                            <Calendar className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            title="Edit Application"
                            onClick={() => {
                              setSelectedApplication(app)
                              setIsEditModalOpen(true)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            title="Delete Application"
                            onClick={() => {
                              setSelectedApplication(app)
                              setIsDeleteModalOpen(true)
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Inline Modals */}
      {selectedApplication && (
        <>
          {isViewModalOpen && (
            <InlineApplicationDetailModal
              isOpen={isViewModalOpen}
              onClose={() => setIsViewModalOpen(false)}
              application={selectedApplication}
            />
          )}

          {isEditModalOpen && (
            <InlineApplicationEditModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              application={selectedApplication}
              onUpdate={refreshApplications}
            />
          )}

          {isStatusModalOpen && (
            <InlineApplicationStatusModal
              isOpen={isStatusModalOpen}
              onClose={() => setIsStatusModalOpen(false)}
              application={selectedApplication}
              onUpdate={refreshApplications}
            />
          )}

          {isDeleteModalOpen && (
            <InlineDeleteConfirmationModal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              onConfirm={handleDeleteApplication}
              title="Delete Application"
              message={`Are you sure you want to delete your application for "${selectedApplication.job_title}" at "${selectedApplication.company_name}"? This action cannot be undone.`}
            />
          )}
        </>
      )}
    </div>
  )
}
