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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold mb-1 tracking-tight">Good morning, {user.name?.split(' ')[0] || user.email}</h1>
            <p className="text-base text-muted-foreground">
              Here&apos;s what&apos;s happening with your projects today.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Your role
            </p>
            <p className="text-sm font-medium">{ROLE_LABELS[userRole]}</p>
          </div>
        </div>
      </div>

      {/* KPI Overview Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 tracking-tight">Overview</h2>
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