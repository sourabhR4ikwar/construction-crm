import { ProjectRepository, UpdateProjectInput } from "@/repo/project/project.repo"
import { z } from "zod"

export const updateProjectSchema = z.object({
  id: z.string().uuid("Invalid project ID format"),
  title: z.string().min(1, "Title is required").max(255, "Title must be 255 characters or less").optional(),
  description: z.string().optional(),
  budget: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  stage: z.enum(["design", "construction", "hand_off"]).optional(),
  status: z.enum(["planning", "active", "on_hold", "completed"]).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
})

export type UpdateProjectData = z.infer<typeof updateProjectSchema>

export class UpdateProjectUsecase {
  constructor(private projectRepo: ProjectRepository) {}

  async execute(data: UpdateProjectData) {
    const validatedData = updateProjectSchema.parse(data)
    
    // Check if project exists
    const existingProject = await this.projectRepo.findById(validatedData.id)
    if (!existingProject) {
      throw new Error("Project not found")
    }
    
    // Check for duplicate title if title is being updated
    if (validatedData.title && validatedData.title !== existingProject.title) {
      const duplicateProject = await this.projectRepo.findByTitle(validatedData.title)
      if (duplicateProject) {
        throw new Error("A project with this title already exists")
      }
    }
    
    // Validate date logic if dates are being updated
    const startDate = validatedData.startDate || existingProject.startDate
    const endDate = validatedData.endDate || existingProject.endDate
    
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (start >= end) {
        throw new Error("End date must be after start date")
      }
    }
    
    // Extract update data (exclude id)
    const { id, ...updateData } = validatedData
    
    const updatedProject = await this.projectRepo.update(id, updateData as UpdateProjectInput)
    
    return updatedProject
  }
}