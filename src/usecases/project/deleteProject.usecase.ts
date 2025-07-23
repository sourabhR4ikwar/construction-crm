import { ProjectRepository } from "@/repo/project/project.repo"
import { z } from "zod"

export const deleteProjectSchema = z.object({
  id: z.string().uuid("Invalid project ID format"),
})

export type DeleteProjectData = z.infer<typeof deleteProjectSchema>

export class DeleteProjectUsecase {
  constructor(private projectRepo: ProjectRepository) {}

  async execute(data: DeleteProjectData) {
    const validatedData = deleteProjectSchema.parse(data)
    
    // Check if project exists
    const existingProject = await this.projectRepo.findById(validatedData.id)
    if (!existingProject) {
      throw new Error("Project not found")
    }
    
    // Delete the project (cascading will handle role assignments and interactions)
    await this.projectRepo.delete(validatedData.id)
    
    return { success: true, message: "Project deleted successfully" }
  }
}