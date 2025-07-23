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
import { Search, X, Filter } from "lucide-react"
import { ProjectStage } from "@/repo/project/project.repo"

interface ProjectFiltersProps {
  initialFilters?: { 
    stage?: ProjectStage
    search?: string
    startDateFrom?: string
    startDateTo?: string
    budgetMin?: string
    budgetMax?: string
  }
}

export function ProjectFilters({ initialFilters }: ProjectFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialFilters?.search || "")
  const [stage, setStage] = useState<ProjectStage | "all">(initialFilters?.stage || "all")
  const [startDateFrom, setStartDateFrom] = useState(initialFilters?.startDateFrom || "")
  const [startDateTo, setStartDateTo] = useState(initialFilters?.startDateTo || "")
  const [budgetMin, setBudgetMin] = useState(initialFilters?.budgetMin || "")
  const [budgetMax, setBudgetMax] = useState(initialFilters?.budgetMax || "")

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (search.trim()) {
      params.set("search", search.trim())
    } else {
      params.delete("search")
    }
    
    if (stage !== "all") {
      params.set("stage", stage)
    } else {
      params.delete("stage")
    }
    
    if (startDateFrom) {
      params.set("startDateFrom", startDateFrom)
    } else {
      params.delete("startDateFrom")
    }
    
    if (startDateTo) {
      params.set("startDateTo", startDateTo)
    } else {
      params.delete("startDateTo")
    }
    
    if (budgetMin) {
      params.set("budgetMin", budgetMin)
    } else {
      params.delete("budgetMin")
    }
    
    if (budgetMax) {
      params.set("budgetMax", budgetMax)
    } else {
      params.delete("budgetMax")
    }
    
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setSearch("")
    setStage("all")
    setStartDateFrom("")
    setStartDateTo("")
    setBudgetMin("")
    setBudgetMax("")
    router.push(pathname)
  }

  const hasActiveFilters = search.trim() !== "" || stage !== "all" || startDateFrom !== "" || startDateTo !== "" || budgetMin !== "" || budgetMax !== ""

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Search & Filter Projects
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search by title, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="stage">Project Stage</Label>
            <Select value={stage} onValueChange={(value) => setStage(value as ProjectStage | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="All stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="construction">Construction</SelectItem>
                <SelectItem value="hand_off">Hand-off</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="startDateFrom">Start Date From</Label>
            <Input
              id="startDateFrom"
              type="date"
              value={startDateFrom}
              onChange={(e) => setStartDateFrom(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="startDateTo">Start Date To</Label>
            <Input
              id="startDateTo"
              type="date"
              value={startDateTo}
              onChange={(e) => setStartDateTo(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="budgetMin">Min Budget</Label>
            <Input
              id="budgetMin"
              type="number"
              placeholder="0"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="budgetMax">Max Budget</Label>
            <Input
              id="budgetMax"
              type="number"
              placeholder="1000000"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Button onClick={handleApplyFilters} className="flex-1 md:flex-none">
            <Search className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleClearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}