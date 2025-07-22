import { ContactRepository, UpdateContactInput } from "@/repo/contact/contact.repo"
import { CompanyRepository } from "@/repo/company/company.repo"
import { z } from "zod"

export const updateContactSchema = z.object({
  id: z.string().uuid("Invalid contact ID"),
  name: z.string().min(2, "Contact name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
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
  title: z.string().optional(),
  department: z.string().optional(),
  notes: z.string().optional(),
  companyId: z.string().uuid("Invalid company ID").optional(),
})

export type UpdateContactData = z.infer<typeof updateContactSchema>

export class UpdateContactUsecase {
  constructor(
    private contactRepo: ContactRepository,
    private companyRepo: CompanyRepository
  ) {}

  async execute(data: UpdateContactData) {
    const validatedData = updateContactSchema.parse(data)
    
    // Verify the contact exists
    const existingContact = await this.contactRepo.findById(validatedData.id)
    if (!existingContact) {
      throw new Error("Contact not found")
    }

    // If company is being changed, verify the new company exists
    if (validatedData.companyId && validatedData.companyId !== existingContact.companyId) {
      const company = await this.companyRepo.findById(validatedData.companyId)
      if (!company) {
        throw new Error("Company not found")
      }
    }

    // If email is being changed, check for duplicates
    if (validatedData.email && validatedData.email !== existingContact.email) {
      const duplicateContact = await this.contactRepo.findByEmail(validatedData.email)
      if (duplicateContact && duplicateContact.id !== validatedData.id) {
        throw new Error("A contact with this email already exists")
      }
    }

    const { id, ...updateData } = validatedData
    return await this.contactRepo.update(id, updateData)
  }
}