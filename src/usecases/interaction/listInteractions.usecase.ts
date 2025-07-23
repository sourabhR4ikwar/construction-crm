import { InteractionRepository, InteractionFilters } from "@/repo/interaction/interaction.repo"
import { z } from "zod"

export const listInteractionsSchema = z.object({
  projectId: z.string().uuid("Invalid project ID format").optional(),
  type: z.enum(["meeting", "phone_call", "email", "site_visit", "document_shared", "milestone_update", "issue_reported", "other"]).optional(),
  contactId: z.string().uuid("Invalid contact ID format").optional(),
  dateFrom: z.string().transform((str) => new Date(str)).optional(),
  dateTo: z.string().transform((str) => new Date(str)).optional(),
  search: z.string().optional(),
})

export type ListInteractionsData = z.infer<typeof listInteractionsSchema>

export class ListInteractionsUsecase {
  constructor(private interactionRepo: InteractionRepository) {}

  async execute(filters?: ListInteractionsData) {
    const validatedFilters = filters ? listInteractionsSchema.parse(filters) : undefined
    
    // Validate date range if both dates are provided
    if (validatedFilters?.dateFrom && validatedFilters?.dateTo) {
      if (validatedFilters.dateFrom > validatedFilters.dateTo) {
        throw new Error("From date must be before or equal to end date")
      }
    }
    
    const interactions = await this.interactionRepo.findAll(validatedFilters as InteractionFilters)
    
    return interactions
  }
}