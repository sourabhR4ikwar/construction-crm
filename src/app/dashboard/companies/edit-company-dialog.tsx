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
import { updateCompany } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { CompanyType } from "@/repo/company/company.repo"

interface Company {
  id: string
  name: string
  type: CompanyType
  description: string | null
  website: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  country: string | null
  createdAt: Date
  updatedAt: Date
}

interface EditCompanyDialogProps {
  company: Company
  open: boolean
  onClose: () => void
}

export function EditCompanyDialog({ company, open, onClose }: EditCompanyDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateCompany(company.id, formData)

    if (result.success) {
      toast({
        title: "Success",
        description: "Company updated successfully",
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
          <DialogTitle>Edit Company</DialogTitle>
          <DialogDescription>
            Update company information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Company Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={company.name}
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Company Type</Label>
                <Select name="type" defaultValue={company.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="architect_consultant">Architect/Consultant</SelectItem>
                    <SelectItem value="supplier_vendor">Supplier/Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                defaultValue={company.description || ""}
                placeholder="Enter company description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-website">Website</Label>
                <Input
                  id="edit-website"
                  name="website"
                  type="url"
                  defaultValue={company.website || ""}
                  placeholder="https://example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  defaultValue={company.email || ""}
                  placeholder="contact@company.com"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                name="phone"
                defaultValue={company.phone || ""}
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                name="address"
                defaultValue={company.address || ""}
                placeholder="Enter street address"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  name="city"
                  defaultValue={company.city || ""}
                  placeholder="Enter city"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-state">State/Province</Label>
                <Input
                  id="edit-state"
                  name="state"
                  defaultValue={company.state || ""}
                  placeholder="Enter state"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-zipCode">Zip Code</Label>
                <Input
                  id="edit-zipCode"
                  name="zipCode"
                  defaultValue={company.zipCode || ""}
                  placeholder="12345"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-country">Country</Label>
              <Input
                id="edit-country"
                name="country"
                defaultValue={company.country || ""}
                placeholder="Enter country"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}