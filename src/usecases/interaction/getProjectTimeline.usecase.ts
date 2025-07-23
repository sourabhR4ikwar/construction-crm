import { InteractionRepository } from "@/repo/interaction/interaction.repo"
import { z } from "zod"

export const getProjectTimelineSchema = z.object({
  projectId: z.string().uuid("Invalid project ID format"),
})

export type GetProjectTimelineData = z.infer<typeof getProjectTimelineSchema>

export class GetProjectTimelineUsecase {
  constructor(private interactionRepo: InteractionRepository) {}

  async execute(data: GetProjectTimelineData) {
    const validatedData = getProjectTimelineSchema.parse(data)
    
    const timeline = await this.interactionRepo.getProjectTimeline(validatedData.projectId)
    
    return timeline
  }
}