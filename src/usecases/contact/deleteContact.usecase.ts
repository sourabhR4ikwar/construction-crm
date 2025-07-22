import { ContactRepository } from "@/repo/contact/contact.repo"
import { z } from "zod"

export const deleteContactSchema = z.object({
  id: z.string().uuid("Invalid contact ID"),
})

export type DeleteContactData = z.infer<typeof deleteContactSchema>

export class DeleteContactUsecase {
  constructor(private contactRepo: ContactRepository) {}

  async execute(data: DeleteContactData) {
    const validatedData = deleteContactSchema.parse(data)
    
    const existingContact = await this.contactRepo.findById(validatedData.id)
    if (!existingContact) {
      throw new Error("Contact not found")
    }

    return await this.contactRepo.delete(validatedData.id)
  }
}