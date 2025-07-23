import { Suspense } from "react"
import { SearchInterface } from "./search-interface"
import { getSearchFilters } from "./actions"
import { Skeleton } from "@/components/ui/skeleton"

export default async function SearchPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Search</h1>
          <p className="text-muted-foreground">
            Search across projects, contacts, companies, and documents
          </p>
        </div>
        
        <Suspense fallback={<SearchInterfaceSkeleton />}>
          <SearchInterfaceWrapper />
        </Suspense>
      </div>
    </div>
  )
}

async function SearchInterfaceWrapper() {
  const filtersResult = await getSearchFilters()
  
  if (!filtersResult.success) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load search filters</p>
      </div>
    )
  }

  return <SearchInterface availableFilters={filtersResult.data} />
}

function SearchInterfaceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}