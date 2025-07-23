import { db } from "@/lib/db"
import { 
  project as projectTable, 
  contact as contactTable, 
  company as companyTable,
  projectDocument as documentTable,
  projectDocumentVersion as documentVersionTable,
  projectInteraction as interactionTable,
  user as userTable
} from "@/lib/db/schema"
import { ilike, or, and, eq, gte, lte, desc, asc, sql } from "drizzle-orm"
import { BaseRepository } from "../base.repo"

export type SearchEntityType = "projects" | "contacts" | "companies" | "documents" | "all"
export type SearchSortBy = "relevance" | "created_at" | "updated_at" | "name" | "title"
export type SearchSortOrder = "asc" | "desc"

export interface SearchFilters {
  // General filters
  entityTypes?: SearchEntityType[]
  dateFrom?: string
  dateTo?: string
  
  // Project specific filters
  projectStatus?: ("planning" | "active" | "on_hold" | "completed")[]
  projectStage?: ("design" | "construction" | "hand_off")[]
  
  // Company specific filters
  companyTypes?: ("developer" | "contractor" | "architect_consultant" | "supplier_vendor")[]
  
  // Contact specific filters
  contactRoles?: string[]
  
  // Document specific filters
  documentTypes?: ("drawings_plans" | "contracts" | "permits" | "reports" | "specifications" | "correspondence" | "photos" | "other")[]
}

export interface SearchOptions {
  sortBy?: SearchSortBy
  sortOrder?: SearchSortOrder
  limit?: number
  offset?: number
}

export interface SearchInput {
  query: string
  filters?: SearchFilters
  options?: SearchOptions
}

export interface SearchResult {
  id: string
  type: "project" | "contact" | "company" | "document"
  title: string
  description?: string
  subtitle?: string
  metadata?: Record<string, any>
  relevanceScore?: number
  matchedFields: string[]
  createdAt: Date
  updatedAt?: Date
}

export interface SearchResponse {
  results: SearchResult[]
  totalCount: number
  hasMore: boolean
  query: string
  appliedFilters: SearchFilters
}

export class SearchRepository extends BaseRepository {
  
  async search(input: SearchInput): Promise<SearchResponse> {
    this.authorize("read")
    
    const { query, filters = {}, options = {} } = input
    const { 
      entityTypes = ["all"], 
      dateFrom, 
      dateTo,
      projectStatus,
      projectStage,
      companyTypes,
      contactRoles,
      documentTypes
    } = filters
    
    const {
      sortBy = "relevance",
      sortOrder = "desc",
      limit = 20,
      offset = 0
    } = options

    const searchResults: SearchResult[] = []
    
    // Determine which entities to search
    const shouldSearchProjects = entityTypes.includes("all") || entityTypes.includes("projects")
    const shouldSearchContacts = entityTypes.includes("all") || entityTypes.includes("contacts")
    const shouldSearchCompanies = entityTypes.includes("all") || entityTypes.includes("companies")
    const shouldSearchDocuments = entityTypes.includes("all") || entityTypes.includes("documents")

    // Search Projects
    if (shouldSearchProjects) {
      const projectResults = await this.searchProjects(query, { 
        status: projectStatus,
        stage: projectStage,
        dateFrom,
        dateTo
      })
      searchResults.push(...projectResults)
    }

    // Search Contacts
    if (shouldSearchContacts) {
      const contactResults = await this.searchContacts(query, {
        roles: contactRoles,
        dateFrom,
        dateTo
      })
      searchResults.push(...contactResults)
    }

    // Search Companies
    if (shouldSearchCompanies) {
      const companyResults = await this.searchCompanies(query, {
        types: companyTypes,
        dateFrom,
        dateTo
      })
      searchResults.push(...companyResults)
    }

    // Search Documents
    if (shouldSearchDocuments) {
      const documentResults = await this.searchDocuments(query, {
        types: documentTypes,
        dateFrom,
        dateTo
      })
      searchResults.push(...documentResults)
    }

    // Sort results
    const sortedResults = this.sortResults(searchResults, sortBy, sortOrder)
    
    // Apply pagination
    const paginatedResults = sortedResults.slice(offset, offset + limit)
    const totalCount = sortedResults.length
    const hasMore = offset + limit < totalCount

    return {
      results: paginatedResults,
      totalCount,
      hasMore,
      query,
      appliedFilters: filters
    }
  }

  private async searchProjects(query: string, filters: {
    status?: string[]
    stage?: string[]
    dateFrom?: string
    dateTo?: string
  }): Promise<SearchResult[]> {
    
    const conditions = [
      or(
        ilike(projectTable.title, `%${query}%`),
        ilike(projectTable.description, `%${query}%`),
        ilike(projectTable.address, `%${query}%`),
        ilike(projectTable.city, `%${query}%`)
      )
    ]

    if (filters.status && filters.status.length > 0) {
      conditions.push(sql`${projectTable.status} = ANY(${filters.status})`)
    }

    if (filters.stage && filters.stage.length > 0) {
      conditions.push(sql`${projectTable.stage} = ANY(${filters.stage})`)
    }

    if (filters.dateFrom) {
      conditions.push(gte(projectTable.createdAt, new Date(filters.dateFrom)))
    }

    if (filters.dateTo) {
      conditions.push(lte(projectTable.createdAt, new Date(filters.dateTo)))
    }

    const projects = await db
      .select({
        id: projectTable.id,
        title: projectTable.title,
        description: projectTable.description,
        status: projectTable.status,
        stage: projectTable.stage,
        address: projectTable.address,
        city: projectTable.city,
        budget: projectTable.budget,
        createdAt: projectTable.createdAt,
        updatedAt: projectTable.updatedAt,
        createdBy: projectTable.createdBy,
        createdByName: userTable.name
      })
      .from(projectTable)
      .leftJoin(userTable, eq(projectTable.createdBy, userTable.id))
      .where(and(...conditions))

    return projects.map(project => {
      const matchedFields = []
      if (project.title?.toLowerCase().includes(query.toLowerCase())) matchedFields.push("title")
      if (project.description?.toLowerCase().includes(query.toLowerCase())) matchedFields.push("description")
      if (project.address?.toLowerCase().includes(query.toLowerCase())) matchedFields.push("address")
      if (project.city?.toLowerCase().includes(query.toLowerCase())) matchedFields.push("city")

      return {
        id: project.id,
        type: "project" as const,
        title: project.title,
        description: project.description || undefined,
        subtitle: `${project.status} • ${project.stage}${project.city ? ` • ${project.city}` : ''}`,
        metadata: {
          status: project.status,
          stage: project.stage,
          budget: project.budget,
          address: project.address,
          city: project.city,
          createdBy: project.createdByName
        },
        matchedFields,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      }
    })
  }

  private async searchContacts(query: string, filters: {
    roles?: string[]
    dateFrom?: string
    dateTo?: string
  }): Promise<SearchResult[]> {
    
    const conditions = [
      or(
        ilike(contactTable.name, `%${query}%`),
        ilike(contactTable.email, `%${query}%`),
        ilike(contactTable.phone, `%${query}%`),
        ilike(contactTable.title, `%${query}%`),
        ilike(contactTable.department, `%${query}%`),
        ilike(companyTable.name, `%${query}%`)
      )
    ]

    if (filters.roles && filters.roles.length > 0) {
      conditions.push(sql`${contactTable.role} = ANY(${filters.roles})`)
    }

    if (filters.dateFrom) {
      conditions.push(gte(contactTable.createdAt, new Date(filters.dateFrom)))
    }

    if (filters.dateTo) {
      conditions.push(lte(contactTable.createdAt, new Date(filters.dateTo)))
    }

    const contacts = await db
      .select({
        id: contactTable.id,
        name: contactTable.name,
        email: contactTable.email,
        phone: contactTable.phone,
        role: contactTable.role,
        title: contactTable.title,
        department: contactTable.department,
        notes: contactTable.notes,
        createdAt: contactTable.createdAt,
        updatedAt: contactTable.updatedAt,
        companyId: contactTable.companyId,
        companyName: companyTable.name,
        companyType: companyTable.type
      })
      .from(contactTable)
      .leftJoin(companyTable, eq(contactTable.companyId, companyTable.id))
      .where(and(...conditions))

    return contacts.map(contact => {
      const matchedFields = []
      if (contact.name?.toLowerCase().includes(query.toLowerCase())) matchedFields.push("name")
      if (contact.email?.toLowerCase().includes(query.toLowerCase())) matchedFields.push("email")
      if (contact.phone?.toLowerCase().includes(query.toLowerCase())) matchedFields.push("phone")
      if (contact.title?.toLowerCase().includes(query.toLowerCase())) matchedFields.push("title")
      if (contact.department?.toLowerCase().includes(query.toLowerCase())) matchedFields.push("department")
      if (contact.companyName?.toLowerCase().includes(query.toLowerCase())) matchedFields.push("company")

      return {
        id: contact.id,
        type: "contact" as const,
        title: contact.name,
        description: contact.email,
        subtitle: `${contact.role}${contact.title ? ` • ${contact.title}` : ''}${contact.companyName ? ` • ${contact.companyName}` : ''}`,
        metadata: {
          email: contact.email,
          phone: contact.phone,
          role: contact.role,
          title: contact.title,
          department: contact.department,
          companyId: contact.companyId,
          companyName: contact.companyName,
          companyType: contact.companyType
        },
        matchedFields,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      }
    })
  }

  private async searchCompanies(query: string, filters: {
    types?: string[]
    dateFrom?: string
    dateTo?: string
  }): Promise<SearchResult[]> {
    
    const conditions = [
      or(
        ilike(companyTable.name, `%${query}%`),
        ilike(companyTable.description, `%${query}%`),
        ilike(companyTable.website, `%${query}%`),
        ilike(companyTable.email, `%${query}%`),
        ilike(companyTable.address, `%${query}%`),
        ilike(companyTable.city, `%${query}%`)
      )
    ]

    if (filters.types && filters.types.length > 0) {
      conditions.push(sql`${companyTable.type} = ANY(${filters.types})`)
    }

    if (filters.dateFrom) {
      conditions.push(gte(companyTable.createdAt, new Date(filters.dateFrom)))
    }

    if (filters.dateTo) {
      conditions.push(lte(companyTable.createdAt, new Date(filters.dateTo)))
    }

    const companies = await db
      .select()
      .from(companyTable)
      .where(and(...conditions))

    return companies.map(company => {
      const matchedFields = []
      if (company.name?.toLowerCase().includes(query.toLowerCase())) matchedFields.push("name")
      if (company.description?.toLowerCase().includes(query.toLowerCase())) matchedFields.push("description")
      if (company.website?.toLowerCase().includes(query.toLowerCase())) matchedFields.push("website")
      if (company.email?.toLowerCase().includes(query.toLowerCase())) matchedFields.push("email")
      if (company.address?.toLowerCase().includes(query.toLowerCase())) matchedFields.push("address")
      if (company.city?.toLowerCase().includes(query.toLowerCase())) matchedFields.push("city")

      return {
        id: company.id,
        type: "company" as const,
        title: company.name,
        description: company.description || undefined,
        subtitle: `${company.type}${company.city ? ` • ${company.city}` : ''}`,
        metadata: {
          type: company.type,
          website: company.website,
          email: company.email,
          phone: company.phone,
          address: company.address,
          city: company.city,
          state: company.state,
          country: company.country
        },
        matchedFields,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      }
    })
  }

  private async searchDocuments(query: string, filters: {
    types?: string[]
    dateFrom?: string
    dateTo?: string
  }): Promise<SearchResult[]> {
    
    const conditions = [
      or(
        ilike(documentTable.name, `%${query}%`),
        ilike(documentTable.description, `%${query}%`),
        ilike(documentTable.tags, `%${query}%`),
        ilike(documentVersionTable.fileName, `%${query}%`),
        ilike(documentVersionTable.versionNotes, `%${query}%`)
      )
    ]

    if (filters.types && filters.types.length > 0) {
      conditions.push(sql`${documentTable.type} = ANY(${filters.types})`)
    }

    if (filters.dateFrom) {
      conditions.push(gte(documentTable.createdAt, new Date(filters.dateFrom)))
    }

    if (filters.dateTo) {
      conditions.push(lte(documentTable.createdAt, new Date(filters.dateTo)))
    }

    const documents = await db
      .select({
        id: documentTable.id,
        name: documentTable.name,
        description: documentTable.description,
        type: documentTable.type,
        currentVersion: documentTable.currentVersion,
        tags: documentTable.tags,
        createdAt: documentTable.createdAt,
        updatedAt: documentTable.updatedAt,
        projectId: documentTable.projectId,
        createdBy: documentTable.createdBy,
        createdByName: userTable.name,
        projectTitle: projectTable.title,
        latestFileName: documentVersionTable.fileName,
        latestFileSize: documentVersionTable.fileSize
      })
      .from(documentTable)
      .leftJoin(userTable, eq(documentTable.createdBy, userTable.id))
      .leftJoin(projectTable, eq(documentTable.projectId, projectTable.id))
      .leftJoin(documentVersionTable, eq(documentTable.id, documentVersionTable.documentId))
      .where(and(...conditions))

    return documents.map(document => {
      const matchedFields = []
      if (document.name?.toLowerCase().includes(query.toLowerCase())) matchedFields.push("name")
      if (document.description?.toLowerCase().includes(query.toLowerCase())) matchedFields.push("description")
      if (document.tags?.toLowerCase().includes(query.toLowerCase())) matchedFields.push("tags")
      if (document.latestFileName?.toLowerCase().includes(query.toLowerCase())) matchedFields.push("fileName")

      return {
        id: document.id,
        type: "document" as const,
        title: document.name,
        description: document.description || undefined,
        subtitle: `${document.type} • v${document.currentVersion}${document.projectTitle ? ` • ${document.projectTitle}` : ''}`,
        metadata: {
          type: document.type,
          currentVersion: document.currentVersion,
          tags: document.tags,
          projectId: document.projectId,
          projectTitle: document.projectTitle,
          createdBy: document.createdByName,
          fileName: document.latestFileName,
          fileSize: document.latestFileSize
        },
        matchedFields,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      }
    })
  }

  private sortResults(results: SearchResult[], sortBy: SearchSortBy, sortOrder: SearchSortOrder): SearchResult[] {
    return results.sort((a, b) => {
      let compareValue = 0

      switch (sortBy) {
        case "relevance":
          // Simple relevance scoring based on number of matched fields and title match
          const aScore = a.matchedFields.length + (a.matchedFields.includes("title") || a.matchedFields.includes("name") ? 2 : 0)
          const bScore = b.matchedFields.length + (b.matchedFields.includes("title") || b.matchedFields.includes("name") ? 2 : 0)
          compareValue = bScore - aScore
          break
        case "created_at":
          compareValue = a.createdAt.getTime() - b.createdAt.getTime()
          break
        case "updated_at":
          const aUpdated = a.updatedAt || a.createdAt
          const bUpdated = b.updatedAt || b.createdAt
          compareValue = aUpdated.getTime() - bUpdated.getTime()
          break
        case "name":
        case "title":
          compareValue = a.title.localeCompare(b.title)
          break
        default:
          compareValue = 0
      }

      return sortOrder === "desc" ? -compareValue : compareValue
    })
  }

  async getSearchFilters() {
    this.authorize("read")
    
    return {
      projectStatuses: ["planning", "active", "on_hold", "completed"],
      projectStages: ["design", "construction", "hand_off"],
      companyTypes: ["developer", "contractor", "architect_consultant", "supplier_vendor"],
      contactRoles: ["primary_contact", "project_manager", "technical_lead", "finance_contact", "sales_contact", "support_contact", "executive", "other"],
      documentTypes: ["drawings_plans", "contracts", "permits", "reports", "specifications", "correspondence", "photos", "other"]
    }
  }
}