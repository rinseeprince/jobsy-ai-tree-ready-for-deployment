"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CoverLetterSaveModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (title: string, status: "draft" | "ready" | "sent") => void
  isSaving: boolean
  defaultTitle?: string
}

export const CoverLetterSaveModal = ({
  isOpen,
  onClose,
  onSave,
  isSaving,
  defaultTitle = "",
}: CoverLetterSaveModalProps) => {
  const [title, setTitle] = useState(defaultTitle)
  const [status, setStatus] = useState<"draft" | "ready" | "sent">("draft")

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim(), status)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Cover Letter</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your cover letter"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: "draft" | "ready" | "sent") => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!title.trim() || isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CoverLetterSaveModal;
