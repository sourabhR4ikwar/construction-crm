"use client"

import { usePermissions } from "@/hooks/use-permissions"
import { UserRole } from "@/lib/auth-utils"

interface ProtectedProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  roles?: UserRole[]
  permission?: "read" | "write" | "delete"
}

export function Protected({ 
  children, 
  fallback = null, 
  roles,
  permission 
}: ProtectedProps) {
  const permissions = usePermissions()

  if (permissions.isPending) {
    return <div>Loading...</div>
  }

  let hasAccess = false

  if (roles) {
    hasAccess = !!permissions.role && roles.includes(permissions.role)
  } else if (permission) {
    switch (permission) {
      case "read":
        hasAccess = permissions.canRead
        break
      case "write":
        hasAccess = permissions.canWrite
        break
      case "delete":
        hasAccess = permissions.canDelete
        break
    }
  } else {
    hasAccess = permissions.isAuthenticated
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}