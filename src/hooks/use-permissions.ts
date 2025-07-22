"use client"

import { useSession } from "@/lib/auth-client"
import { UserRole } from "@/lib/auth-utils"

export function usePermissions() {
  const { data: session, isPending } = useSession()
  const user = session?.user
  const role = (user?.role as UserRole) || undefined

  return {
    user,
    role,
    isPending,
    isAuthenticated: !!user,
    isAdmin: role === "admin",
    isStaff: role === "admin" || role === "staff",
    canRead: !!user, // All authenticated users can read
    canWrite: role === "admin" || role === "staff",
    canDelete: role === "admin",
    canManageUsers: role === "admin",
  }
}