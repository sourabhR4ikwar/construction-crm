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
import { MoreHorizontal, Pencil, Trash2, Building2, Mail, Phone } from "lucide-react"
import { deleteContact } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { EditContactDialog } from "./edit-contact-dialog"
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

interface ContactsTableProps {
  contactsPromise: Promise<Contact[]>
}

export function ContactsTable({ contactsPromise }: ContactsTableProps) {
  const contacts = use(contactsPromise)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const { toast } = useToast()

  const getRoleBadgeVariant = (role: ContactRole) => {
    switch (role) {
      case "primary_contact":
        return "default"
      case "project_manager":
        return "destructive"
      case "technical_lead":
        return "secondary"
      case "finance_contact":
        return "outline"
      case "executive":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getRoleLabel = (role: ContactRole) => {
    switch (role) {
      case "primary_contact":
        return "Primary Contact"
      case "project_manager":
        return "Project Manager"
      case "technical_lead":
        return "Technical Lead"
      case "finance_contact":
        return "Finance Contact"
      case "sales_contact":
        return "Sales Contact"
      case "support_contact":
        return "Support Contact"
      case "executive":
        return "Executive"
      case "other":
        return "Other"
      default:
        return role
    }
  }

  const getCompanyTypeBadgeVariant = (type: string) => {
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

  const handleDelete = async (contactId: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) {
      return
    }

    const result = await deleteContact(contactId)
    if (result.success) {
      toast({
        title: "Success",
        description: "Contact deleted successfully",
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
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{contact.name}</span>
                    {contact.department && (
                      <span className="text-sm text-muted-foreground">
                        {contact.department}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(contact.role)}>
                    {getRoleLabel(contact.role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{contact.company.name}</span>
                    </div>
                    <Badge variant={getCompanyTypeBadgeVariant(contact.company.type)} className="w-fit text-xs">
                      {contact.company.type}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                    >
                      <Mail className="h-3 w-3" />
                      {contact.email}
                    </a>
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="flex items-center gap-2 text-muted-foreground hover:underline text-sm"
                      >
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {contact.title && (
                    <span className="text-sm">{contact.title}</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(contact.createdAt).toLocaleDateString('en-US')}
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
                      <DropdownMenuItem onClick={() => setEditingContact(contact)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(contact.id)}
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
            {contacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No contacts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {editingContact && (
        <EditContactDialog
          contact={editingContact}
          open={!!editingContact}
          onClose={() => setEditingContact(null)}
        />
      )}
    </>
  )
}