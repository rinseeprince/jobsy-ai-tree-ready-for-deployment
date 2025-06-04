"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Calendar } from "lucide-react"
import { ApplicationsService } from "@/lib/supabase"
import type { Application } from "@/lib/supabase"

interface ApplicationStatusModalProps {
  isOpen: boolean
  onClose: () => void
  application: Application
  onUpdate: () => void
}

const statusOptions: { value: Application["status"]; label: string; description: string }[] = [
  { value: "applied", label: "Applied", description: "Application submitted" },
  { value: "phone_screen", label: "Phone Screen", description: "Initial phone screening" },
  { value: "first_interview", label: "First Interview", description: "First round interview" },
  { value: "second_interview", label: "Second Interview", description: "Second round interview" },
  { value: "third_interview", label: "Third Interview", description: "Third round interview" },
  { value: "final_interview", label: "Final Interview", description: "Final interview round" },
  { value: "offer", label: "Offer", description: "Job offer received" },
  { value: "accepted", label: "Accepted", description: "Offer accepted" },
  { value: "rejected", label: "Rejected", description: "Application rejected" },
  { value: "withdrawn", label: "Withdrawn", description: "Application withdrawn" },
  { value: "ghosted", label: "Ghosted", description: "No response from company" },
]

export function ApplicationStatusModal({ isOpen, onClose, application, onUpdate }: ApplicationStatusModalProps) {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<Application["status"]>(application.status)
  const [interviewDate, setInterviewDate] = useState(application.interview_date || "")
  const [notes, setNotes] = useState(application.notes || "")

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(application.status)
      setInterviewDate(application.interview_date || "")
      setNotes(application.notes || "")
    }
  }, [isOpen, application])

  if (!isOpen || !mounted) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await ApplicationsService.updateApplicationStatus(
        application.id,
        selectedStatus,
        interviewDate || null,
        notes || null,
      )

      onUpdate()
      onClose()
    } catch (error) {
      console.error("Error updating application status:", error)
      // You could add a toast notification here
    } finally {
      setLoading(false)
    }
  }

  const requiresInterviewDate = [
    "phone_screen",
    "first_interview",
    "second_interview",
    "third_interview",
    "final_interview",
  ].includes(selectedStatus)

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10">
          <X className="w-5 h-5" />
        </button>

        <CardHeader className="pb-4">
          <CardTitle className="text-2xl flex items-center">
            <Calendar className="w-6 h-6 mr-2" />
            Update Application Status
          </CardTitle>
          <p className="text-gray-600">
            {application.job_title} at {application.company_name}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-base font-medium">Application Status</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {statusOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedStatus === option.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedStatus(option.value)}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={selectedStatus === option.value}
                        onChange={() => setSelectedStatus(option.value)}
                        className="text-blue-600"
                      />
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {requiresInterviewDate && (
              <div>
                <Label htmlFor="interview_date">Interview Date</Label>
                <Input
                  id="interview_date"
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">Set the date for your {selectedStatus.replace("_", " ")}</p>
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this status update..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null
}
