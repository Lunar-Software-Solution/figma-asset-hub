import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type { UpcomingPost } from "@/hooks/useDashboardStats";

interface UpcomingPostsCardProps {
  posts: UpcomingPost[];
  loading: boolean;
}

const platformColors: Record<string, string> = {
  facebook: "bg-blue-500/10 text-blue-600",
  instagram: "bg-pink-500/10 text-pink-600",
  twitter: "bg-sky-500/10 text-sky-600",
  linkedin: "bg-blue-700/10 text-blue-700",
  tiktok: "bg-neutral-900/10 text-neutral-900 dark:bg-neutral-100/10 dark:text-neutral-100",
  pinterest: "bg-red-500/10 text-red-600",
  youtube: "bg-red-600/10 text-red-600",
  threads: "bg-neutral-800/10 text-neutral-800 dark:bg-neutral-200/10 dark:text-neutral-200",
  bluesky: "bg-sky-400/10 text-sky-500",
};

export function UpcomingPostsCard({ posts, loading }: UpcomingPostsCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Upcoming Posts</CardTitle>
          <CardDescription>Scheduled content ready to publish</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link to="/calendar">
            View calendar <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No upcoming posts</p>
            <Button size="sm" className="mt-4" asChild>
              <Link to="/calendar">Schedule a post</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-start gap-3 rounded-lg border border-border p-3"
              >
                <Badge
                  variant="secondary"
                  className={`${platformColors[post.platform] || ""} capitalize`}
                >
                  {post.platform}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {post.title || post.content.slice(0, 50)}
                  </p>
                  {post.campaign_name && (
                    <p className="text-xs text-muted-foreground truncate">
                      {post.campaign_name}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(post.scheduled_for), { addSuffix: true })}
                    <span className="text-muted-foreground/50 mx-1">•</span>
                    {format(new Date(post.scheduled_for), "MMM d, h:mm a")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
