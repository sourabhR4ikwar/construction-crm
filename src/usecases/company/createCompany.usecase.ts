import { CompanyRepository, CreateCompanyInput } from "@/repo/company/company.repo"
import { z } from "zod"

export const createCompanySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  type: z.enum(["developer", "contractor", "architect_consultant", "supplier_vendor"]),
  description: z.string().optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
})

export type CreateCompanyData = z.infer<typeof createCompanySchema>

export class CreateCompanyUsecase {
  constructor(private companyRepo: CompanyRepository) {}

  async execute(data: CreateCompanyData) {
    const validatedData = createCompanySchema.parse(data)
    
    const existingCompany = await this.companyRepo.findByName(validatedData.name)
    if (existingCompany) {
      throw new Error("Company with this name already exists")
    }

    return await this.companyRepo.create(validatedData)
  }
}