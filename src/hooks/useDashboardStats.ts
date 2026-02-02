import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTeamContext } from "@/contexts/TeamContext";
import type { Database } from "@/integrations/supabase/types";

type CampaignStatus = Database["public"]["Enums"]["campaign_status"];
type SocialPlatform = Database["public"]["Enums"]["social_platform"];

export interface DashboardStats {
  totalAssets: number;
  totalCollections: number;
  teamMembers: number;
  totalDownloads: number;
  totalBusinesses: number;
  totalBrands: number;
  totalCampaigns: number;
  activeCampaigns: number;
  scheduledPosts: number;
  figmaConnected: boolean;
}

export interface RecentAsset {
  id: string;
  name: string;
  asset_type: string;
  created_at: string;
}

export interface RecentCampaign {
  id: string;
  name: string;
  status: CampaignStatus;
  start_date: string | null;
  end_date: string | null;
}

export interface UpcomingPost {
  id: string;
  title: string | null;
  content: string;
  scheduled_for: string;
  platform: SocialPlatform;
  campaign_name: string | null;
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
        return {
          totalAssets: 0,
          totalCollections: 0,
          teamMembers: 0,
          totalDownloads: 0,
          totalBusinesses: 0,
          totalBrands: 0,
          totalCampaigns: 0,
          activeCampaigns: 0,
          scheduledPosts: 0,
          figmaConnected: false,
        };
      }

      // Parallel queries for performance
      const [
        assetsRes,
        collectionsRes,
        membersRes,
        analyticsRes,
        businessesRes,
        brandsRes,
        campaignsRes,
        activeCampaignsRes,
        scheduledPostsRes,
        figmaRes,
      ] = await Promise.all([
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
        supabase
          .from("businesses")
          .select("id", { count: "exact", head: true })
          .eq("team_id", currentTeamId),
        supabase
          .from("brands")
          .select("id", { count: "exact", head: true })
          .eq("team_id", currentTeamId),
        supabase
          .from("campaigns")
          .select("id", { count: "exact", head: true })
          .eq("team_id", currentTeamId),
        supabase
          .from("campaigns")
          .select("id", { count: "exact", head: true })
          .eq("team_id", currentTeamId)
          .eq("status", "active"),
        supabase
          .from("campaign_posts")
          .select("id", { count: "exact", head: true })
          .eq("team_id", currentTeamId)
          .eq("status", "scheduled"),
        supabase
          .from("figma_connections")
          .select("id")
          .eq("team_id", currentTeamId)
          .maybeSingle(),
      ]);

      return {
        totalAssets: assetsRes.count || 0,
        totalCollections: collectionsRes.count || 0,
        teamMembers: membersRes.count || 0,
        totalDownloads: analyticsRes.count || 0,
        totalBusinesses: businessesRes.count || 0,
        totalBrands: brandsRes.count || 0,
        totalCampaigns: campaignsRes.count || 0,
        activeCampaigns: activeCampaignsRes.count || 0,
        scheduledPosts: scheduledPostsRes.count || 0,
        figmaConnected: !!figmaRes.data,
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

  // Fetch recent campaigns
  const recentCampaignsQuery = useQuery({
    queryKey: ["recent-campaigns", currentTeamId],
    queryFn: async (): Promise<RecentCampaign[]> => {
      if (!currentTeamId) return [];

      const { data, error } = await supabase
        .from("campaigns")
        .select("id, name, status, start_date, end_date")
        .eq("team_id", currentTeamId)
        .order("updated_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentTeamId,
  });

  // Fetch upcoming posts
  const upcomingPostsQuery = useQuery({
    queryKey: ["upcoming-posts", currentTeamId],
    queryFn: async (): Promise<UpcomingPost[]> => {
      if (!currentTeamId) return [];

      const { data, error } = await supabase
        .from("post_schedules")
        .select(`
          id,
          scheduled_for,
          platform,
          post:campaign_posts(
            id,
            title,
            content,
            campaign:campaigns(name)
          )
        `)
        .gte("scheduled_for", new Date().toISOString())
        .order("scheduled_for", { ascending: true })
        .limit(5);

      if (error) throw error;

      // Transform the data to flatten the structure
      return (data || []).map((schedule) => {
        const post = schedule.post as unknown as {
          id: string;
          title: string | null;
          content: string;
          campaign: { name: string } | null;
        } | null;

        return {
          id: schedule.id,
          scheduled_for: schedule.scheduled_for,
          platform: schedule.platform,
          title: post?.title || null,
          content: post?.content || "",
          campaign_name: post?.campaign?.name || null,
        };
      });
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

  const defaultStats: DashboardStats = {
    totalAssets: 0,
    totalCollections: 0,
    teamMembers: 0,
    totalDownloads: 0,
    totalBusinesses: 0,
    totalBrands: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    scheduledPosts: 0,
    figmaConnected: false,
  };

  return {
    stats: statsQuery.data || defaultStats,
    statsLoading: statsQuery.isLoading,
    recentAssets: recentAssetsQuery.data || [],
    recentAssetsLoading: recentAssetsQuery.isLoading,
    recentCampaigns: recentCampaignsQuery.data || [],
    recentCampaignsLoading: recentCampaignsQuery.isLoading,
    upcomingPosts: upcomingPostsQuery.data || [],
    upcomingPostsLoading: upcomingPostsQuery.isLoading,
    activity: activityQuery.data || [],
    activityLoading: activityQuery.isLoading,
  };
}
