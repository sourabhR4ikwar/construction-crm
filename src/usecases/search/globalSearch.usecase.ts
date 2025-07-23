import { SearchRepository, SearchInput, SearchResponse } from "@/repo/search/search.repo"
import { z } from "zod"

export const searchFiltersSchema = z.object({
  entityTypes: z.array(z.enum(["projects", "contacts", "companies", "documents", "all"])).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  projectStatus: z.array(z.enum(["planning", "active", "on_hold", "completed"])).optional(),
  projectStage: z.array(z.enum(["design", "construction", "hand_off"])).optional(),
  companyTypes: z.array(z.enum(["developer", "contractor", "architect_consultant", "supplier_vendor"])).optional(),
  contactRoles: z.array(z.string()).optional(),
  documentTypes: z.array(z.enum(["drawings_plans", "contracts", "permits", "reports", "specifications", "correspondence", "photos", "other"])).optional(),
})

export const searchOptionsSchema = z.object({
  sortBy: z.enum(["relevance", "created_at", "updated_at", "name", "title"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
})

export const globalSearchSchema = z.object({
  query: z.string().min(1, "Search query is required").max(500, "Search query must be 500 characters or less").trim(),
  filters: searchFiltersSchema.optional(),
  options: searchOptionsSchema.optional(),
})

export type GlobalSearchData = z.infer<typeof globalSearchSchema>

export class GlobalSearchUsecase {
  constructor(private searchRepo: SearchRepository) {}

  async execute(data: GlobalSearchData): Promise<SearchResponse> {
    const validatedData = globalSearchSchema.parse(data)
    
    // Validate date range if both dates are provided
    if (validatedData.filters?.dateFrom && validatedData.filters?.dateTo) {
      const fromDate = new Date(validatedData.filters.dateFrom)
      const toDate = new Date(validatedData.filters.dateTo)
      
      if (fromDate >= toDate) {
        throw new Error("Date 'to' must be after date 'from'")
      }
    }
    
    // Perform the search
    const searchResults = await this.searchRepo.search(validatedData as SearchInput)
    
    return searchResults
  }

  async getAvailableFilters() {
    return await this.searchRepo.getSearchFilters()
  }
}