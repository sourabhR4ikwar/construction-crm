"use client"

import { useState, useEffect } from "react"
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
import { updateContact, getCompaniesForSelect } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { ContactRole } from "@/repo/contact/contact.repo"

interface Contact {
  id: string
  name: string
  email: string
  phone: string | null
  role: ContactRole
  title: string | null
  department: string | null
  notes: string | null
  companyId: string
  createdAt: Date
  updatedAt: Date
  company: {
    id: string
    name: string
    type: string
  }
}

interface Company {
  id: string
  name: string
  type: string
}

interface EditContactDialogProps {
  contact: Contact
  open: boolean
  onClose: () => void
}

export function EditContactDialog({ contact, open, onClose }: EditContactDialogProps) {
  const [loading, setLoading] = useState(false)
  const [companiesLoading, setCompaniesLoading] = useState(true)
  const [companies, setCompanies] = useState<Company[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      const fetchCompanies = async () => {
        try {
          const companiesData = await getCompaniesForSelect()
          setCompanies(companiesData)
        } catch (error) {
          console.error("Failed to fetch companies:", error)
          toast({
            title: "Error",
            description: "Failed to load companies",
            variant: "destructive",
          })
        } finally {
          setCompaniesLoading(false)
        }
      }

      fetchCompanies()
    }
  }, [open, toast])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateContact(contact.id, formData)

    if (result.success) {
      toast({
        title: "Success",
        description: "Contact updated successfully",
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

  const handleClose = () => {
    onClose()
    setCompanies([])
    setCompaniesLoading(true)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
          <DialogDescription>
            Update contact information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Contact Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={contact.name}
                  placeholder="Enter contact name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  defaultValue={contact.email}
                  placeholder="contact@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  defaultValue={contact.phone || ""}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select name="role" defaultValue={contact.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary_contact">Primary Contact</SelectItem>
                    <SelectItem value="project_manager">Project Manager</SelectItem>
                    <SelectItem value="technical_lead">Technical Lead</SelectItem>
                    <SelectItem value="finance_contact">Finance Contact</SelectItem>
                    <SelectItem value="sales_contact">Sales Contact</SelectItem>
                    <SelectItem value="support_contact">Support Contact</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-companyId">Company</Label>
              <Select name="companyId" defaultValue={contact.companyId}>
                <SelectTrigger>
                  <SelectValue placeholder={companiesLoading ? "Loading companies..." : "Select company"} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{company.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({company.type})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Job Title</Label>
                <Input
                  id="edit-title"
                  name="title"
                  defaultValue={contact.title || ""}
                  placeholder="e.g. Senior Developer"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  name="department"
                  defaultValue={contact.department || ""}
                  placeholder="e.g. Engineering"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                name="notes"
                defaultValue={contact.notes || ""}
                placeholder="Additional notes about this contact..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || companiesLoading}>
              {loading ? "Updating..." : "Update Contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}