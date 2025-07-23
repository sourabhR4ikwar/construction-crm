import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getProjects } from "./actions"
import { ProjectsTable } from "./projects-table"
import { CreateProjectDialog } from "./create-project-dialog"
import { ProjectFilters } from "./project-filters"
import { ProjectStage, ProjectStatus } from "@/repo/project/project.repo"

interface SearchParams {
  stage?: ProjectStage
  status?: ProjectStatus
  search?: string
  startDateFrom?: string
  startDateTo?: string
  budgetMin?: string
  budgetMax?: string
}

interface ProjectsPageProps {
  searchParams: SearchParams
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const filters = {
    stage: searchParams.stage,
    status: searchParams.status,
    search: searchParams.search,
    startDateFrom: searchParams.startDateFrom,
    startDateTo: searchParams.startDateTo,
    budgetMin: searchParams.budgetMin,
    budgetMax: searchParams.budgetMax,
  }

  const projectsPromise = getProjects(filters)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage your construction projects
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      <ProjectFilters initialFilters={filters} />

      <Suspense 
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        }
      >
        <ProjectsTable projectsPromise={projectsPromise} />
      </Suspense>
    </div>
  )
}