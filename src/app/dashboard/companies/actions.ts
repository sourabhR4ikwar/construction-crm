"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { CompanyRepository, CompanyType } from "@/repo/company/company.repo"
import { CreateCompanyUsecase } from "@/usecases/company/createCompany.usecase"
import { UpdateCompanyUsecase } from "@/usecases/company/updateCompany.usecase"
import { DeleteCompanyUsecase } from "@/usecases/company/deleteCompany.usecase"
import { ListCompaniesUsecase } from "@/usecases/company/listCompanies.usecase"
import { GetCompanyUsecase } from "@/usecases/company/getCompany.usecase"
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

export async function getCompanies(filters?: { type?: CompanyType; search?: string }) {
  const user = await getAuthenticatedUser()
  const companyRepo = new CompanyRepository(user)
  const listCompaniesUsecase = new ListCompaniesUsecase(companyRepo)
  
  try {
    return await listCompaniesUsecase.execute(filters)
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to fetch companies")
  }
}

export async function getCompany(id: string) {
  const user = await getAuthenticatedUser()
  const companyRepo = new CompanyRepository(user)
  const getCompanyUsecase = new GetCompanyUsecase(companyRepo)
  
  try {
    return await getCompanyUsecase.execute({ id })
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to fetch company")
  }
}

export async function createCompany(formData: FormData) {
  const user = await getAuthenticatedUser()
  const companyRepo = new CompanyRepository(user)
  const createCompanyUsecase = new CreateCompanyUsecase(companyRepo)
  
  const data = {
    name: formData.get("name") as string,
    type: formData.get("type") as CompanyType,
    description: formData.get("description") as string || undefined,
    website: formData.get("website") as string || undefined,
    phone: formData.get("phone") as string || undefined,
    email: formData.get("email") as string || undefined,
    address: formData.get("address") as string || undefined,
    city: formData.get("city") as string || undefined,
    state: formData.get("state") as string || undefined,
    zipCode: formData.get("zipCode") as string || undefined,
    country: formData.get("country") as string || undefined,
  }
  
  try {
    const result = await createCompanyUsecase.execute(data)
    revalidatePath("/dashboard/companies")
    return { success: true, company: result }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create company" 
    }
  }
}

export async function updateCompany(companyId: string, formData: FormData) {
  const user = await getAuthenticatedUser()
  const companyRepo = new CompanyRepository(user)
  const updateCompanyUsecase = new UpdateCompanyUsecase(companyRepo)
  
  const data = {
    id: companyId,
    name: formData.get("name") as string || undefined,
    type: formData.get("type") as CompanyType || undefined,
    description: formData.get("description") as string || undefined,
    website: formData.get("website") as string || undefined,
    phone: formData.get("phone") as string || undefined,
    email: formData.get("email") as string || undefined,
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
    const result = await updateCompanyUsecase.execute(data)
    revalidatePath("/dashboard/companies")
    return { success: true, company: result }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update company" 
    }
  }
}

export async function deleteCompany(companyId: string) {
  const user = await getAuthenticatedUser()
  const companyRepo = new CompanyRepository(user)
  const deleteCompanyUsecase = new DeleteCompanyUsecase(companyRepo)
  
  try {
    await deleteCompanyUsecase.execute({ id: companyId })
    revalidatePath("/dashboard/companies")
    return { success: true, message: "Company deleted successfully" }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete company" 
    }
  }
}