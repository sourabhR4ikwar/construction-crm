import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface UpcomingDeadlinesProps {
  deadlines: Array<{
    id: string;
    title: string;
    endDate: Date;
    status: string;
    stage: string;
  }>;
}

export function UpcomingDeadlines({ deadlines }: UpcomingDeadlinesProps) {
  const getStageColor = (stage: string) => {
    switch (stage) {
      case "design":
        return "bg-blue-100 text-blue-800";
      case "construction":
        return "bg-yellow-100 text-yellow-800";
      case "hand_off":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDaysUntilDeadline = (endDate: Date) => {
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deadlines.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
        ) : (
          <div className="space-y-3">
            {deadlines.map((deadline) => {
              const daysUntil = getDaysUntilDeadline(deadline.endDate);
              const isUrgent = daysUntil <= 7;
              
              return (
                <Link
                  key={deadline.id}
                  href={`/dashboard/projects/${deadline.id}`}
                  className="block hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {isUrgent && (
                          <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                        )}
                        <p className="text-sm font-medium truncate">
                          {deadline.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStageColor(
                            deadline.stage
                          )}`}
                        >
                          {deadline.stage.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(deadline.endDate, "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p
                        className={`text-xs font-medium ${
                          isUrgent ? "text-red-600" : "text-muted-foreground"
                        }`}
                      >
                        {daysUntil === 0
                          ? "Today"
                          : daysUntil === 1
                          ? "1 day"
                          : `${daysUntil} days`}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}