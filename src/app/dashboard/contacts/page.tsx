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
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">
            Manage company contacts and their information
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