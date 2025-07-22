import { CompanyRepository } from "@/repo/company/company.repo"
import { z } from "zod"

export const getCompanySchema = z.object({
  id: z.string().uuid("Invalid company ID"),
})

export type GetCompanyData = z.infer<typeof getCompanySchema>

export class GetCompanyUsecase {
  constructor(private companyRepo: CompanyRepository) {}

  async execute(data: GetCompanyData) {
    const validatedData = getCompanySchema.parse(data)
    
    const company = await this.companyRepo.findById(validatedData.id)
    if (!company) {
      throw new Error("Company not found")
    }

    return company
  }
}