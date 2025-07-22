import { ContactRepository, ContactFilters } from "@/repo/contact/contact.repo"
import { z } from "zod"

export const listContactsSchema = z.object({
  companyId: z.string().uuid("Invalid company ID").optional(),
  role: z.enum([
    "primary_contact",
    "project_manager",
    "technical_lead",
    "finance_contact",
    "sales_contact",
    "support_contact",
    "executive",
    "other"
  ]).optional(),
  search: z.string().optional(),
})

export type ListContactsData = z.infer<typeof listContactsSchema>

export class ListContactsUsecase {
  constructor(private contactRepo: ContactRepository) {}

  async execute(filters?: ListContactsData) {
    let validatedFilters: ContactFilters | undefined
    
    if (filters) {
      validatedFilters = listContactsSchema.parse(filters)
    }
    
    return await this.contactRepo.findAll(validatedFilters)
  }
}