"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, FileText, Building, Calendar, ClipboardList } from "lucide-react"
import type { Application } from "@/lib/supabase"

interface ApplicationDetailModalProps {
  isOpen: boolean
  onClose: () => void
  application: Application
}

export function ApplicationDetailModal({ isOpen, onClose, application }: ApplicationDetailModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10">
          <X className="w-5 h-5" />
        </button>

        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">{application.job_title}</CardTitle>
          <div className="flex items-center text-gray-600 mt-1">
            <Building className="w-4 h-4 mr-1" />
            <span>{application.company_name}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" /> Application Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize">{application.status.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-600">Applied Date:</span>
                  <span className="font-medium">{formatDate(application.applied_date)}</span>
                </div>
                {application.interview_date && (
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Interview Date:</span>
                    <span className="font-medium">{formatDate(application.interview_date)}</span>
                  </div>
                )}
                {application.location && (
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{application.location}</span>
                  </div>
                )}
                {application.salary_range && (
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-gray-600">Salary Range:</span>
                    <span className="font-medium">{application.salary_range}</span>
                  </div>
                )}
                {application.job_url && (
                  <div className="flex justify-between border-b pb-1">
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

            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <ClipboardList className="w-4 h-4 mr-2" /> Notes
              </h3>
              <div className="bg-gray-50 p-3 rounded-md min-h-[100px] text-sm">
                {application.notes || "No notes added yet."}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2" /> Cover Letter
              </h3>
              <div className="bg-gray-50 p-4 rounded-md max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{application.cover_letter}</pre>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2" /> CV Recommendations
              </h3>
              <div className="bg-blue-50 p-4 rounded-md max-h-64 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{application.cv_recommendations}</pre>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return createPortal(modalContent, document.body)
}
