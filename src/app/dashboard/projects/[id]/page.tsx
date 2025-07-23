import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, DollarSign, MapPin, FileText } from "lucide-react"
import { getProject, getProjectRoles, getProjectInteractions, getContacts } from "../actions"
import { ProjectRolesTab } from "./project-roles-tab"
import { ProjectInteractionsTab } from "./project-interactions-tab"
import { ProjectStage } from "@/repo/project/project.repo"

interface ProjectDetailPageProps {
  params: { id: string }
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  let project
  try {
    project = await getProject(params.id)
  } catch (error) {
    notFound()
  }

  const projectRolesPromise = getProjectRoles(params.id)
  const projectInteractionsPromise = getProjectInteractions(params.id)
  const contactsPromise = getContacts()

  const getStageBadgeVariant = (stage: ProjectStage) => {
    switch (stage) {
      case "design":
        return "outline"
      case "construction":
        return "default"
      case "hand_off":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStageLabel = (stage: ProjectStage) => {
    switch (stage) {
      case "design":
        return "Design"
      case "construction":
        return "Construction"
      case "hand_off":
        return "Hand-off"
      default:
        return stage
    }
  }

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "Not specified"
    const num = parseFloat(amount)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not specified"
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="container mx-auto py-10">
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-muted-foreground">
              Created on {new Date(project.createdAt).toLocaleDateString('en-US')}
            </p>
          </div>
          <Badge variant={getStageBadgeVariant(project.stage)} className="text-sm">
            {getStageLabel(project.stage)}
          </Badge>
        </div>
        
        {project.description && (
          <p className="text-muted-foreground mb-6">{project.description}</p>
        )}

        {/* Project Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(project.budget)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Start Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDate(project.startDate)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">End Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDate(project.endDate)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Location</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {(project.city || project.state) ? 
                  [project.city, project.state].filter(Boolean).join(", ") : 
                  "Not specified"
                }
              </div>
              {project.address && (
                <div className="text-xs text-muted-foreground mt-1">{project.address}</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs for Roles and Interactions */}
      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles">Team & Roles</TabsTrigger>
          <TabsTrigger value="interactions">Activity & Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="roles" className="space-y-4">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <ProjectRolesTab 
              projectId={params.id}
              projectRolesPromise={projectRolesPromise}
              contactsPromise={contactsPromise}
            />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="interactions" className="space-y-4">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <ProjectInteractionsTab 
              projectId={params.id}
              projectInteractionsPromise={projectInteractionsPromise}
              contactsPromise={contactsPromise}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}