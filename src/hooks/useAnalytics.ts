import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTeamContext } from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";
import { subDays, format, startOfDay, eachDayOfInterval, eachWeekOfInterval } from "date-fns";

type DateRange = "7d" | "30d" | "90d";

interface AnalyticsData {
  downloads: { name: string; downloads: number }[];
  views: { name: string; views: number }[];
  assetDistribution: { name: string; value: number }[];
  topAssets: {
    id: string;
    name: string;
    downloads: number;
    views: number;
  }[];
  totals: {
    downloads: number;
    views: number;
    shares: number;
    storageBytes: number;
  };
}

export function useAnalytics(dateRange: DateRange = "7d") {
  const { currentTeamId } = useTeamContext();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const getDaysFromRange = (range: DateRange): number => {
    switch (range) {
      case "7d": return 7;
      case "30d": return 30;
      case "90d": return 90;
      default: return 7;
    }
  };

  const analyticsQuery = useQuery({
    queryKey: ["analytics", currentTeamId, dateRange],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!currentTeamId) {
        return {
          downloads: [],
          views: [],
          assetDistribution: [],
          topAssets: [],
          totals: { downloads: 0, views: 0, shares: 0, storageBytes: 0 },
        };
      }

      const days = getDaysFromRange(dateRange);
      const startDate = startOfDay(subDays(new Date(), days));

      // Get all analytics for the team's assets
      const { data: teamAssets } = await supabase
        .from("assets")
        .select("id")
        .eq("team_id", currentTeamId);

      const assetIds = teamAssets?.map((a) => a.id) || [];

      // Parallel queries
      const [analyticsRes, assetsRes] = await Promise.all([
        assetIds.length > 0
          ? supabase
              .from("asset_analytics")
              .select("*")
              .in("asset_id", assetIds)
              .gte("created_at", startDate.toISOString())
          : Promise.resolve({ data: [], error: null }),
        supabase
          .from("assets")
          .select("id, name, asset_type, file_size")
          .eq("team_id", currentTeamId),
      ]);

      const analytics = analyticsRes.data || [];
      const assets = assetsRes.data || [];

      // Calculate totals
      const totals = {
        downloads: analytics.filter((a) => a.action === "download").length,
        views: analytics.filter((a) => a.action === "view").length,
        shares: analytics.filter((a) => a.action === "share").length,
        storageBytes: assets.reduce((sum, a) => sum + (a.file_size || 0), 0),
      };

      // Downloads by day/week
      const downloadsByDate = new Map<string, number>();
      const viewsByDate = new Map<string, number>();

      if (days <= 7) {
        // Daily for 7 days
        const dateInterval = eachDayOfInterval({
          start: startDate,
          end: new Date(),
        });

        dateInterval.forEach((date) => {
          const key = format(date, "EEE");
          downloadsByDate.set(key, 0);
          viewsByDate.set(key, 0);
        });

        analytics.forEach((a) => {
          const key = format(new Date(a.created_at), "EEE");
          if (a.action === "download") {
            downloadsByDate.set(key, (downloadsByDate.get(key) || 0) + 1);
          } else if (a.action === "view") {
            viewsByDate.set(key, (viewsByDate.get(key) || 0) + 1);
          }
        });
      } else {
        // Weekly for 30/90 days
        const weekInterval = eachWeekOfInterval({
          start: startDate,
          end: new Date(),
        });

        weekInterval.forEach((date, i) => {
          const key = `Week ${i + 1}`;
          downloadsByDate.set(key, 0);
          viewsByDate.set(key, 0);
        });

        analytics.forEach((a) => {
          const weekIndex = Math.floor(
            (new Date(a.created_at).getTime() - startDate.getTime()) /
              (7 * 24 * 60 * 60 * 1000)
          );
          const key = `Week ${weekIndex + 1}`;
          if (a.action === "download") {
            downloadsByDate.set(key, (downloadsByDate.get(key) || 0) + 1);
          } else if (a.action === "view") {
            viewsByDate.set(key, (viewsByDate.get(key) || 0) + 1);
          }
        });
      }

      // Asset distribution by type
      const typeCounts = new Map<string, number>();
      assets.forEach((a) => {
        const type = a.asset_type || "other";
        typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
      });

      const typeLabels: Record<string, string> = {
        image: "Images",
        icon: "Icons",
        vector: "Vectors",
        design_file: "Design Files",
        brand_asset: "Brand Assets",
        other: "Other",
      };

      // Top assets by downloads
      const assetDownloads = new Map<string, number>();
      const assetViews = new Map<string, number>();

      analytics.forEach((a) => {
        if (a.action === "download") {
          assetDownloads.set(a.asset_id, (assetDownloads.get(a.asset_id) || 0) + 1);
        } else if (a.action === "view") {
          assetViews.set(a.asset_id, (assetViews.get(a.asset_id) || 0) + 1);
        }
      });

      const topAssets = assets
        .map((a) => ({
          id: a.id,
          name: a.name,
          downloads: assetDownloads.get(a.id) || 0,
          views: assetViews.get(a.id) || 0,
        }))
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, 5);

      return {
        downloads: Array.from(downloadsByDate.entries()).map(([name, downloads]) => ({
          name,
          downloads,
        })),
        views: Array.from(viewsByDate.entries()).map(([name, views]) => ({
          name,
          views,
        })),
        assetDistribution: Array.from(typeCounts.entries()).map(([type, value]) => ({
          name: typeLabels[type] || type,
          value,
        })),
        topAssets,
        totals,
      };
    },
    enabled: !!currentTeamId,
  });

  // Log analytics event
  const logEventMutation = useMutation({
    mutationFn: async ({
      assetId,
      action,
    }: {
      assetId: string;
      action: "view" | "download" | "share";
    }) => {
      const { error } = await supabase.from("asset_analytics").insert({
        asset_id: assetId,
        action,
        user_id: user?.id || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics", currentTeamId] });
    },
  });

  return {
    data: analyticsQuery.data || {
      downloads: [],
      views: [],
      assetDistribution: [],
      topAssets: [],
      totals: { downloads: 0, views: 0, shares: 0, storageBytes: 0 },
    },
    isLoading: analyticsQuery.isLoading,
    logEvent: logEventMutation.mutate,
  };
}

// Helper to format bytes
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
