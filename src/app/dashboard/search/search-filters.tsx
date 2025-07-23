"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { XIcon } from "lucide-react"
import { GlobalSearchData } from "@/usecases/search/globalSearch.usecase"

interface SearchFiltersProps {
  filters: GlobalSearchData['filters']
  availableFilters: {
    projectStatuses: string[]
    projectStages: string[]
    companyTypes: string[]
    contactRoles: string[]
    documentTypes: string[]
  }
  onFiltersChange: (filters: GlobalSearchData['filters']) => void
}

export function SearchFilters({ filters, availableFilters, onFiltersChange }: SearchFiltersProps) {
  const updateFilter = (key: keyof typeof filters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const toggleArrayFilter = (key: keyof typeof filters, value: string) => {
    const currentArray = (filters[key] as string[]) || []
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    
    updateFilter(key, newArray.length === 0 ? undefined : newArray)
  }

  const clearAllFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => 
      value !== undefined && value !== null && (
        Array.isArray(value) ? value.length > 0 : true
      )
    )
  }

  const formatFilterLabel = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Search Filters</CardTitle>
            <CardDescription>
              Narrow down your search results with specific criteria
            </CardDescription>
          </div>
          
          {hasActiveFilters() && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              <XIcon className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Date Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Date Range</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="dateFrom" className="text-xs text-muted-foreground">From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => updateFilter('dateFrom', e.target.value || undefined)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dateTo" className="text-xs text-muted-foreground">To</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => updateFilter('dateTo', e.target.value || undefined)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Project Status */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Project Status</Label>
          <div className="flex flex-wrap gap-2">
            {availableFilters.projectStatuses.map((status) => (
              <Badge
                key={status}
                variant={filters.projectStatus?.includes(status as any) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => toggleArrayFilter('projectStatus', status)}
              >
                {formatFilterLabel(status)}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Project Stage */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Project Stage</Label>
          <div className="flex flex-wrap gap-2">
            {availableFilters.projectStages.map((stage) => (
              <Badge
                key={stage}
                variant={filters.projectStage?.includes(stage as any) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => toggleArrayFilter('projectStage', stage)}
              >
                {formatFilterLabel(stage)}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Company Types */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Company Types</Label>
          <div className="flex flex-wrap gap-2">
            {availableFilters.companyTypes.map((type) => (
              <Badge
                key={type}
                variant={filters.companyTypes?.includes(type as any) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => toggleArrayFilter('companyTypes', type)}
              >
                {formatFilterLabel(type)}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Contact Roles */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Contact Roles</Label>
          <div className="flex flex-wrap gap-2">
            {availableFilters.contactRoles.map((role) => (
              <Badge
                key={role}
                variant={filters.contactRoles?.includes(role) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => toggleArrayFilter('contactRoles', role)}
              >
                {formatFilterLabel(role)}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Document Types */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Document Types</Label>
          <div className="flex flex-wrap gap-2">
            {availableFilters.documentTypes.map((type) => (
              <Badge
                key={type}
                variant={filters.documentTypes?.includes(type as any) ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80"
                onClick={() => toggleArrayFilter('documentTypes', type)}
              >
                {formatFilterLabel(type)}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}