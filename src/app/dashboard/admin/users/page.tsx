import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getUsers } from "./actions"
import { UsersTable } from "./users-table"
import { CreateUserDialog } from "./create-user-dialog"
import { UserRole } from "@/repo/base.repo"

export default async function UsersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const userRole = (session.user.role as UserRole) || "readonly"

  // Only admins can access user management
  if (userRole !== "admin") {
    redirect("/dashboard")
  }

  const usersPromise = getUsers()

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage users and their roles
          </p>
        </div>
        <CreateUserDialog />
      </div>

      <Suspense 
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        }
      >
        <UsersTable usersPromise={usersPromise} />
      </Suspense>
    </div>
  )
}