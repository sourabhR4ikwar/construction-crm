import { ProjectRepository, ProjectFilters } from "@/repo/project/project.repo"
import { z } from "zod"

export const listProjectsSchema = z.object({
  stage: z.enum(["design", "construction", "hand_off"]).optional(),
  status: z.enum(["planning", "active", "on_hold", "completed"]).optional(),
  search: z.string().optional(),
  startDateFrom: z.string().optional(),
  startDateTo: z.string().optional(),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
})

export type ListProjectsData = z.infer<typeof listProjectsSchema>

export class ListProjectsUsecase {
  constructor(private projectRepo: ProjectRepository) {}

  async execute(filters?: ListProjectsData) {
    const validatedFilters = filters ? listProjectsSchema.parse(filters) : undefined
    
    // Validate date range if both dates are provided
    if (validatedFilters?.startDateFrom && validatedFilters?.startDateTo) {
      const fromDate = new Date(validatedFilters.startDateFrom)
      const toDate = new Date(validatedFilters.startDateTo)
      
      if (fromDate > toDate) {
        throw new Error("Start date must be before or equal to end date")
      }
    }
    
    // Validate budget range if both values are provided
    if (validatedFilters?.budgetMin && validatedFilters?.budgetMax) {
      const minBudget = parseFloat(validatedFilters.budgetMin)
      const maxBudget = parseFloat(validatedFilters.budgetMax)
      
      if (minBudget > maxBudget) {
        throw new Error("Minimum budget must be less than or equal to maximum budget")
      }
    }
    
    const projects = await this.projectRepo.findAll(validatedFilters as ProjectFilters)
    
    return projects
  }
}