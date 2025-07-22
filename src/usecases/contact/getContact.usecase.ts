import { ContactRepository } from "@/repo/contact/contact.repo"
import { z } from "zod"

export const getContactSchema = z.object({
  id: z.string().uuid("Invalid contact ID"),
})

export type GetContactData = z.infer<typeof getContactSchema>

export class GetContactUsecase {
  constructor(private contactRepo: ContactRepository) {}

  async execute(data: GetContactData) {
    const validatedData = getContactSchema.parse(data)
    
    const contact = await this.contactRepo.findById(validatedData.id)
    if (!contact) {
      throw new Error("Contact not found")
    }

    return contact
  }
}