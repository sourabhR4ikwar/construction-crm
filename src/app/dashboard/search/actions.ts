"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { SearchRepository } from "@/repo/search/search.repo"
import { GlobalSearchUsecase, GlobalSearchData } from "@/usecases/search/globalSearch.usecase"
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

export async function performSearch(data: GlobalSearchData) {
  try {
    const user = await getAuthenticatedUser()

    const searchRepo = new SearchRepository(user)
    const searchUsecase = new GlobalSearchUsecase(searchRepo)
    
    const results = await searchUsecase.execute(data)
    
    return { success: true, data: results }
  } catch (error) {
    console.error("Search error:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unexpected error occurred" 
    }
  }
}

export async function getSearchFilters() {
  try {
    const user = await getAuthenticatedUser()

    const searchRepo = new SearchRepository(user)
    const searchUsecase = new GlobalSearchUsecase(searchRepo)
    
    const filters = await searchUsecase.getAvailableFilters()
    
    return { success: true, data: filters }
  } catch (error) {
    console.error("Get search filters error:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unexpected error occurred" 
    }
  }
}

