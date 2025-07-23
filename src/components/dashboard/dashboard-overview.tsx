import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "./stat-card";
import { UpcomingDeadlines } from "./upcoming-deadlines";
import { RecentActivities } from "./recent-activities";
import { ProjectCharts } from "./project-charts";
import { ExportDashboardData } from "./export-dashboard-data";
import { DashboardKPIs } from "@/repo/analytics/dashboard-analytics.repo";
import { 
  FolderOpen, 
  DollarSign, 
  TrendingUp, 
  Calendar
} from "lucide-react";

interface DashboardOverviewProps {
  kpis: DashboardKPIs;
}

export function DashboardOverview({ kpis }: DashboardOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid gap-6">
      {/* Export Actions */}
      <div className="flex justify-end">
        <ExportDashboardData kpis={kpis} />
      </div>

      {/* KPI Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Projects"
          value={kpis.activeProjectsCount}
          description="Currently in progress"
          icon={FolderOpen}
        />
        <StatCard
          title="Total Budget"
          value={formatCurrency(kpis.totalBudget)}
          description="Across all projects"
          icon={DollarSign}
        />
        <StatCard
          title="Average Budget"
          value={formatCurrency(kpis.budgetOverview.averageBudget)}
          description="Per project"
          icon={TrendingUp}
        />
        <StatCard
          title="Upcoming Deadlines"
          value={kpis.upcomingDeadlines.length}
          description="Next 30 days"
          icon={Calendar}
        />
      </div>

      {/* Charts Row */}
      <ProjectCharts
        projectsByStage={kpis.projectsByStage}
        projectsByStatus={kpis.projectsByStatus}
      />

      {/* Activities and Deadlines Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <RecentActivities activities={kpis.recentActivities} />
        <UpcomingDeadlines deadlines={kpis.upcomingDeadlines} />
      </div>
    </div>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <div className="grid gap-6">
      {/* KPI Stats Row Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Charts Row Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <div className="flex items-center gap-2 pb-4">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Activities and Deadlines Row Skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <div className="flex items-center gap-2 pb-4">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}