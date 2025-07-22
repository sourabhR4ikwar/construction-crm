import { CompanyRepository } from "@/repo/company/company.repo"
import { z } from "zod"

export const deleteCompanySchema = z.object({
  id: z.string().uuid("Invalid company ID"),
})

export type DeleteCompanyData = z.infer<typeof deleteCompanySchema>

export class DeleteCompanyUsecase {
  constructor(private companyRepo: CompanyRepository) {}

  async execute(data: DeleteCompanyData) {
    const validatedData = deleteCompanySchema.parse(data)
    
    const existingCompany = await this.companyRepo.findById(validatedData.id)
    if (!existingCompany) {
      throw new Error("Company not found")
    }

    return await this.companyRepo.delete(validatedData.id)
  }
}