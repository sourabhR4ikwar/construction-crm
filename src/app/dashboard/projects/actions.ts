"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { ProjectRepository, ProjectStage, ProjectStatus, ProjectRole } from "@/repo/project/project.repo"
import { CreateProjectUsecase } from "@/usecases/project/createProject.usecase"
import { UpdateProjectUsecase } from "@/usecases/project/updateProject.usecase"
import { DeleteProjectUsecase } from "@/usecases/project/deleteProject.usecase"
import { ListProjectsUsecase } from "@/usecases/project/listProjects.usecase"
import { GetProjectUsecase } from "@/usecases/project/getProject.usecase"
import { AssignProjectRoleUsecase } from "@/usecases/project/assignProjectRole.usecase"
import { InteractionRepository, InteractionType } from "@/repo/interaction/interaction.repo"
import { CreateInteractionUsecase } from "@/usecases/interaction/createInteraction.usecase"
import { ListInteractionsUsecase } from "@/usecases/interaction/listInteractions.usecase"
import { GetProjectTimelineUsecase } from "@/usecases/interaction/getProjectTimeline.usecase"
import { ContactRepository } from "@/repo/contact/contact.repo"
import { ListContactsUsecase } from "@/usecases/contact/listContacts.usecase"
import { revalidatePath } from "next/cache"

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  
  return session.user
}

export async function getProjects(filters?: { 
  stage?: ProjectStage
  status?: ProjectStatus
  search?: string
  startDateFrom?: string
  startDateTo?: string
  budgetMin?: string
  budgetMax?: string
}) {
  const user = await getAuthenticatedUser()
  const projectRepo = new ProjectRepository(user)
  const listProjectsUsecase = new ListProjectsUsecase(projectRepo)
  
  try {
    return await listProjectsUsecase.execute(filters)
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to fetch projects")
  }
}

export async function getProject(id: string) {
  const user = await getAuthenticatedUser()
  const projectRepo = new ProjectRepository(user)
  const getProjectUsecase = new GetProjectUsecase(projectRepo)
  
  try {
    return await getProjectUsecase.execute({ id })
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to fetch project")
  }
}

export async function getProjectRoles(projectId: string) {
  const user = await getAuthenticatedUser()
  const projectRepo = new ProjectRepository(user)
  
  try {
    return await projectRepo.findProjectRoles(projectId)
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to fetch project roles")
  }
}

export async function createProject(formData: FormData) {
  const user = await getAuthenticatedUser()
  const projectRepo = new ProjectRepository(user)
  const createProjectUsecase = new CreateProjectUsecase(projectRepo)
  
  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string || undefined,
    budget: formData.get("budget") as string || undefined,
    startDate: formData.get("startDate") as string || undefined,
    endDate: formData.get("endDate") as string || undefined,
    stage: formData.get("stage") as ProjectStage,
    status: formData.get("status") as ProjectStatus,
    address: formData.get("address") as string || undefined,
    city: formData.get("city") as string || undefined,
    state: formData.get("state") as string || undefined,
    zipCode: formData.get("zipCode") as string || undefined,
    country: formData.get("country") as string || undefined,
  }
  
  try {
    const result = await createProjectUsecase.execute(data)
    revalidatePath("/dashboard/projects")
    return { success: true, project: result }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create project" 
    }
  }
}

export async function updateProject(projectId: string, formData: FormData) {
  const user = await getAuthenticatedUser()
  const projectRepo = new ProjectRepository(user)
  const updateProjectUsecase = new UpdateProjectUsecase(projectRepo)
  
  const data = {
    id: projectId,
    title: formData.get("title") as string || undefined,
    description: formData.get("description") as string || undefined,
    budget: formData.get("budget") as string || undefined,
    startDate: formData.get("startDate") as string || undefined,
    endDate: formData.get("endDate") as string || undefined,
    stage: formData.get("stage") as ProjectStage || undefined,
    status: formData.get("status") as ProjectStatus || undefined,
    address: formData.get("address") as string || undefined,
    city: formData.get("city") as string || undefined,
    state: formData.get("state") as string || undefined,
    zipCode: formData.get("zipCode") as string || undefined,
    country: formData.get("country") as string || undefined,
  }
  
  // Remove undefined values
  Object.keys(data).forEach(key => {
    if (data[key as keyof typeof data] === undefined) {
      delete data[key as keyof typeof data]
    }
  })
  
  try {
    const result = await updateProjectUsecase.execute(data)
    revalidatePath("/dashboard/projects")
    return { success: true, project: result }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update project" 
    }
  }
}

export async function deleteProject(projectId: string) {
  const user = await getAuthenticatedUser()
  const projectRepo = new ProjectRepository(user)
  const deleteProjectUsecase = new DeleteProjectUsecase(projectRepo)
  
  try {
    await deleteProjectUsecase.execute({ id: projectId })
    revalidatePath("/dashboard/projects")
    return { success: true, message: "Project deleted successfully" }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete project" 
    }
  }
}

export async function assignProjectRole(formData: FormData) {
  const user = await getAuthenticatedUser()
  const projectRepo = new ProjectRepository(user)
  const assignProjectRoleUsecase = new AssignProjectRoleUsecase(projectRepo)
  
  const data = {
    projectId: formData.get("projectId") as string,
    contactId: formData.get("contactId") as string,
    role: formData.get("role") as ProjectRole,
  }
  
  try {
    const result = await assignProjectRoleUsecase.execute(data)
    revalidatePath("/dashboard/projects")
    return { success: true, assignment: result }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to assign role" 
    }
  }
}

export async function removeProjectRole(projectId: string, assignmentId: string) {
  const user = await getAuthenticatedUser()
  const projectRepo = new ProjectRepository(user)
  
  try {
    await projectRepo.removeRole(projectId, assignmentId)
    revalidatePath("/dashboard/projects")
    return { success: true, message: "Role removed successfully" }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to remove role" 
    }
  }
}

export async function getProjectInteractions(projectId: string) {
  const user = await getAuthenticatedUser()
  const interactionRepo = new InteractionRepository(user)
  const listInteractionsUsecase = new ListInteractionsUsecase(interactionRepo)
  
  try {
    return await listInteractionsUsecase.execute({ projectId })
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to fetch interactions")
  }
}

export async function getProjectTimeline(projectId: string) {
  const user = await getAuthenticatedUser()
  const interactionRepo = new InteractionRepository(user)
  const getProjectTimelineUsecase = new GetProjectTimelineUsecase(interactionRepo)
  
  try {
    return await getProjectTimelineUsecase.execute({ projectId })
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to fetch timeline")
  }
}

export async function createProjectInteraction(formData: FormData) {
  const user = await getAuthenticatedUser()
  const interactionRepo = new InteractionRepository(user)
  const createInteractionUsecase = new CreateInteractionUsecase(interactionRepo)
  
  const data = {
    projectId: formData.get("projectId") as string,
    type: formData.get("type") as InteractionType,
    summary: formData.get("summary") as string,
    description: formData.get("description") as string || undefined,
    interactionDate: formData.get("interactionDate") as string,
    contactId: formData.get("contactId") as string || undefined,
  }
  
  try {
    const result = await createInteractionUsecase.execute(data)
    revalidatePath("/dashboard/projects")
    return { success: true, interaction: result }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create interaction" 
    }
  }
}

export async function getContacts() {
  const user = await getAuthenticatedUser()
  const contactRepo = new ContactRepository(user)
  const listContactsUsecase = new ListContactsUsecase(contactRepo)
  
  try {
    return await listContactsUsecase.execute()
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to fetch contacts")
  }
}