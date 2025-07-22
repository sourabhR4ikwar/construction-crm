"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { ContactRepository, ContactRole } from "@/repo/contact/contact.repo"
import { CompanyRepository } from "@/repo/company/company.repo"
import { CreateContactUsecase } from "@/usecases/contact/createContact.usecase"
import { UpdateContactUsecase } from "@/usecases/contact/updateContact.usecase"
import { DeleteContactUsecase } from "@/usecases/contact/deleteContact.usecase"
import { ListContactsUsecase } from "@/usecases/contact/listContacts.usecase"
import { GetContactUsecase } from "@/usecases/contact/getContact.usecase"
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

export async function getContacts(filters?: { companyId?: string; role?: ContactRole; search?: string }) {
  const user = await getAuthenticatedUser()
  const contactRepo = new ContactRepository(user)
  const listContactsUsecase = new ListContactsUsecase(contactRepo)
  
  try {
    return await listContactsUsecase.execute(filters)
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to fetch contacts")
  }
}

export async function getContact(id: string) {
  const user = await getAuthenticatedUser()
  const contactRepo = new ContactRepository(user)
  const getContactUsecase = new GetContactUsecase(contactRepo)
  
  try {
    return await getContactUsecase.execute({ id })
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to fetch contact")
  }
}

export async function getCompaniesForSelect() {
  const user = await getAuthenticatedUser()
  const companyRepo = new CompanyRepository(user)
  
  try {
    const companies = await companyRepo.findAll()
    return companies.map(company => ({
      id: company.id,
      name: company.name,
      type: company.type,
    }))
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to fetch companies")
  }
}

export async function createContact(formData: FormData) {
  const user = await getAuthenticatedUser()
  const contactRepo = new ContactRepository(user)
  const companyRepo = new CompanyRepository(user)
  const createContactUsecase = new CreateContactUsecase(contactRepo, companyRepo)
  
  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string || undefined,
    role: formData.get("role") as ContactRole,
    title: formData.get("title") as string || undefined,
    department: formData.get("department") as string || undefined,
    notes: formData.get("notes") as string || undefined,
    companyId: formData.get("companyId") as string,
  }
  
  try {
    const result = await createContactUsecase.execute(data)
    revalidatePath("/dashboard/contacts")
    return { success: true, contact: result }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create contact" 
    }
  }
}

export async function updateContact(contactId: string, formData: FormData) {
  const user = await getAuthenticatedUser()
  const contactRepo = new ContactRepository(user)
  const companyRepo = new CompanyRepository(user)
  const updateContactUsecase = new UpdateContactUsecase(contactRepo, companyRepo)
  
  const data = {
    id: contactId,
    name: formData.get("name") as string || undefined,
    email: formData.get("email") as string || undefined,
    phone: formData.get("phone") as string || undefined,
    role: formData.get("role") as ContactRole || undefined,
    title: formData.get("title") as string || undefined,
    department: formData.get("department") as string || undefined,
    notes: formData.get("notes") as string || undefined,
    companyId: formData.get("companyId") as string || undefined,
  }
  
  // Remove undefined values
  Object.keys(data).forEach(key => {
    if (data[key as keyof typeof data] === undefined) {
      delete data[key as keyof typeof data]
    }
  })
  
  try {
    const result = await updateContactUsecase.execute(data)
    revalidatePath("/dashboard/contacts")
    return { success: true, contact: result }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update contact" 
    }
  }
}

export async function deleteContact(contactId: string) {
  const user = await getAuthenticatedUser()
  const contactRepo = new ContactRepository(user)
  const deleteContactUsecase = new DeleteContactUsecase(contactRepo)
  
  try {
    await deleteContactUsecase.execute({ id: contactId })
    revalidatePath("/dashboard/contacts")
    return { success: true, message: "Contact deleted successfully" }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete contact" 
    }
  }
}