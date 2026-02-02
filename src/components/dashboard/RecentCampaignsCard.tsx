import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignStatusBadge } from "@/components/campaigns/CampaignStatusBadge";
import { ArrowRight, Megaphone } from "lucide-react";
import { format } from "date-fns";
import type { RecentCampaign } from "@/hooks/useDashboardStats";

interface RecentCampaignsCardProps {
  campaigns: RecentCampaign[];
  loading: boolean;
}

export function RecentCampaignsCard({ campaigns, loading }: RecentCampaignsCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Campaigns</CardTitle>
          <CardDescription>Your latest marketing campaigns</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link to="/campaigns">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-8">
            <Megaphone className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No campaigns yet</p>
            <Button size="sm" className="mt-4" asChild>
              <Link to="/campaigns">Create your first campaign</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                to={`/campaigns`}
                className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Megaphone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {campaign.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {campaign.start_date
                      ? format(new Date(campaign.start_date), "MMM d, yyyy")
                      : "No start date"}
                    {campaign.end_date && ` - ${format(new Date(campaign.end_date), "MMM d, yyyy")}`}
                  </p>
                </div>
                <CampaignStatusBadge status={campaign.status} />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
