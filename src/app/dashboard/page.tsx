import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { ROLE_LABELS, UserRole } from "@/lib/auth-utils"
import { Suspense, use } from "react"
import { getDashboardKPIs } from "./actions"
import { DashboardOverview, DashboardOverviewSkeleton } from "@/components/dashboard/dashboard-overview"

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
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Welcome, {user.name || user.email}!
        </p>
        <p className="text-sm text-muted-foreground">
          Role: <span className="font-medium">{ROLE_LABELS[userRole]}</span>
        </p>
      </div>

      {/* KPI Overview Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Project Overview</h2>
        <Suspense fallback={<DashboardOverviewSkeleton />}>
          <DashboardOverviewContent />
        </Suspense>
      </div>
    </>
  )
}

function DashboardOverviewContent() {
  const kpis = use(getDashboardKPIs())
  return <DashboardOverview kpis={kpis} />
}