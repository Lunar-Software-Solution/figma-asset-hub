import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate, Enums } from "@/integrations/supabase/types";

export type CampaignPost = Tables<"campaign_posts">;
export type CampaignPostInsert = TablesInsert<"campaign_posts">;
export type CampaignPostUpdate = TablesUpdate<"campaign_posts">;
export type PostStatus = Enums<"post_status">;
export type SocialPlatform = Enums<"social_platform">;

export type PostSchedule = Tables<"post_schedules">;
export type PostScheduleInsert = TablesInsert<"post_schedules">;
export type PostScheduleUpdate = TablesUpdate<"post_schedules">;

export type PostWithSchedules = CampaignPost & {
  post_schedules: PostSchedule[];
};

export const POST_STATUS_CONFIG: Record<PostStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
  pending_approval: { label: "Pending Approval", color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" },
  approved: { label: "Approved", color: "bg-blue-500/20 text-blue-700 dark:text-blue-400" },
  scheduled: { label: "Scheduled", color: "bg-purple-500/20 text-purple-700 dark:text-purple-400" },
  publishing: { label: "Publishing", color: "bg-orange-500/20 text-orange-700 dark:text-orange-400" },
  published: { label: "Published", color: "bg-green-500/20 text-green-700 dark:text-green-400" },
  failed: { label: "Failed", color: "bg-red-500/20 text-red-700 dark:text-red-400" },
};

export const PLATFORM_CONFIG: Record<SocialPlatform, { label: string; color: string }> = {
  facebook: { label: "Facebook", color: "bg-blue-600" },
  instagram: { label: "Instagram", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
  twitter: { label: "X (Twitter)", color: "bg-black dark:bg-white dark:text-black" },
  linkedin: { label: "LinkedIn", color: "bg-blue-700" },
  tiktok: { label: "TikTok", color: "bg-black" },
  pinterest: { label: "Pinterest", color: "bg-red-600" },
  youtube: { label: "YouTube", color: "bg-red-500" },
  threads: { label: "Threads", color: "bg-black" },
  bluesky: { label: "Bluesky", color: "bg-blue-400" },
};

export function useCampaignPosts(campaignId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<PostWithSchedules[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!user) {
      setPosts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("campaign_posts")
        .select("*, post_schedules(*)")
        .order("created_at", { ascending: false });

      if (campaignId) {
        query = query.eq("campaign_id", campaignId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setPosts((data as PostWithSchedules[]) || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch posts";
      setError(message);
      console.error("Error fetching posts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, campaignId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = async (post: Omit<CampaignPostInsert, "created_by" | "team_id">) => {
    if (!user) throw new Error("Not authenticated");

    const { data: teamMember, error: teamError } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (teamError || !teamMember) {
      throw new Error("No team found for user");
    }

    const { data, error } = await supabase
      .from("campaign_posts")
      .insert({
        ...post,
        created_by: user.id,
        team_id: teamMember.team_id,
      })
      .select("*, post_schedules(*)")
      .single();

    if (error) throw error;

    toast({
      title: "Post created",
      description: "Post has been created successfully.",
    });

    await fetchPosts();
    return data as PostWithSchedules;
  };

  const updatePost = async (id: string, updates: CampaignPostUpdate) => {
    const { data, error } = await supabase
      .from("campaign_posts")
      .update(updates)
      .eq("id", id)
      .select("*, post_schedules(*)")
      .single();

    if (error) throw error;

    toast({
      title: "Post updated",
      description: "Post has been updated successfully.",
    });

    await fetchPosts();
    return data as PostWithSchedules;
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase
      .from("campaign_posts")
      .delete()
      .eq("id", id);

    if (error) throw error;

    toast({
      title: "Post deleted",
      description: "Post has been deleted successfully.",
    });

    await fetchPosts();
  };

  const schedulePost = async (postId: string, schedule: Omit<PostScheduleInsert, "post_id">) => {
    const { data, error } = await supabase
      .from("post_schedules")
      .insert({
        ...schedule,
        post_id: postId,
      })
      .select()
      .single();

    if (error) throw error;

    // Update post status to scheduled
    await supabase
      .from("campaign_posts")
      .update({ status: "scheduled" })
      .eq("id", postId);

    toast({
      title: "Post scheduled",
      description: "Post has been scheduled successfully.",
    });

    await fetchPosts();
    return data;
  };

  const updateSchedule = async (scheduleId: string, updates: PostScheduleUpdate) => {
    const { data, error } = await supabase
      .from("post_schedules")
      .update(updates)
      .eq("id", scheduleId)
      .select()
      .single();

    if (error) throw error;

    toast({
      title: "Schedule updated",
      description: "Schedule has been updated successfully.",
    });

    await fetchPosts();
    return data;
  };

  const deleteSchedule = async (scheduleId: string) => {
    const { error } = await supabase
      .from("post_schedules")
      .delete()
      .eq("id", scheduleId);

    if (error) throw error;

    toast({
      title: "Schedule removed",
      description: "Schedule has been removed successfully.",
    });

    await fetchPosts();
  };

  return {
    posts,
    isLoading,
    error,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    schedulePost,
    updateSchedule,
    deleteSchedule,
  };
}
