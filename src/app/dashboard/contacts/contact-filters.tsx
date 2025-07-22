"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, X } from "lucide-react"
import { ContactRole } from "@/repo/contact/contact.repo"
import { getCompaniesForSelect } from "./actions"

interface ContactFiltersProps {
  initialFilters?: { companyId?: string; role?: ContactRole; search?: string }
}

interface Company {
  id: string
  name: string
  type: string
}

export function ContactFilters({ initialFilters }: ContactFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(initialFilters?.search || "")
  const [role, setRole] = useState<ContactRole | "all">(initialFilters?.role || "all")
  const [companyId, setCompanyId] = useState<string>(initialFilters?.companyId || "all")
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companiesData = await getCompaniesForSelect()
        setCompanies(companiesData)
      } catch (error) {
        console.error("Failed to fetch companies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (search.trim()) {
      params.set("search", search.trim())
    } else {
      params.delete("search")
    }
    
    if (role !== "all") {
      params.set("role", role)
    } else {
      params.delete("role")
    }

    if (companyId !== "all") {
      params.set("companyId", companyId)
    } else {
      params.delete("companyId")
    }
    
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setSearch("")
    setRole("all")
    setCompanyId("all")
    router.push(pathname)
  }

  const hasActiveFilters = search.trim() !== "" || role !== "all" || companyId !== "all"

  const getRoleLabel = (role: ContactRole) => {
    switch (role) {
      case "primary_contact":
        return "Primary Contact"
      case "project_manager":
        return "Project Manager"
      case "technical_lead":
        return "Technical Lead"
      case "finance_contact":
        return "Finance Contact"
      case "sales_contact":
        return "Sales Contact"
      case "support_contact":
        return "Support Contact"
      case "executive":
        return "Executive"
      case "other":
        return "Other"
      default:
        return role
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search & Filter Contacts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search by name, email, title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="company">Company</Label>
            <Select 
              value={companyId} 
              onValueChange={(value) => setCompanyId(value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading..." : "All companies"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as ContactRole | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="primary_contact">Primary Contact</SelectItem>
                <SelectItem value="project_manager">Project Manager</SelectItem>
                <SelectItem value="technical_lead">Technical Lead</SelectItem>
                <SelectItem value="finance_contact">Finance Contact</SelectItem>
                <SelectItem value="sales_contact">Sales Contact</SelectItem>
                <SelectItem value="support_contact">Support Contact</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={handleApplyFilters} className="flex-1">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}