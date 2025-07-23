import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Phone, Mail, MapPin, FileText, Milestone, AlertTriangle, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface RecentActivitiesProps {
  activities: Array<{
    id: string;
    type: string;
    summary: string;
    projectTitle: string;
    interactionDate: Date;
    createdBy: string;
  }>;
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return Activity;
      case "phone_call":
        return Phone;
      case "email":
        return Mail;
      case "site_visit":
        return MapPin;
      case "document_shared":
        return FileText;
      case "milestone_update":
        return Milestone;
      case "issue_reported":
        return AlertTriangle;
      default:
        return MoreHorizontal;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "text-blue-600";
      case "phone_call":
        return "text-green-600";
      case "email":
        return "text-purple-600";
      case "site_visit":
        return "text-orange-600";
      case "document_shared":
        return "text-indigo-600";
      case "milestone_update":
        return "text-emerald-600";
      case "issue_reported":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const formatActivityType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activities</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const iconColor = getActivityColor(activity.type);
              
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full bg-muted ${iconColor}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">
                        {formatActivityType(activity.type)}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <Link
                        href="/dashboard/projects"
                        className="text-primary hover:underline truncate"
                      >
                        {activity.projectTitle}
                      </Link>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {activity.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{activity.createdBy}</span>
                      <span>•</span>
                      <span>
                        {formatDistanceToNow(activity.interactionDate, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}