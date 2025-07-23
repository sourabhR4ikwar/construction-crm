import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, PieChart } from "lucide-react";

interface ProjectChartsProps {
  projectsByStage: Array<{
    stage: string;
    count: number;
  }>;
  projectsByStatus: Array<{
    status: string;
    count: number;
  }>;
}

export function ProjectCharts({ projectsByStage, projectsByStatus }: ProjectChartsProps) {
  const getStageColor = (stage: string) => {
    switch (stage) {
      case "design":
        return "bg-blue-500";
      case "construction":
        return "bg-yellow-500";
      case "hand_off":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning":
        return "bg-purple-500";
      case "active":
        return "bg-green-500";
      case "on_hold":
        return "bg-orange-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatLabel = (label: string) => {
    return label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const totalStageProjects = projectsByStage.reduce((sum, stage) => sum + stage.count, 0);
  const totalStatusProjects = projectsByStatus.reduce((sum, status) => sum + status.count, 0);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Projects by Stage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Projects by Stage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectsByStage.map((stage) => {
              const percentage = totalStageProjects > 0 ? (stage.count / totalStageProjects) * 100 : 0;
              
              return (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {formatLabel(stage.stage)}
                    </span>
                    <span className="text-muted-foreground">
                      {stage.count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getStageColor(stage.stage)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Projects by Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Projects by Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectsByStatus.map((status) => {
              const percentage = totalStatusProjects > 0 ? (status.count / totalStatusProjects) * 100 : 0;
              
              return (
                <div key={status.status} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {formatLabel(status.status)}
                    </span>
                    <span className="text-muted-foreground">
                      {status.count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getStatusColor(status.status)}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}