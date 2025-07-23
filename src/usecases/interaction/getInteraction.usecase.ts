import { InteractionRepository } from "@/repo/interaction/interaction.repo"
import { z } from "zod"

export const getInteractionSchema = z.object({
  id: z.string().uuid("Invalid interaction ID format"),
})

export type GetInteractionData = z.infer<typeof getInteractionSchema>

export class GetInteractionUsecase {
  constructor(private interactionRepo: InteractionRepository) {}

  async execute(data: GetInteractionData) {
    const validatedData = getInteractionSchema.parse(data)
    
    const interaction = await this.interactionRepo.findById(validatedData.id)
    
    if (!interaction) {
      throw new Error("Interaction not found")
    }
    
    return interaction
  }
}