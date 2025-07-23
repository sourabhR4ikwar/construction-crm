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
import { MoreHorizontal, Pencil, Trash2, Users, Calendar, Eye } from "lucide-react"
import Link from "next/link"
import { deleteProject } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { EditProjectDialog } from "./edit-project-dialog"
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

interface ProjectsTableProps {
  projectsPromise: Promise<Project[]>
}

export function ProjectsTable({ projectsPromise }: ProjectsTableProps) {
  const projects = use(projectsPromise)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const { toast } = useToast()

  const getStageBadgeVariant = (stage: ProjectStage) => {
    switch (stage) {
      case "design":
        return "outline"
      case "construction":
        return "default"
      case "hand_off":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStageLabel = (stage: ProjectStage) => {
    switch (stage) {
      case "design":
        return "Design"
      case "construction":
        return "Construction"
      case "hand_off":
        return "Hand-off"
      default:
        return stage
    }
  }

  const formatCurrency = (amount: string | null) => {
    if (!amount) return null
    const num = parseFloat(amount)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const handleDelete = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? This will also delete all associated role assignments and interactions.")) {
      return
    }

    const result = await deleteProject(projectId)
    if (result.success) {
      toast({
        title: "Success",
        description: "Project deleted successfully",
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
              <TableHead>Project</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{project.title}</span>
                    {project.description && (
                      <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {project.description}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStageBadgeVariant(project.stage)}>
                    {getStageLabel(project.stage)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {project.budget ? formatCurrency(project.budget) : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    {project.startDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(project.startDate)}</span>
                      </div>
                    )}
                    {project.endDate && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span>to {formatDate(project.endDate)}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    {(project.city || project.state) && (
                      <span>
                        {[project.city, project.state].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {project.country && (
                      <span className="text-muted-foreground">{project.country}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(project.createdAt).toLocaleDateString('en-US')}
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
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/projects/${project.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingProject(project)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(project.id)}
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
            {projects.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No projects found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {editingProject && (
        <EditProjectDialog
          project={editingProject}
          open={!!editingProject}
          onClose={() => setEditingProject(null)}
        />
      )}
    </>
  )
}