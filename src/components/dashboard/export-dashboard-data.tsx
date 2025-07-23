"use client"

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { DashboardKPIs } from "@/repo/analytics/dashboard-analytics.repo";

interface ExportDashboardDataProps {
  kpis: DashboardKPIs;
}

export function ExportDashboardData({ kpis }: ExportDashboardDataProps) {
  const exportToCSV = () => {
    const data = [
      ["Metric", "Value"],
      ["Active Projects Count", kpis.activeProjectsCount.toString()],
      ["Total Budget", kpis.totalBudget.toString()],
      ["Average Budget", kpis.budgetOverview.averageBudget.toString()],
      ["Upcoming Deadlines Count", kpis.upcomingDeadlines.length.toString()],
      [""],
      ["Projects by Stage", ""],
      ...kpis.projectsByStage.map(stage => [
        stage.stage.replace('_', ' '),
        stage.count.toString()
      ]),
      [""],
      ["Projects by Status", ""],
      ...kpis.projectsByStatus.map(status => [
        status.status.replace('_', ' '),
        status.count.toString()
      ]),
      [""],
      ["Budget by Stage", ""],
      ...kpis.budgetOverview.budgetByStage.map(budget => [
        budget.stage.replace('_', ' '),
        budget.totalBudget.toString()
      ]),
    ];

    const csvContent = data.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `dashboard-kpis-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportUpcomingDeadlines = () => {
    const data = [
      ["Project ID", "Project Title", "End Date", "Status", "Stage", "Days Until Deadline"],
      ...kpis.upcomingDeadlines.map(deadline => {
        const daysUntil = Math.ceil((deadline.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return [
          deadline.id,
          deadline.title,
          deadline.endDate.toISOString().split('T')[0],
          deadline.status,
          deadline.stage,
          daysUntil.toString()
        ];
      })
    ];

    const csvContent = data.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `upcoming-deadlines-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportRecentActivities = () => {
    const data = [
      ["Activity ID", "Project Title", "Activity Type", "Summary", "Date", "Created By"],
      ...kpis.recentActivities.map(activity => [
        activity.id,
        activity.projectTitle,
        activity.type.replace('_', ' '),
        activity.summary.replace(/,/g, ';'), // Replace commas to avoid CSV issues
        activity.interactionDate.toISOString().split('T')[0],
        activity.createdBy
      ])
    ];

    const csvContent = data.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `recent-activities-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <Button 
        onClick={exportToCSV} 
        variant="outline" 
        size="sm"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Export KPIs
      </Button>
      <Button 
        onClick={exportUpcomingDeadlines} 
        variant="outline" 
        size="sm"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Export Deadlines
      </Button>
      <Button 
        onClick={exportRecentActivities} 
        variant="outline" 
        size="sm"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Export Activities
      </Button>
    </div>
  );
}