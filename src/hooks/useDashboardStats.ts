import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTeamContext } from "@/contexts/TeamContext";

export interface DashboardStats {
  totalAssets: number;
  totalCollections: number;
  teamMembers: number;
  totalDownloads: number;
}

export interface RecentAsset {
  id: string;
  name: string;
  asset_type: string;
  created_at: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user_id: string;
  profile?: {
    full_name: string | null;
    email: string;
  } | null;
}

export function useDashboardStats() {
  const { currentTeamId } = useTeamContext();

  // Fetch aggregate stats
  const statsQuery = useQuery({
    queryKey: ["dashboard-stats", currentTeamId],
    queryFn: async (): Promise<DashboardStats> => {
      if (!currentTeamId) {
        return { totalAssets: 0, totalCollections: 0, teamMembers: 0, totalDownloads: 0 };
      }

      // Parallel queries for performance
      const [assetsRes, collectionsRes, membersRes, analyticsRes] = await Promise.all([
        supabase
          .from("assets")
          .select("id", { count: "exact", head: true })
          .eq("team_id", currentTeamId),
        supabase
          .from("collections")
          .select("id", { count: "exact", head: true })
          .eq("team_id", currentTeamId),
        supabase
          .from("team_members")
          .select("id", { count: "exact", head: true })
          .eq("team_id", currentTeamId),
        supabase
          .from("asset_analytics")
          .select("id", { count: "exact", head: true })
          .eq("action", "download"),
      ]);

      return {
        totalAssets: assetsRes.count || 0,
        totalCollections: collectionsRes.count || 0,
        teamMembers: membersRes.count || 0,
        totalDownloads: analyticsRes.count || 0,
      };
    },
    enabled: !!currentTeamId,
  });

  // Fetch recent assets
  const recentAssetsQuery = useQuery({
    queryKey: ["recent-assets", currentTeamId],
    queryFn: async (): Promise<RecentAsset[]> => {
      if (!currentTeamId) return [];

      const { data, error } = await supabase
        .from("assets")
        .select("id, name, asset_type, created_at")
        .eq("team_id", currentTeamId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTeamId,
  });

  // Fetch recent activity
  const activityQuery = useQuery({
    queryKey: ["recent-activity", currentTeamId],
    queryFn: async (): Promise<ActivityItem[]> => {
      if (!currentTeamId) return [];

      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .eq("team_id", currentTeamId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      // Get profiles for activity users
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((a) => a.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", userIds);

        return data.map((item) => ({
          ...item,
          metadata: item.metadata as Record<string, unknown> | null,
          profile: profiles?.find((p) => p.user_id === item.user_id) || null,
        }));
      }

      return [];
    },
    enabled: !!currentTeamId,
  });

  return {
    stats: statsQuery.data || {
      totalAssets: 0,
      totalCollections: 0,
      teamMembers: 0,
      totalDownloads: 0,
    },
    statsLoading: statsQuery.isLoading,
    recentAssets: recentAssetsQuery.data || [],
    recentAssetsLoading: recentAssetsQuery.isLoading,
    activity: activityQuery.data || [],
    activityLoading: activityQuery.isLoading,
  };
}
