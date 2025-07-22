import { db } from "@/lib/db"
import { company as companyTable } from "@/lib/db/schema"
import { eq, ilike, or } from "drizzle-orm"
import { BaseRepository } from "../base.repo"
import { v4 as uuidv4 } from 'uuid'

export type CompanyType = "developer" | "contractor" | "architect_consultant" | "supplier_vendor"

export interface CreateCompanyInput {
  name: string
  type: CompanyType
  description?: string
  website?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

export interface UpdateCompanyInput {
  name?: string
  type?: CompanyType
  description?: string
  website?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

export interface CompanyFilters {
  type?: CompanyType
  search?: string
}

export class CompanyRepository extends BaseRepository {
  async findAll(filters?: CompanyFilters) {
    this.authorize("read")
    
    let query = db.select().from(companyTable)
    
    const conditions = []
    
    if (filters?.type) {
      conditions.push(eq(companyTable.type, filters.type))
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          ilike(companyTable.name, `%${filters.search}%`),
          ilike(companyTable.description, `%${filters.search}%`),
          ilike(companyTable.email, `%${filters.search}%`)
        )
      )
    }
    
    if (conditions.length > 0) {
      query = query.where(
        conditions.length === 1 ? conditions[0] : conditions.reduce((acc, condition) => ({ 
          ...acc, 
          ...condition 
        }))
      )
    }
    
    return await query
  }

  async findById(id: string) {
    this.authorize("read")
    
    const companies = await db.select()
      .from(companyTable)
      .where(eq(companyTable.id, id))
    
    return companies[0] || null
  }

  async findByName(name: string) {
    this.authorize("read")
    
    const companies = await db.select()
      .from(companyTable)
      .where(eq(companyTable.name, name))
    
    return companies[0] || null
  }

  async create(input: CreateCompanyInput) {
    this.authorize("write")
    
    const newCompany = {
      id: uuidv4(),
      name: input.name,
      type: input.type,
      description: input.description,
      website: input.website,
      phone: input.phone,
      email: input.email,
      address: input.address,
      city: input.city,
      state: input.state,
      zipCode: input.zipCode,
      country: input.country,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const [createdCompany] = await db.insert(companyTable)
      .values(newCompany)
      .returning()

    return createdCompany
  }

  async update(id: string, input: UpdateCompanyInput) {
    this.authorize("write")
    
    const [updatedCompany] = await db.update(companyTable)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(companyTable.id, id))
      .returning()

    return updatedCompany
  }

  async delete(id: string) {
    this.authorize("delete")
    
    await db.delete(companyTable)
      .where(eq(companyTable.id, id))
  }

  async getCompanyTypes(): Promise<CompanyType[]> {
    return ["developer", "contractor", "architect_consultant", "supplier_vendor"]
  }
}