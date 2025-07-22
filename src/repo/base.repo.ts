import { User } from "@/lib/auth"

export type UserRole = "admin" | "staff" | "readonly"

export abstract class BaseRepository {
  protected user: User | null

  constructor(user: User | null = null) {
    this.user = user
  }

  protected isAuthenticated(): boolean {
    return !!this.user
  }

  protected hasRole(allowedRoles: UserRole[]): boolean {
    if (!this.user) return false
    return allowedRoles.includes(this.user.role as UserRole)
  }

  protected isAdmin(): boolean {
    return this.hasRole(["admin"])
  }

  protected isStaff(): boolean {
    return this.hasRole(["admin", "staff"])
  }

  protected canRead(): boolean {
    return this.hasRole(["admin", "staff", "readonly"])
  }

  protected canWrite(): boolean {
    return this.hasRole(["admin", "staff"])
  }

  protected canDelete(): boolean {
    return this.hasRole(["admin"])
  }

  protected authorize(permission: "read" | "write" | "delete"): void {
    if (!this.isAuthenticated()) {
      throw new Error("Unauthorized: User not authenticated")
    }

    switch (permission) {
      case "read":
        if (!this.canRead()) {
          throw new Error("Unauthorized: Insufficient permissions for read access")
        }
        break
      case "write":
        if (!this.canWrite()) {
          throw new Error("Unauthorized: Insufficient permissions for write access")
        }
        break
      case "delete":
        if (!this.canDelete()) {
          throw new Error("Unauthorized: Insufficient permissions for delete access")
        }
        break
    }
  }
}