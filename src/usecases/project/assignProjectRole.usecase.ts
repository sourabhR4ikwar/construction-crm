import { ProjectRepository, ProjectRoleAssignmentInput } from "@/repo/project/project.repo"
import { z } from "zod"

export const assignProjectRoleSchema = z.object({
  projectId: z.string().uuid("Invalid project ID format"),
  contactId: z.string().uuid("Invalid contact ID format"),
  role: z.enum(["developer", "client_stakeholder", "contractor", "architect_consultant", "project_manager", "supplier_vendor"]),
})

export type AssignProjectRoleData = z.infer<typeof assignProjectRoleSchema>

export class AssignProjectRoleUsecase {
  constructor(private projectRepo: ProjectRepository) {}

  async execute(data: AssignProjectRoleData) {
    const validatedData = assignProjectRoleSchema.parse(data)
    
    // Check if project exists
    const existingProject = await this.projectRepo.findById(validatedData.projectId)
    if (!existingProject) {
      throw new Error("Project not found")
    }
    
    // Create role assignment
    const assignment = await this.projectRepo.assignRole(
      validatedData.projectId,
      {
        contactId: validatedData.contactId,
        role: validatedData.role,
      } as ProjectRoleAssignmentInput
    )
    
    return assignment
  }
}