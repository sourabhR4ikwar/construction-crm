"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { UserRepository } from "@/repo/user/user.repo"
import { CreateUserUsecase, createUserSchema } from "@/usecases/user/createUser.usecase"
import { UpdateUserUsecase, updateUserSchema } from "@/usecases/user/updateUser.usecase"
import { DeleteUserUsecase } from "@/usecases/user/deleteUser.usecase"
import { UpdateUserRoleUsecase, updateUserRoleSchema } from "@/usecases/user/updateUserRole.usecase"
import { ListUsersUsecase } from "@/usecases/user/listUsers.usecase"
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

export async function getUsers() {
  const user = await getAuthenticatedUser()
  const userRepo = new UserRepository(user)
  const listUsersUsecase = new ListUsersUsecase(userRepo)
  
  try {
    return await listUsersUsecase.execute()
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to fetch users")
  }
}

export async function createUser(formData: FormData) {
  const user = await getAuthenticatedUser()
  const userRepo = new UserRepository(user)
  const createUserUsecase = new CreateUserUsecase(userRepo)
  
  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    role: formData.get("role") as "admin" | "staff" | "readonly",
  }
  
  try {
    const result = await createUserUsecase.execute(data)
    revalidatePath("/dashboard/admin/users")
    return { success: true, user: result }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create user" 
    }
  }
}

export async function updateUser(userId: string, formData: FormData) {
  const user = await getAuthenticatedUser()
  const userRepo = new UserRepository(user)
  const updateUserUsecase = new UpdateUserUsecase(userRepo)
  
  const data = {
    name: formData.get("name") as string || undefined,
    email: formData.get("email") as string || undefined,
    role: formData.get("role") as "admin" | "staff" | "readonly" || undefined,
  }
  
  // Remove undefined values
  Object.keys(data).forEach(key => {
    if (data[key as keyof typeof data] === undefined) {
      delete data[key as keyof typeof data]
    }
  })
  
  try {
    const result = await updateUserUsecase.execute(userId, data)
    revalidatePath("/dashboard/admin/users")
    return { success: true, user: result }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update user" 
    }
  }
}

export async function deleteUser(userId: string) {
  const user = await getAuthenticatedUser()
  const userRepo = new UserRepository(user)
  const deleteUserUsecase = new DeleteUserUsecase(userRepo)
  
  try {
    const result = await deleteUserUsecase.execute(userId)
    revalidatePath("/dashboard/admin/users")
    return { success: true, message: result.message }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete user" 
    }
  }
}

export async function updateUserRole(userId: string, role: "admin" | "staff" | "readonly") {
  const user = await getAuthenticatedUser()
  const userRepo = new UserRepository(user)
  const updateUserRoleUsecase = new UpdateUserRoleUsecase(userRepo)
  
  try {
    const result = await updateUserRoleUsecase.execute(userId, { role })
    revalidatePath("/dashboard/admin/users")
    return { success: true, user: result }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update user role" 
    }
  }
}