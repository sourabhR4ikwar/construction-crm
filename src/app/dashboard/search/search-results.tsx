"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FileTextIcon, UserIcon, BuildingIcon, FolderIcon, ExternalLinkIcon } from "lucide-react"
import { SearchResponse } from "@/repo/search/search.repo"
import Link from "next/link"

interface SearchResultsProps {
  results: SearchResponse | null
  isLoading: boolean
  onLoadMore: () => void
  query: string
}

export function SearchResults({ results, isLoading, onLoadMore, query }: SearchResultsProps) {
  if (isLoading && !results) {
    return <SearchResultsSkeleton />
  }

  if (!results) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Enter a search query to get started
        </CardContent>
      </Card>
    )
  }

  if (results.results.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <div className="space-y-2">
            <p>No results found for "{query}"</p>
            <p className="text-sm">Try adjusting your search terms or filters</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'project': return <FileTextIcon className="h-5 w-5 text-blue-600" />
      case 'contact': return <UserIcon className="h-5 w-5 text-green-600" />
      case 'company': return <BuildingIcon className="h-5 w-5 text-purple-600" />
      case 'document': return <FolderIcon className="h-5 w-5 text-orange-600" />
      default: return <FileTextIcon className="h-5 w-5" />
    }
  }

  const getEntityLink = (result: any) => {
    switch (result.type) {
      case 'project':
        return `/dashboard/projects/${result.id}`
      case 'contact':
        return `/dashboard/contacts?highlight=${result.id}`
      case 'company':
        return `/dashboard/companies?highlight=${result.id}`
      case 'document':
        return `/dashboard/projects/${result.metadata?.projectId}/documents?highlight=${result.id}`
      default:
        return '#'
    }
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 rounded px-1">
          {part}
        </mark>
      ) : part
    )
  }

  return (
    <div className="space-y-4">
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {results.results.length} of {results.totalCount} results for "{query}"
        </p>
        
        {Object.keys(results.appliedFilters).length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filters applied:</span>
            <div className="flex gap-1">
              {results.appliedFilters.entityTypes?.map(type => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}
                </Badge>
              ))}
              {results.appliedFilters.projectStatus?.map(status => (
                <Badge key={status} variant="secondary" className="text-xs">
                  {status}
                </Badge>
              ))}
              {(results.appliedFilters.dateFrom || results.appliedFilters.dateTo) && (
                <Badge variant="secondary" className="text-xs">
                  Date filter
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {results.results.map((result) => (
          <Card key={`${result.type}-${result.id}`} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {getEntityIcon(result.type)}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">
                        {highlightText(result.title, query)}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {result.type}
                      </Badge>
                    </div>
                    
                    {result.subtitle && (
                      <CardDescription className="text-sm">
                        {highlightText(result.subtitle, query)}
                      </CardDescription>
                    )}
                  </div>
                </div>
                
                <Link href={getEntityLink(result)}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ExternalLinkIcon className="h-4 w-4" />
                    View
                  </Button>
                </Link>
              </div>
            </CardHeader>
            
            {result.description && (
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {highlightText(result.description, query)}
                </p>
              </CardContent>
            )}
            
            {/* Matched Fields */}
            {result.matchedFields.length > 0 && (
              <CardContent className="pt-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Matched in:</span>
                  <div className="flex gap-1">
                    {result.matchedFields.map(field => (
                      <Badge key={field} variant="secondary" className="text-xs">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
            
            {/* Metadata */}
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  Created {new Date(result.createdAt).toLocaleDateString()}
                </span>
                {result.updatedAt && (
                  <span>
                    Updated {new Date(result.updatedAt).toLocaleDateString()}
                  </span>
                )}
                {result.metadata?.createdBy && (
                  <span>
                    by {result.metadata.createdBy}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {results.hasMore && (
        <div className="text-center pt-4">
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Loading..." : "Load More Results"}
          </Button>
        </div>
      )}
    </div>
  )
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-64" />
      
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-5 w-5" />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}