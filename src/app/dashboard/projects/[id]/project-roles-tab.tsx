"use client"

import { use, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2, Plus, Building2, Mail, Phone } from "lucide-react"
import { AssignRoleDialog } from "./assign-role-dialog"
import { removeProjectRole } from "../actions"
import { useToast } from "@/hooks/use-toast"
import { ProjectRole } from "@/repo/project/project.repo"

interface ProjectRole {
  id: string
  projectId: string
  contactId: string
  role: ProjectRole
  assignedAt: Date
  contact: {
    id: string
    name: string
    email: string
    phone: string | null
    title: string | null
    companyId: string
  }
  company: {
    id: string
    name: string
    type: string
  }
}

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

interface ProjectRolesTabProps {
  projectId: string
  projectRolesPromise: Promise<ProjectRole[]>
  contactsPromise: Promise<Contact[]>
}

export function ProjectRolesTab({ projectId, projectRolesPromise, contactsPromise }: ProjectRolesTabProps) {
  const projectRoles = use(projectRolesPromise)
  const contacts = use(contactsPromise)
  const [assignRoleOpen, setAssignRoleOpen] = useState(false)
  const { toast } = useToast()

  const getRoleBadgeVariant = (role: ProjectRole) => {
    switch (role) {
      case "developer":
        return "default"
      case "client_stakeholder":
        return "secondary"
      case "contractor":
        return "outline"
      case "architect_consultant":
        return "destructive"
      case "project_manager":
        return "default"
      case "supplier_vendor":
        return "outline"
      default:
        return "outline"
    }
  }

  const getRoleLabel = (role: ProjectRole) => {
    switch (role) {
      case "developer":
        return "Developer"
      case "client_stakeholder":
        return "Client/Stakeholder"
      case "contractor":
        return "Contractor"
      case "architect_consultant":
        return "Architect/Consultant"
      case "project_manager":
        return "Project Manager"
      case "supplier_vendor":
        return "Supplier/Vendor"
      default:
        return role
    }
  }

  const handleRemoveRole = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to remove this role assignment?")) {
      return
    }

    const result = await removeProjectRole(projectId, assignmentId)
    if (result.success) {
      toast({
        title: "Success",
        description: "Role assignment removed successfully",
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
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Project Team</CardTitle>
              <CardDescription>
                Manage team members and their roles in this project
              </CardDescription>
            </div>
            <Button onClick={() => setAssignRoleOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Assign Role
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Roles Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectRoles.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{assignment.contact.name}</span>
                      {assignment.contact.title && (
                        <span className="text-sm text-muted-foreground">
                          {assignment.contact.title}
                        </span>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {assignment.contact.email && (
                          <a
                            href={`mailto:${assignment.contact.email}`}
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" />
                            {assignment.contact.email}
                          </a>
                        )}
                        {assignment.contact.phone && (
                          <a
                            href={`tel:${assignment.contact.phone}`}
                            className="text-sm text-muted-foreground hover:underline flex items-center gap-1"
                          >
                            <Phone className="h-3 w-3" />
                            {assignment.contact.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{assignment.company.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(assignment.role)}>
                      {getRoleLabel(assignment.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(assignment.assignedAt).toLocaleDateString('en-US')}
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
                        <DropdownMenuItem
                          onClick={() => handleRemoveRole(assignment.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {projectRoles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No team members assigned yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assign Role Dialog */}
      <AssignRoleDialog
        projectId={projectId}
        contacts={contacts}
        open={assignRoleOpen}
        onClose={() => setAssignRoleOpen(false)}
      />
    </div>
  )
}