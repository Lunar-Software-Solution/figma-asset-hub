import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";
import { formatActivityMessage, getTimeAgo } from "@/hooks/useActivityLog";
import type { ActivityItem } from "@/hooks/useDashboardStats";

interface ActivityFeedCardProps {
  activity: ActivityItem[];
  loading: boolean;
}

export function ActivityFeedCard({ activity, loading }: ActivityFeedCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Activity</CardTitle>
        <CardDescription>Recent team activity</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : activity.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Activity will appear as your team works
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activity.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-primary">
                    {(item.profile?.full_name || item.profile?.email || "U")[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">
                      {item.profile?.full_name || item.profile?.email?.split("@")[0] || "User"}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {formatActivityMessage(item.action, item.entity_type, item.metadata)}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">{getTimeAgo(item.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
