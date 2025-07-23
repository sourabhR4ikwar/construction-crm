import { ProjectRepository } from "@/repo/project/project.repo"
import { z } from "zod"

export const getProjectSchema = z.object({
  id: z.string().uuid("Invalid project ID format"),
})

export type GetProjectData = z.infer<typeof getProjectSchema>

export class GetProjectUsecase {
  constructor(private projectRepo: ProjectRepository) {}

  async execute(data: GetProjectData) {
    const validatedData = getProjectSchema.parse(data)
    
    const project = await this.projectRepo.findById(validatedData.id)
    
    if (!project) {
      throw new Error("Project not found")
    }
    
    return project
  }
}