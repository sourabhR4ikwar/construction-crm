import { db } from "@/lib/db"
import { contact as contactTable, company as companyTable } from "@/lib/db/schema"
import { eq, ilike, or, and } from "drizzle-orm"
import { BaseRepository } from "../base.repo"
import { v4 as uuidv4 } from 'uuid'

export type ContactRole = 
  | "primary_contact"
  | "project_manager"
  | "technical_lead"
  | "finance_contact"
  | "sales_contact"
  | "support_contact"
  | "executive"
  | "other"

export interface CreateContactInput {
  name: string
  email: string
  phone?: string
  role: ContactRole
  title?: string
  department?: string
  notes?: string
  companyId: string
}

export interface UpdateContactInput {
  name?: string
  email?: string
  phone?: string
  role?: ContactRole
  title?: string
  department?: string
  notes?: string
  companyId?: string
}

export interface ContactFilters {
  companyId?: string
  role?: ContactRole
  search?: string
}

export interface ContactWithCompany {
  id: string
  name: string
  email: string
  phone: string | null
  role: ContactRole
  title: string | null
  department: string | null
  notes: string | null
  companyId: string
  createdAt: Date
  updatedAt: Date
  company: {
    id: string
    name: string
    type: string
  }
}

export class ContactRepository extends BaseRepository {
  async findAll(filters?: ContactFilters) {
    this.authorize("read")
    
    let query = db.select({
      id: contactTable.id,
      name: contactTable.name,
      email: contactTable.email,
      phone: contactTable.phone,
      role: contactTable.role,
      title: contactTable.title,
      department: contactTable.department,
      notes: contactTable.notes,
      companyId: contactTable.companyId,
      createdAt: contactTable.createdAt,
      updatedAt: contactTable.updatedAt,
      company: {
        id: companyTable.id,
        name: companyTable.name,
        type: companyTable.type,
      }
    })
    .from(contactTable)
    .leftJoin(companyTable, eq(contactTable.companyId, companyTable.id))
    
    const conditions = []
    
    if (filters?.companyId) {
      conditions.push(eq(contactTable.companyId, filters.companyId))
    }
    
    if (filters?.role) {
      conditions.push(eq(contactTable.role, filters.role))
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          ilike(contactTable.name, `%${filters.search}%`),
          ilike(contactTable.email, `%${filters.search}%`),
          ilike(contactTable.title, `%${filters.search}%`),
          ilike(contactTable.department, `%${filters.search}%`)
        )
      )
    }
    
    if (conditions.length > 0) {
      query = query.where(
        conditions.length === 1 ? conditions[0] : and(...conditions)
      )
    }
    
    return await query
  }

  async findById(id: string) {
    this.authorize("read")
    
    const contacts = await db.select({
      id: contactTable.id,
      name: contactTable.name,
      email: contactTable.email,
      phone: contactTable.phone,
      role: contactTable.role,
      title: contactTable.title,
      department: contactTable.department,
      notes: contactTable.notes,
      companyId: contactTable.companyId,
      createdAt: contactTable.createdAt,
      updatedAt: contactTable.updatedAt,
      company: {
        id: companyTable.id,
        name: companyTable.name,
        type: companyTable.type,
      }
    })
    .from(contactTable)
    .leftJoin(companyTable, eq(contactTable.companyId, companyTable.id))
    .where(eq(contactTable.id, id))
    
    return contacts[0] || null
  }

  async findByCompanyId(companyId: string) {
    this.authorize("read")
    
    return await db.select()
      .from(contactTable)
      .where(eq(contactTable.companyId, companyId))
  }

  async findByEmail(email: string) {
    this.authorize("read")
    
    const contacts = await db.select()
      .from(contactTable)
      .where(eq(contactTable.email, email))
    
    return contacts[0] || null
  }

  async create(input: CreateContactInput) {
    this.authorize("write")
    
    const newContact = {
      id: uuidv4(),
      name: input.name,
      email: input.email,
      phone: input.phone,
      role: input.role,
      title: input.title,
      department: input.department,
      notes: input.notes,
      companyId: input.companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const [createdContact] = await db.insert(contactTable)
      .values(newContact)
      .returning()

    return createdContact
  }

  async update(id: string, input: UpdateContactInput) {
    this.authorize("write")
    
    const [updatedContact] = await db.update(contactTable)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(contactTable.id, id))
      .returning()

    return updatedContact
  }

  async delete(id: string) {
    this.authorize("delete")
    
    await db.delete(contactTable)
      .where(eq(contactTable.id, id))
  }

  async getContactRoles(): Promise<ContactRole[]> {
    return [
      "primary_contact",
      "project_manager",
      "technical_lead",
      "finance_contact",
      "sales_contact",
      "support_contact",
      "executive",
      "other"
    ]
  }
}