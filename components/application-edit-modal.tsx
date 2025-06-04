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

interface ApplicationEditModalProps {
  isOpen: boolean
  onClose: () => void
  application: Application
  onUpdate: () => void
}

export function ApplicationEditModal({ isOpen, onClose, application, onUpdate }: ApplicationEditModalProps) {
  const [mounted, setMounted] = useState(false)
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
    return () => setMounted(false)
  }, [])

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

  if (!isOpen || !mounted) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await ApplicationsService.updateApplication(application.id, formData)
      onUpdate()
      onClose()
    } catch (error) {
      console.error("Error updating application:", error)
    } finally {
      setLoading(false)
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
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 z-10">
          <X className="w-5 h-5" />
        </button>

        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Edit Application</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title</Label>
                <Input id="job_title" name="job_title" value={formData.job_title} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" value={formData.location} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_range">Salary Range</Label>
                <Input
                  id="salary_range"
                  name="salary_range"
                  value={formData.salary_range}
                  onChange={handleChange}
                  placeholder="e.g. $50,000 - $70,000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_url">Job URL</Label>
                <Input
                  id="job_url"
                  name="job_url"
                  type="url"
                  value={formData.job_url}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interview_date">Interview Date</Label>
                <Input
                  id="interview_date"
                  name="interview_date"
                  type="date"
                  value={formData.interview_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Add any notes about this application..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )

  return createPortal(modalContent, document.body)
}
