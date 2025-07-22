"use client"

import { use } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react"
import { deleteCompany } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { EditCompanyDialog } from "./edit-company-dialog"
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

interface CompaniesTableProps {
  companiesPromise: Promise<Company[]>
}

export function CompaniesTable({ companiesPromise }: CompaniesTableProps) {
  const companies = use(companiesPromise)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const { toast } = useToast()

  const getTypeBadgeVariant = (type: CompanyType) => {
    switch (type) {
      case "developer":
        return "default"
      case "contractor":
        return "secondary"
      case "architect_consultant":
        return "outline"
      case "supplier_vendor":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getTypeLabel = (type: CompanyType) => {
    switch (type) {
      case "developer":
        return "Developer"
      case "contractor":
        return "Contractor"
      case "architect_consultant":
        return "Architect/Consultant"
      case "supplier_vendor":
        return "Supplier/Vendor"
      default:
        return type
    }
  }

  const handleDelete = async (companyId: string) => {
    if (!confirm("Are you sure you want to delete this company?")) {
      return
    }

    const result = await deleteCompany(companyId)
    if (result.success) {
      toast({
        title: "Success",
        description: "Company deleted successfully",
      })
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{company.name}</span>
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Website
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getTypeBadgeVariant(company.type)}>
                    {getTypeLabel(company.type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    {company.email && (
                      <a
                        href={`mailto:${company.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {company.email}
                      </a>
                    )}
                    {company.phone && (
                      <a
                        href={`tel:${company.phone}`}
                        className="text-muted-foreground hover:underline"
                      >
                        {company.phone}
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    {(company.city || company.state) && (
                      <span>
                        {[company.city, company.state].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {company.country && (
                      <span className="text-muted-foreground">{company.country}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(company.createdAt).toLocaleDateString('en-US')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => setEditingCompany(company)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(company.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {companies.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No companies found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {editingCompany && (
        <EditCompanyDialog
          company={editingCompany}
          open={!!editingCompany}
          onClose={() => setEditingCompany(null)}
        />
      )}
    </>
  )
}