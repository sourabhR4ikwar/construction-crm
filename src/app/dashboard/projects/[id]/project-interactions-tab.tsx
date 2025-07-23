"use client"

import { use, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Calendar, User, MessageSquare } from "lucide-react"
import { AddInteractionDialog } from "./add-interaction-dialog"
import { InteractionType } from "@/repo/interaction/interaction.repo"

interface ProjectInteraction {
  interaction: {
    id: string
    projectId: string
    type: InteractionType
    summary: string
    description: string | null
    interactionDate: Date
    contactId: string | null
    createdAt: Date
    updatedAt: Date
    createdBy: string
  }
  project: {
    id: string
    title: string
  } | null
  contact: {
    id: string
    name: string
    email: string
  } | null
}

interface Contact {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  title: string | null
  department: string | null
  notes: string | null
  companyId: string
  createdAt: Date
  updatedAt: Date
}

interface ProjectInteractionsTabProps {
  projectId: string
  projectInteractionsPromise: Promise<ProjectInteraction[]>
  contactsPromise: Promise<Contact[]>
}

export function ProjectInteractionsTab({ 
  projectId, 
  projectInteractionsPromise, 
  contactsPromise 
}: ProjectInteractionsTabProps) {
  const interactions = use(projectInteractionsPromise)
  const contacts = use(contactsPromise)
  const [addInteractionOpen, setAddInteractionOpen] = useState(false)

  const getInteractionBadgeVariant = (type: InteractionType) => {
    switch (type) {
      case "meeting":
        return "default"
      case "phone_call":
        return "secondary"
      case "email":
        return "outline"
      case "site_visit":
        return "destructive"
      case "document_shared":
        return "default"
      case "milestone_update":
        return "secondary"
      case "issue_reported":
        return "destructive"
      case "other":
        return "outline"
      default:
        return "outline"
    }
  }

  const getInteractionLabel = (type: InteractionType) => {
    switch (type) {
      case "meeting":
        return "Meeting"
      case "phone_call":
        return "Phone Call"
      case "email":
        return "Email"
      case "site_visit":
        return "Site Visit"
      case "document_shared":
        return "Document Shared"
      case "milestone_update":
        return "Milestone Update"
      case "issue_reported":
        return "Issue Reported"
      case "other":
        return "Other"
      default:
        return type
    }
  }

  const getInteractionIcon = (type: InteractionType) => {
    switch (type) {
      case "meeting":
        return "👥"
      case "phone_call":
        return "📞"
      case "email":
        return "📧"
      case "site_visit":
        return "🏗️"
      case "document_shared":
        return "📄"
      case "milestone_update":
        return "🎯"
      case "issue_reported":
        return "⚠️"
      case "other":
        return "💬"
      default:
        return "💬"
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Group interactions by date
  const groupedInteractions = interactions.reduce((groups, item) => {
    const date = formatDate(item.interaction.interactionDate)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
    return groups
  }, {} as Record<string, ProjectInteraction[]>)

  // Sort dates in descending order
  const sortedDates = Object.keys(groupedInteractions).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>
                Track all interactions, meetings, and activities for this project
              </CardDescription>
            </div>
            <Button onClick={() => setAddInteractionOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Activity
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Timeline */}
      <div className="space-y-6">
        {sortedDates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No activities yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start documenting project activities by adding your first interaction.
              </p>
              <Button onClick={() => setAddInteractionOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Activity
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedDates.map((date) => (
            <div key={date} className="space-y-4">
              {/* Date Header */}
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {date}
              </div>

              {/* Interactions for this date */}
              <div className="space-y-3 ml-6 border-l-2 border-muted pl-6">
                {groupedInteractions[date].map((item) => (
                  <Card key={item.interaction.id} className="relative">
                    <div className="absolute -left-8 top-4 w-4 h-4 bg-background border-2 border-muted-foreground rounded-full" />
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {getInteractionIcon(item.interaction.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={getInteractionBadgeVariant(item.interaction.type)}>
                                {getInteractionLabel(item.interaction.type)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatTime(item.interaction.interactionDate)}
                              </span>
                            </div>
                            <h4 className="font-semibold">{item.interaction.summary}</h4>
                          </div>
                        </div>
                        
                        {item.contact && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {getInitials(item.contact.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{item.contact.name}</span>
                          </div>
                        )}
                      </div>
                      
                      {item.interaction.description && (
                        <p className="text-muted-foreground text-sm">
                          {item.interaction.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Interaction Dialog */}
      <AddInteractionDialog
        projectId={projectId}
        contacts={contacts}
        open={addInteractionOpen}
        onClose={() => setAddInteractionOpen(false)}
      />
    </div>
  )
}