import { InteractionRepository, CreateInteractionInput } from "@/repo/interaction/interaction.repo"
import { z } from "zod"

export const createInteractionSchema = z.object({
  projectId: z.string().uuid("Invalid project ID format"),
  type: z.enum(["meeting", "phone_call", "email", "site_visit", "document_shared", "milestone_update", "issue_reported", "other"]),
  summary: z.string().min(1, "Summary is required").max(255, "Summary must be 255 characters or less"),
  description: z.string().optional(),
  interactionDate: z.string().transform((str) => new Date(str)),
  contactId: z.string().uuid("Invalid contact ID format").optional(),
})

export type CreateInteractionData = z.infer<typeof createInteractionSchema>

export class CreateInteractionUsecase {
  constructor(private interactionRepo: InteractionRepository) {}

  async execute(data: CreateInteractionData) {
    const validatedData = createInteractionSchema.parse(data)
    
    // Validate interaction date is not in the future
    const now = new Date()
    if (validatedData.interactionDate > now) {
      throw new Error("Interaction date cannot be in the future")
    }
    
    // Create the interaction
    const interaction = await this.interactionRepo.create(validatedData as CreateInteractionInput)
    
    return interaction
  }
}