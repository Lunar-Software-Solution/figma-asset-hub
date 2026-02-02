import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Clock, Images } from "lucide-react";
import { getTimeAgo } from "@/hooks/useActivityLog";
import type { RecentAsset } from "@/hooks/useDashboardStats";

interface RecentAssetsCardProps {
  assets: RecentAsset[];
  loading: boolean;
}

export function RecentAssetsCard({ assets, loading }: RecentAssetsCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Assets</CardTitle>
          <CardDescription>Your recently uploaded or modified assets</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link to="/assets">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-8">
            <Images className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No assets yet</p>
            <Button size="sm" className="mt-4" asChild>
              <Link to="/assets">Upload your first asset</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center gap-4 rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                  <Images className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {asset.name}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {asset.asset_type.replace("_", " ")}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {getTimeAgo(asset.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
