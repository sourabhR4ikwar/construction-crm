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
import { updateProject } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { ProjectStage } from "@/repo/project/project.repo"

interface Project {
  id: string
  title: string
  description: string | null
  budget: string | null
  startDate: string | null
  endDate: string | null
  stage: ProjectStage
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  country: string | null
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

interface EditProjectDialogProps {
  project: Project
  open: boolean
  onClose: () => void
}

export function EditProjectDialog({ project, open, onClose }: EditProjectDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return ""
    return new Date(dateString).toISOString().split('T')[0]
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateProject(project.id, formData)

    if (result.success) {
      toast({
        title: "Success",
        description: "Project updated successfully",
      })
      onClose()
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
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update project information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Project Title</Label>
                <Input
                  id="edit-title"
                  name="title"
                  defaultValue={project.title}
                  placeholder="Enter project title"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-stage">Project Stage</Label>
                <Select name="stage" defaultValue={project.stage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="hand_off">Hand-off</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                defaultValue={project.description || ""}
                placeholder="Enter project description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-budget">Budget</Label>
                <Input
                  id="edit-budget"
                  name="budget"
                  type="number"
                  step="0.01"
                  defaultValue={project.budget || ""}
                  placeholder="100000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  name="startDate"
                  type="date"
                  defaultValue={formatDateForInput(project.startDate)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  name="endDate"
                  type="date"
                  defaultValue={formatDateForInput(project.endDate)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                name="address"
                defaultValue={project.address || ""}
                placeholder="Enter project address"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  name="city"
                  defaultValue={project.city || ""}
                  placeholder="Enter city"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-state">State/Province</Label>
                <Input
                  id="edit-state"
                  name="state"
                  defaultValue={project.state || ""}
                  placeholder="Enter state"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-zipCode">Zip Code</Label>
                <Input
                  id="edit-zipCode"
                  name="zipCode"
                  defaultValue={project.zipCode || ""}
                  placeholder="12345"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-country">Country</Label>
              <Input
                id="edit-country"
                name="country"
                defaultValue={project.country || ""}
                placeholder="Enter country"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}