import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, DollarSign, MapPin, FileText, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getProject, getProjectRoles, getProjectInteractions, getContacts } from "../actions"
import { ProjectRolesTab } from "./project-roles-tab"
import { ProjectInteractionsTab } from "./project-interactions-tab"
import { ProjectDocumentsTab } from "./documents/project-documents-tab"
import { ProjectStage } from "@/repo/project/project.repo"

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  let project
  try {
    project = await getProject(id)
  } catch (error) {
    notFound()
  }

  const projectRolesPromise = getProjectRoles(id)
  const projectInteractionsPromise = getProjectInteractions(id)
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
    <div className="space-y-8">
      {/* Back Button */}
      <div>
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>

      {/* Project Header */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">{project.title}</h1>
            <p className="text-sm text-muted-foreground">
              Created on {new Date(project.createdAt).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric', 
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
          <Badge 
            variant={getStageBadgeVariant(project.stage)} 
            className="text-sm px-3 py-1 font-medium self-start"
          >
            {getStageLabel(project.stage)}
          </Badge>
        </div>
        
        {project.description && (
          <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary/20">
            <p className="text-muted-foreground leading-relaxed">{project.description}</p>
          </div>
        )}

        {/* Project Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">Budget</CardTitle>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(project.budget)}
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">Start Date</CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-lg font-bold text-blue-900 dark:text-blue-100 leading-tight">
                {formatDate(project.startDate)}
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">End Date</CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-lg font-bold text-purple-900 dark:text-purple-100 leading-tight">
                {formatDate(project.endDate)}
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-300">Location</CardTitle>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                {(project.city || project.state) ? 
                  [project.city, project.state].filter(Boolean).join(", ") : 
                  "Not specified"
                }
              </div>
              {project.address && (
                <div className="text-xs text-orange-700/70 dark:text-orange-300/70 mt-1.5 leading-relaxed">
                  {project.address}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs for Roles, Interactions, and Documents */}
      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-lg">
          <TabsTrigger value="roles" className="data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium">
            Team & Roles
          </TabsTrigger>
          <TabsTrigger value="interactions" className="data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium">
            Activity & Timeline
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="roles" className="mt-6 space-y-6">
          <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
            <ProjectRolesTab 
              projectId={id}
              projectRolesPromise={projectRolesPromise}
              contactsPromise={contactsPromise}
            />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="interactions" className="mt-6 space-y-6">
          <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
            <ProjectInteractionsTab 
              projectId={id}
              projectInteractionsPromise={projectInteractionsPromise}
              contactsPromise={contactsPromise}
            />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="documents" className="mt-6 space-y-6">
          <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
            <ProjectDocumentsTab projectId={id} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}