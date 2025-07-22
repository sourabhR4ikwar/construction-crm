import { CompanyRepository, CompanyFilters } from "@/repo/company/company.repo"
import { z } from "zod"

export const listCompaniesSchema = z.object({
  type: z.enum(["developer", "contractor", "architect_consultant", "supplier_vendor"]).optional(),
  search: z.string().optional(),
})

export type ListCompaniesData = z.infer<typeof listCompaniesSchema>

export class ListCompaniesUsecase {
  constructor(private companyRepo: CompanyRepository) {}

  async execute(filters?: ListCompaniesData) {
    let validatedFilters: CompanyFilters | undefined
    
    if (filters) {
      validatedFilters = listCompaniesSchema.parse(filters)
    }
    
    return await this.companyRepo.findAll(validatedFilters)
  }
}