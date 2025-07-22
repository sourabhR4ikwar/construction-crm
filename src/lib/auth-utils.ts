import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { User } from "@/lib/auth"

export type UserRole = "admin" | "staff" | "readonly"

export async function getCurrentUser(): Promise<User | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  
  return session?.user || null
}

export function hasPermission(user: User | null, permission: "read" | "write" | "delete"): boolean {
  if (!user) return false
  
  const role = user.role as UserRole
  
  switch (permission) {
    case "read":
      return !!role && ["admin", "staff", "readonly"].includes(role)
    case "write":
      return !!role && ["admin", "staff"].includes(role)
    case "delete":
      return role === "admin"
    default:
      return false
  }
}

export function isAdmin(user: User | null): boolean {
  return user?.role === "admin"
}

export function isStaff(user: User | null): boolean {
  const role = user?.role as UserRole
  return ["admin", "staff"].includes(role)
}

export function canManageUsers(user: User | null): boolean {
  return isAdmin(user)
}

export function canEditRole(user: User | null, targetUserId: string): boolean {
  // Admins can edit roles, but not their own
  return isAdmin(user) && user.id !== targetUserId
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  staff: "Staff",
  readonly: "Read Only"
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Full access to all features and user management",
  staff: "Can create and edit content, but cannot manage users",
  readonly: "Can only view content"
}