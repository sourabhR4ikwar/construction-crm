import { db } from "@/lib/db"
import { projectInteraction as interactionTable, project as projectTable, contact as contactTable } from "@/lib/db/schema"
import { eq, and, gte, lte, desc, or, ilike } from "drizzle-orm"
import { BaseRepository } from "../base.repo"
import { v4 as uuidv4 } from 'uuid'

export type InteractionType = "meeting" | "phone_call" | "email" | "site_visit" | "document_shared" | "milestone_update" | "issue_reported" | "other"

export interface CreateInteractionInput {
  projectId: string
  type: InteractionType
  summary: string
  description?: string
  interactionDate: Date
  contactId?: string
}

export interface UpdateInteractionInput {
  type?: InteractionType
  summary?: string
  description?: string
  interactionDate?: Date
  contactId?: string
}

export interface InteractionFilters {
  projectId?: string
  type?: InteractionType
  contactId?: string
  dateFrom?: Date
  dateTo?: Date
  search?: string
}

export class InteractionRepository extends BaseRepository {
  async findAll(filters?: InteractionFilters) {
    this.authorize("read")
    
    let query = db.select({
      interaction: interactionTable,
      project: {
        id: projectTable.id,
        title: projectTable.title,
      },
      contact: {
        id: contactTable.id,
        name: contactTable.name,
        email: contactTable.email,
      }
    })
    .from(interactionTable)
    .leftJoin(projectTable, eq(interactionTable.projectId, projectTable.id))
    .leftJoin(contactTable, eq(interactionTable.contactId, contactTable.id))
    
    const conditions = []
    
    if (filters?.projectId) {
      conditions.push(eq(interactionTable.projectId, filters.projectId))
    }
    
    if (filters?.type) {
      conditions.push(eq(interactionTable.type, filters.type))
    }
    
    if (filters?.contactId) {
      conditions.push(eq(interactionTable.contactId, filters.contactId))
    }
    
    if (filters?.dateFrom) {
      conditions.push(gte(interactionTable.interactionDate, filters.dateFrom))
    }
    
    if (filters?.dateTo) {
      conditions.push(lte(interactionTable.interactionDate, filters.dateTo))
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          ilike(interactionTable.summary, `%${filters.search}%`),
          ilike(interactionTable.description, `%${filters.search}%`)
        )
      )
    }
    
    if (conditions.length > 0) {
      query = query.where(
        conditions.length === 1 ? conditions[0] : and(...conditions)
      )
    }
    
    return await query.orderBy(desc(interactionTable.interactionDate))
  }

  async findById(id: string) {
    this.authorize("read")
    
    const interactions = await db.select({
      interaction: interactionTable,
      project: {
        id: projectTable.id,
        title: projectTable.title,
      },
      contact: {
        id: contactTable.id,
        name: contactTable.name,
        email: contactTable.email,
      }
    })
    .from(interactionTable)
    .leftJoin(projectTable, eq(interactionTable.projectId, projectTable.id))
    .leftJoin(contactTable, eq(interactionTable.contactId, contactTable.id))
    .where(eq(interactionTable.id, id))
    
    return interactions[0] || null
  }

  async findByProject(projectId: string) {
    this.authorize("read")
    
    return await db.select({
      interaction: interactionTable,
      contact: {
        id: contactTable.id,
        name: contactTable.name,
        email: contactTable.email,
      }
    })
    .from(interactionTable)
    .leftJoin(contactTable, eq(interactionTable.contactId, contactTable.id))
    .where(eq(interactionTable.projectId, projectId))
    .orderBy(desc(interactionTable.interactionDate))
  }

  async create(input: CreateInteractionInput) {
    this.authorize("write")
    
    if (!this.user) {
      throw new Error("User must be authenticated to create interactions")
    }
    
    // Verify project exists
    const project = await db.select()
      .from(projectTable)
      .where(eq(projectTable.id, input.projectId))
    
    if (!project.length) {
      throw new Error("Project not found")
    }
    
    // Verify contact exists if provided
    if (input.contactId) {
      const contact = await db.select()
        .from(contactTable)
        .where(eq(contactTable.id, input.contactId))
      
      if (!contact.length) {
        throw new Error("Contact not found")
      }
    }
    
    const newInteraction = {
      id: uuidv4(),
      projectId: input.projectId,
      type: input.type,
      summary: input.summary,
      description: input.description,
      interactionDate: input.interactionDate,
      contactId: input.contactId,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: this.user.id,
    }

    const [createdInteraction] = await db.insert(interactionTable)
      .values(newInteraction)
      .returning()

    return createdInteraction
  }

  async update(id: string, input: UpdateInteractionInput) {
    this.authorize("write")
    
    // Verify contact exists if provided
    if (input.contactId) {
      const contact = await db.select()
        .from(contactTable)
        .where(eq(contactTable.id, input.contactId))
      
      if (!contact.length) {
        throw new Error("Contact not found")
      }
    }
    
    const [updatedInteraction] = await db.update(interactionTable)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(interactionTable.id, id))
      .returning()

    return updatedInteraction
  }

  async delete(id: string) {
    this.authorize("delete")
    
    await db.delete(interactionTable)
      .where(eq(interactionTable.id, id))
  }

  async getInteractionTypes(): Promise<InteractionType[]> {
    return ["meeting", "phone_call", "email", "site_visit", "document_shared", "milestone_update", "issue_reported", "other"]
  }

  async getProjectTimeline(projectId: string) {
    this.authorize("read")
    
    const interactions = await this.findByProject(projectId)
    
    // Group interactions by date
    const timeline = interactions.reduce((acc, item) => {
      const date = new Date(item.interaction.interactionDate).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(item)
      return acc
    }, {} as Record<string, typeof interactions>)
    
    return timeline
  }
}