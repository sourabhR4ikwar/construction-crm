import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { ROLE_LABELS, UserRole } from "@/lib/auth-utils"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const user = session.user
  const userRole = (user.role as UserRole) || "readonly"

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Welcome, {user.name || user.email}!
        </p>
        <p className="text-sm text-muted-foreground">
          Role: <span className="font-medium">{ROLE_LABELS[userRole]}</span>
        </p>
      </div>
      
      <DashboardClient userRole={userRole} />
    </div>
  )
}