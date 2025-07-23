"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchIcon, FilterIcon, SortAscIcon, SortDescIcon, FileTextIcon, UserIcon, BuildingIcon, FolderIcon } from "lucide-react"
import { SearchFilters } from "./search-filters"
import { SearchResults } from "./search-results"
import { performSearch } from "./actions"
import { SearchResponse, SearchResult } from "@/repo/search/search.repo"
import { GlobalSearchData } from "@/usecases/search/globalSearch.usecase"
import { useDebounce } from "@/hooks/use-debounce"
import { Skeleton } from "@/components/ui/skeleton"

interface SearchInterfaceProps {
  availableFilters: {
    projectStatuses: string[]
    projectStages: string[]
    companyTypes: string[]
    contactRoles: string[]
    documentTypes: string[]
  }
}

export function SearchInterface({ availableFilters }: SearchInterfaceProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Search state
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
  const [error, setError] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter state
  const [filters, setFilters] = useState<GlobalSearchData['filters']>({
    entityTypes: searchParams.get('entities')?.split(',') as any || undefined,
    projectStatus: searchParams.get('projectStatus')?.split(',') as any || undefined,
    projectStage: searchParams.get('projectStage')?.split(',') as any || undefined,
    companyTypes: searchParams.get('companyTypes')?.split(',') as any || undefined,
    contactRoles: searchParams.get('contactRoles')?.split(',') || undefined,
    documentTypes: searchParams.get('documentTypes')?.split(',') as any || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
  })
  
  // Search options
  const [options, setOptions] = useState<GlobalSearchData['options']>({
    sortBy: (searchParams.get('sortBy') as any) || 'relevance',
    sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    limit: parseInt(searchParams.get('limit') || '20'),
    offset: 0
  })

  const debouncedQuery = useDebounce(query, 300)

  // Update URL when search params change
  const updateURL = useCallback((newQuery: string, newFilters: any, newOptions: any) => {
    const params = new URLSearchParams()
    
    if (newQuery) params.set('q', newQuery)
    if (newFilters.entityTypes?.length) params.set('entities', newFilters.entityTypes.join(','))
    if (newFilters.projectStatus?.length) params.set('projectStatus', newFilters.projectStatus.join(','))
    if (newFilters.projectStage?.length) params.set('projectStage', newFilters.projectStage.join(','))
    if (newFilters.companyTypes?.length) params.set('companyTypes', newFilters.companyTypes.join(','))
    if (newFilters.contactRoles?.length) params.set('contactRoles', newFilters.contactRoles.join(','))
    if (newFilters.documentTypes?.length) params.set('documentTypes', newFilters.documentTypes.join(','))
    if (newFilters.dateFrom) params.set('dateFrom', newFilters.dateFrom)
    if (newFilters.dateTo) params.set('dateTo', newFilters.dateTo)
    if (newOptions.sortBy && newOptions.sortBy !== 'relevance') params.set('sortBy', newOptions.sortBy)
    if (newOptions.sortOrder && newOptions.sortOrder !== 'desc') params.set('sortOrder', newOptions.sortOrder)
    if (newOptions.limit && newOptions.limit !== 20) params.set('limit', newOptions.limit.toString())
    
    const url = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(url, { scroll: false })
  }, [pathname, router])

  // Perform search
  const handleSearch = useCallback(async (searchQuery?: string, searchFilters?: any, searchOptions?: any) => {
    const queryToUse = searchQuery ?? query
    const filtersToUse = searchFilters ?? filters
    const optionsToUse = searchOptions ?? options
    
    if (!queryToUse.trim()) {
      setSearchResults(null)
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      const result = await performSearch({
        query: queryToUse,
        filters: filtersToUse,
        options: { ...optionsToUse, offset: 0 } // Reset offset for new search
      })
      
      if (result.success) {
        setSearchResults(result.data)
        updateURL(queryToUse, filtersToUse, optionsToUse)
      } else {
        setError(result.error || 'Search failed')
        setSearchResults(null)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setSearchResults(null)
    } finally {
      setIsLoading(false)
    }
  }, [query, filters, options, updateURL])

  // Load more results (pagination)
  const loadMore = useCallback(async () => {
    if (!searchResults || isLoading || !searchResults.hasMore) return
    
    setIsLoading(true)
    
    try {
      const result = await performSearch({
        query,
        filters,
        options: {
          ...options,
          offset: searchResults.results.length
        }
      })
      
      if (result.success) {
        setSearchResults(prev => prev ? {
          ...result.data,
          results: [...prev.results, ...result.data.results]
        } : result.data)
      }
    } catch (err) {
      setError('Failed to load more results')
    } finally {
      setIsLoading(false)
    }
  }, [searchResults, isLoading, query, filters, options])


  // Search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      handleSearch(debouncedQuery)
    } else {
      setSearchResults(null)
    }
  }, [debouncedQuery, handleSearch])

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (filters.entityTypes?.length) count++
    if (filters.projectStatus?.length) count++
    if (filters.projectStage?.length) count++
    if (filters.companyTypes?.length) count++
    if (filters.contactRoles?.length) count++
    if (filters.documentTypes?.length) count++
    if (filters.dateFrom || filters.dateTo) count++
    return count
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'project': return <FileTextIcon className="h-4 w-4" />
      case 'contact': return <UserIcon className="h-4 w-4" />
      case 'company': return <BuildingIcon className="h-4 w-4" />
      case 'document': return <FolderIcon className="h-4 w-4" />
      default: return <FileTextIcon className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search projects, contacts, companies, and documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4 h-12 text-lg"
          />
        </div>
        
        {/* Filter and Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <FilterIcon className="h-4 w-4" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-1">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
          
          <div className="flex items-center gap-1">
            <Button
              variant={options.sortOrder === 'asc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                const newOptions = { ...options, sortOrder: 'asc' as const }
                setOptions(newOptions)
                handleSearch(undefined, undefined, newOptions)
              }}
            >
              <SortAscIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={options.sortOrder === 'desc' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                const newOptions = { ...options, sortOrder: 'desc' as const }
                setOptions(newOptions)
                handleSearch(undefined, undefined, newOptions)
              }}
            >
              <SortDescIcon className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Entity Type Quick Filters */}
          {(['projects', 'contacts', 'companies', 'documents'] as const).map((entityType) => (
            <Button
              key={entityType}
              variant={filters.entityTypes?.includes(entityType) ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                const currentTypes = filters.entityTypes || []
                const newTypes = currentTypes.includes(entityType)
                  ? currentTypes.filter(t => t !== entityType)
                  : [...currentTypes, entityType]
                
                const newFilters = {
                  ...filters,
                  entityTypes: newTypes.length === 0 ? undefined : newTypes
                }
                setFilters(newFilters)
                handleSearch(undefined, newFilters)
              }}
              className="gap-2"
            >
              {getEntityIcon(entityType)}
              {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <SearchFilters
          filters={filters}
          availableFilters={availableFilters}
          onFiltersChange={(newFilters) => {
            setFilters(newFilters)
            handleSearch(undefined, newFilters)
          }}
        />
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {query.trim() && (
        <SearchResults
          results={searchResults}
          isLoading={isLoading}
          onLoadMore={loadMore}
          query={query}
        />
      )}
    </div>
  )
}