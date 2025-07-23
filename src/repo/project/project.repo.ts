import { db } from "@/lib/db"
import { project as projectTable, projectRoleAssignment as projectRoleTable, contact as contactTable, company as companyTable } from "@/lib/db/schema"
import { eq, ilike, or, and, gte, lte } from "drizzle-orm"
import { BaseRepository } from "../base.repo"
import { v4 as uuidv4 } from 'uuid'

export type ProjectStage = "design" | "construction" | "hand_off"
export type ProjectStatus = "planning" | "active" | "on_hold" | "completed"
export type ProjectRole = "developer" | "client_stakeholder" | "contractor" | "architect_consultant" | "project_manager" | "supplier_vendor"

export interface CreateProjectInput {
  title: string
  description?: string
  budget?: string
  startDate?: string
  endDate?: string
  stage: ProjectStage
  status: ProjectStatus
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

export interface UpdateProjectInput {
  title?: string
  description?: string
  budget?: string
  startDate?: string
  endDate?: string
  stage?: ProjectStage
  status?: ProjectStatus
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

export interface ProjectFilters {
  stage?: ProjectStage
  status?: ProjectStatus
  search?: string
  startDateFrom?: string
  startDateTo?: string
  budgetMin?: string
  budgetMax?: string
}

export interface ProjectRoleAssignmentInput {
  contactId: string
  role: ProjectRole
}

export class ProjectRepository extends BaseRepository {
  async findAll(filters?: ProjectFilters) {
    this.authorize("read")
    
    let query = db.select().from(projectTable)
    
    const conditions = []
    
    if (filters?.stage) {
      conditions.push(eq(projectTable.stage, filters.stage))
    }
    
    if (filters?.status) {
      conditions.push(eq(projectTable.status, filters.status))
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          ilike(projectTable.title, `%${filters.search}%`),
          ilike(projectTable.description, `%${filters.search}%`),
          ilike(projectTable.address, `%${filters.search}%`),
          ilike(projectTable.city, `%${filters.search}%`)
        )
      )
    }
    
    if (filters?.startDateFrom) {
      conditions.push(gte(projectTable.startDate, filters.startDateFrom))
    }
    
    if (filters?.startDateTo) {
      conditions.push(lte(projectTable.startDate, filters.startDateTo))
    }
    
    if (filters?.budgetMin) {
      conditions.push(gte(projectTable.budget, filters.budgetMin))
    }
    
    if (filters?.budgetMax) {
      conditions.push(lte(projectTable.budget, filters.budgetMax))
    }
    
    if (conditions.length > 0) {
      query = query.where(
        conditions.length === 1 ? conditions[0] : and(...conditions)
      )
    }
    
    return await query.orderBy(projectTable.createdAt)
  }

  async findById(id: string) {
    this.authorize("read")
    
    const projects = await db.select()
      .from(projectTable)
      .where(eq(projectTable.id, id))
    
    return projects[0] || null
  }

  async findByTitle(title: string) {
    this.authorize("read")
    
    const projects = await db.select()
      .from(projectTable)
      .where(eq(projectTable.title, title))
    
    return projects[0] || null
  }

  async create(input: CreateProjectInput) {
    this.authorize("write")
    
    if (!this.user) {
      throw new Error("User must be authenticated to create projects")
    }
    
    const newProject = {
      id: uuidv4(),
      title: input.title,
      description: input.description,
      budget: input.budget,
      startDate: input.startDate,
      endDate: input.endDate,
      stage: input.stage,
      status: input.status,
      address: input.address,
      city: input.city,
      state: input.state,
      zipCode: input.zipCode,
      country: input.country,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: this.user.id,
    }

    const [createdProject] = await db.insert(projectTable)
      .values(newProject)
      .returning()

    return createdProject
  }

  async update(id: string, input: UpdateProjectInput) {
    this.authorize("write")
    
    const [updatedProject] = await db.update(projectTable)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(projectTable.id, id))
      .returning()

    return updatedProject
  }

  async delete(id: string) {
    this.authorize("delete")
    
    await db.delete(projectTable)
      .where(eq(projectTable.id, id))
  }

  async getProjectStages(): Promise<ProjectStage[]> {
    return ["design", "construction", "hand_off"]
  }

  async getProjectStatuses(): Promise<ProjectStatus[]> {
    return ["planning", "active", "on_hold", "completed"]
  }

  // Project Role Assignment Methods
  async findProjectRoles(projectId: string) {
    this.authorize("read")
    
    const roles = await db.select({
      id: projectRoleTable.id,
      projectId: projectRoleTable.projectId,
      contactId: projectRoleTable.contactId,
      role: projectRoleTable.role,
      assignedAt: projectRoleTable.assignedAt,
      contact: {
        id: contactTable.id,
        name: contactTable.name,
        email: contactTable.email,
        phone: contactTable.phone,
        title: contactTable.title,
        companyId: contactTable.companyId,
      },
      company: {
        id: companyTable.id,
        name: companyTable.name,
        type: companyTable.type,
      }
    })
    .from(projectRoleTable)
    .leftJoin(contactTable, eq(projectRoleTable.contactId, contactTable.id))
    .leftJoin(companyTable, eq(contactTable.companyId, companyTable.id))
    .where(eq(projectRoleTable.projectId, projectId))
    
    return roles
  }

  async assignRole(projectId: string, input: ProjectRoleAssignmentInput) {
    this.authorize("write")
    
    if (!this.user) {
      throw new Error("User must be authenticated to assign roles")
    }
    
    // Check if assignment already exists
    const existing = await db.select()
      .from(projectRoleTable)
      .where(
        and(
          eq(projectRoleTable.projectId, projectId),
          eq(projectRoleTable.contactId, input.contactId),
          eq(projectRoleTable.role, input.role)
        )
      )
    
    if (existing.length > 0) {
      throw new Error("This role assignment already exists")
    }
    
    const newAssignment = {
      id: uuidv4(),
      projectId,
      contactId: input.contactId,
      role: input.role,
      assignedAt: new Date(),
      assignedBy: this.user.id,
    }

    const [createdAssignment] = await db.insert(projectRoleTable)
      .values(newAssignment)
      .returning()

    return createdAssignment
  }

  async removeRole(projectId: string, assignmentId: string) {
    this.authorize("write")
    
    await db.delete(projectRoleTable)
      .where(
        and(
          eq(projectRoleTable.id, assignmentId),
          eq(projectRoleTable.projectId, projectId)
        )
      )
  }

  async updateRole(projectId: string, assignmentId: string, newRole: ProjectRole) {
    this.authorize("write")
    
    const [updatedAssignment] = await db.update(projectRoleTable)
      .set({ role: newRole })
      .where(
        and(
          eq(projectRoleTable.id, assignmentId),
          eq(projectRoleTable.projectId, projectId)
        )
      )
      .returning()

    return updatedAssignment
  }

  async getProjectRoles(): Promise<ProjectRole[]> {
    return ["developer", "client_stakeholder", "contractor", "architect_consultant", "project_manager", "supplier_vendor"]
  }
}