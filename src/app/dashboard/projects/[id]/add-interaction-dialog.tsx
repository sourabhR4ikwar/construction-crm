"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createProjectInteraction } from "../actions"
import { useToast } from "@/hooks/use-toast"
import { InteractionType } from "@/repo/interaction/interaction.repo"

interface Contact {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  title: string | null
  department: string | null
  notes: string | null
  companyId: string
  createdAt: Date
  updatedAt: Date
}

interface AddInteractionDialogProps {
  projectId: string
  contacts: Contact[]
  open: boolean
  onClose: () => void
}

export function AddInteractionDialog({ projectId, contacts, open, onClose }: AddInteractionDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.append("projectId", projectId)

    const result = await createProjectInteraction(formData)

    if (result.success) {
      toast({
        title: "Success",
        description: "Activity added successfully",
      })
      onClose()
      const form = e.currentTarget
      if (form) {
        form.reset()
      }
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Project Activity</DialogTitle>
          <DialogDescription>
            Record a new interaction, meeting, or activity for this project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Activity Type</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="phone_call">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="site_visit">Site Visit</SelectItem>
                    <SelectItem value="document_shared">Document Shared</SelectItem>
                    <SelectItem value="milestone_update">Milestone Update</SelectItem>
                    <SelectItem value="issue_reported">Issue Reported</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="interactionDate">Date & Time</Label>
                <Input
                  id="interactionDate"
                  name="interactionDate"
                  type="datetime-local"
                  defaultValue={formatDateForInput(new Date())}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="summary">Summary</Label>
              <Input
                id="summary"
                name="summary"
                placeholder="Brief summary of the activity"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Detailed description of what happened"
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contactId">Contact (Optional)</Label>
              <Select name="contactId">
                <SelectTrigger>
                  <SelectValue placeholder="Select a contact if applicable" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      <div className="flex flex-col">
                        <span>{contact.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {contact.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}