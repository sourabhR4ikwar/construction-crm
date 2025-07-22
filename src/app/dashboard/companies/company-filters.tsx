"use client"

import { useState } from "react"
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
import { CompanyType } from "@/repo/company/company.repo"

interface CompanyFiltersProps {
  initialFilters?: { type?: CompanyType; search?: string }
}

export function CompanyFilters({ initialFilters }: CompanyFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialFilters?.search || "")
  const [type, setType] = useState<CompanyType | "all">(initialFilters?.type || "all")

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (search.trim()) {
      params.set("search", search.trim())
    } else {
      params.delete("search")
    }
    
    if (type !== "all") {
      params.set("type", type)
    } else {
      params.delete("type")
    }
    
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setSearch("")
    setType("all")
    router.push(pathname)
  }

  const hasActiveFilters = search.trim() !== "" || type !== "all"

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search & Filter Companies
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search by name, description, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="type">Company Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as CompanyType | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="contractor">Contractor</SelectItem>
                <SelectItem value="architect_consultant">Architect/Consultant</SelectItem>
                <SelectItem value="supplier_vendor">Supplier/Vendor</SelectItem>
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