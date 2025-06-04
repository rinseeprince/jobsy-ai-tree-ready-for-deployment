"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import { ApplicationsService } from "@/lib/supabase"
import type { Application } from "@/lib/supabase"

interface ApplicationStatusModalProps {
  isOpen: boolean
  onClose: () => void
  application: Application
  onUpdate: () => void
}

export function ApplicationStatusModal({ isOpen, onClose, application, onUpdate }: ApplicationStatusModalProps) {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<Application["status"]>("applied")
  const [interviewDate, setInterviewDate] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (application) {
      setStatus(application.status)
      setInterviewDate(application.interview_date || "")
      setNotes(application.notes || "")
    }
  }, [application])

  if (!isOpen || !mounted) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await ApplicationsService.updateApplicationStatus(application.id, status, interviewDate || null, notes || null)
      onUpdate()
      onClose()
    } catch (error) {
      console.error("Error updating application status:", error)
    } finally {
      setLoading(false)
    }
  }

  const statusOptions: Application["status"][] = [
    "applied",
    "phone_screen",
    "first_interview",
    "second_interview",
    "third_interview",
    "final_interview",
    "offer",
    "accepted",
    "rejected",
    "withdrawn",
    "ghosted",
  ]

  const formatStatusLabel = (status: string): string => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
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
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10">
          <X className="w-5 h-5" />
        </button>

        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Update Status</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Application Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Application["status"])}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {formatStatusLabel(option)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewDate">Interview Date</Label>
              <Input
                id="interviewDate"
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
              />
              <p className="text-xs text-gray-500">Optional. Set if you have an interview scheduled.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add any notes about this status change..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
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

  return createPortal(modalContent, document.body)
}
