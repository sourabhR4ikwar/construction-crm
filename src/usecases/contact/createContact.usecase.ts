import { ContactRepository, CreateContactInput } from "@/repo/contact/contact.repo"
import { CompanyRepository } from "@/repo/company/company.repo"
import { z } from "zod"

export const createContactSchema = z.object({
  name: z.string().min(2, "Contact name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
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
  ]),
  title: z.string().optional(),
  department: z.string().optional(),
  notes: z.string().optional(),
  companyId: z.string().uuid("Invalid company ID"),
})

export type CreateContactData = z.infer<typeof createContactSchema>

export class CreateContactUsecase {
  constructor(
    private contactRepo: ContactRepository,
    private companyRepo: CompanyRepository
  ) {}

  async execute(data: CreateContactData) {
    const validatedData = createContactSchema.parse(data)
    
    // Verify the company exists
    const company = await this.companyRepo.findById(validatedData.companyId)
    if (!company) {
      throw new Error("Company not found")
    }

    // Check if contact with this email already exists
    const existingContact = await this.contactRepo.findByEmail(validatedData.email)
    if (existingContact) {
      throw new Error("A contact with this email already exists")
    }

    return await this.contactRepo.create(validatedData)
  }
}