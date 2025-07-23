import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getCompanies } from "./actions"
import { CompaniesTable } from "./companies-table"
import { CreateCompanyDialog } from "./create-company-dialog"
import { CompanyFilters } from "./company-filters"
import { CompanyType } from "@/repo/company/company.repo"

interface SearchParams {
  type?: CompanyType
  search?: string
}

interface CompaniesPageProps {
  searchParams: SearchParams
}

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const filters = {
    type: searchParams.type,
    search: searchParams.search,
  }

  const companiesPromise = getCompanies(filters)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
          <p className="text-sm text-muted-foreground">
            Manage your contractors and business partners
          </p>
        </div>
        <CreateCompanyDialog />
      </div>

      <CompanyFilters initialFilters={filters} />

      <Suspense 
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        }
      >
        <CompaniesTable companiesPromise={companiesPromise} />
      </Suspense>
    </div>
  )
}