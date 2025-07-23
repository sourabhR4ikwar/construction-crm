import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getContacts } from "./actions"
import { ContactsTable } from "./contacts-table"
import { CreateContactDialog } from "./create-contact-dialog"
import { ContactFilters } from "./contact-filters"
import { ContactRole } from "@/repo/contact/contact.repo"

interface SearchParams {
  companyId?: string
  role?: ContactRole
  search?: string
}

interface ContactsPageProps {
  searchParams: SearchParams
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const filters = {
    companyId: searchParams.companyId,
    role: searchParams.role,
    search: searchParams.search,
  }

  const contactsPromise = getContacts(filters)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
          <p className="text-sm text-muted-foreground">
            Manage contacts across all your projects
          </p>
        </div>
        <CreateContactDialog />
      </div>

      <ContactFilters initialFilters={filters} />

      <Suspense 
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        }
      >
        <ContactsTable contactsPromise={contactsPromise} />
      </Suspense>
    </div>
  )
}