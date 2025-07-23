import { ProjectRepository, CreateProjectInput } from "@/repo/project/project.repo"
import { z } from "zod"

export const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be 255 characters or less"),
  description: z.string().optional(),
  budget: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  stage: z.enum(["design", "construction", "hand_off"]),
  status: z.enum(["planning", "active", "on_hold", "completed"]),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
})

export type CreateProjectData = z.infer<typeof createProjectSchema>

export class CreateProjectUsecase {
  constructor(private projectRepo: ProjectRepository) {}

  async execute(data: CreateProjectData) {
    const validatedData = createProjectSchema.parse(data)
    
    // Check for duplicate project title
    const existingProject = await this.projectRepo.findByTitle(validatedData.title)
    if (existingProject) {
      throw new Error("A project with this title already exists")
    }
    
    // Validate date logic if both dates are provided
    if (validatedData.startDate && validatedData.endDate) {
      const startDate = new Date(validatedData.startDate)
      const endDate = new Date(validatedData.endDate)
      
      if (startDate >= endDate) {
        throw new Error("End date must be after start date")
      }
    }
    
    // Create the project
    const project = await this.projectRepo.create(validatedData as CreateProjectInput)
    
    return project
  }
}