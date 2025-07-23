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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { assignProjectRole } from "../actions"
import { useToast } from "@/hooks/use-toast"
import { ProjectRole } from "@/repo/project/project.repo"

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

interface AssignRoleDialogProps {
  projectId: string
  contacts: Contact[]
  open: boolean
  onClose: () => void
}

export function AssignRoleDialog({ projectId, contacts, open, onClose }: AssignRoleDialogProps) {
  const [loading, setLoading] = useState(false)
  const [selectedContact, setSelectedContact] = useState<string>("")
  const [selectedRole, setSelectedRole] = useState<ProjectRole | "">("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append("projectId", projectId)
    formData.append("contactId", selectedContact)
    formData.append("role", selectedRole)

    const result = await assignProjectRole(formData)

    if (result.success) {
      toast({
        title: "Success",
        description: "Role assigned successfully",
      })
      onClose()
      setSelectedContact("")
      setSelectedRole("")
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const handleClose = () => {
    setSelectedContact("")
    setSelectedRole("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Project Role</DialogTitle>
          <DialogDescription>
            Assign a team member to a specific role in this project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="contact">Contact</Label>
              <Select value={selectedContact} onValueChange={setSelectedContact} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a contact" />
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

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole as (value: string) => void} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="client_stakeholder">Client/Stakeholder</SelectItem>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="architect_consultant">Architect/Consultant</SelectItem>
                  <SelectItem value="project_manager">Project Manager</SelectItem>
                  <SelectItem value="supplier_vendor">Supplier/Vendor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedContact || !selectedRole}>
              {loading ? "Assigning..." : "Assign Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}