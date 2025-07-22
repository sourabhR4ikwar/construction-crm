import { CompanyRepository, UpdateCompanyInput } from "@/repo/company/company.repo"
import { z } from "zod"

export const updateCompanySchema = z.object({
  id: z.string().uuid("Invalid company ID"),
  name: z.string().min(2, "Company name must be at least 2 characters").optional(),
  type: z.enum(["developer", "contractor", "architect_consultant", "supplier_vendor"]).optional(),
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

export type UpdateCompanyData = z.infer<typeof updateCompanySchema>

export class UpdateCompanyUsecase {
  constructor(private companyRepo: CompanyRepository) {}

  async execute(data: UpdateCompanyData) {
    const validatedData = updateCompanySchema.parse(data)
    
    const existingCompany = await this.companyRepo.findById(validatedData.id)
    if (!existingCompany) {
      throw new Error("Company not found")
    }

    if (validatedData.name && validatedData.name !== existingCompany.name) {
      const duplicateCompany = await this.companyRepo.findByName(validatedData.name)
      if (duplicateCompany && duplicateCompany.id !== validatedData.id) {
        throw new Error("Company with this name already exists")
      }
    }

    const { id, ...updateData } = validatedData
    return await this.companyRepo.update(id, updateData)
  }
}