import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { useBrand } from "@/contexts/BrandContext";
import { useToast } from "@/hooks/use-toast";
import { mockCampaigns } from "@/lib/mockData";
import type { Tables, TablesInsert, TablesUpdate, Enums } from "@/integrations/supabase/types";

export type Campaign = Tables<"campaigns">;
export type CampaignInsert = TablesInsert<"campaigns">;
export type CampaignUpdate = TablesUpdate<"campaigns">;
export type CampaignStatus = Enums<"campaign_status">;

export const CAMPAIGN_STATUS_CONFIG: Record<CampaignStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
  in_review: { label: "In Review", color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" },
  approved: { label: "Approved", color: "bg-blue-500/20 text-blue-700 dark:text-blue-400" },
  active: { label: "Active", color: "bg-green-500/20 text-green-700 dark:text-green-400" },
  paused: { label: "Paused", color: "bg-orange-500/20 text-orange-700 dark:text-orange-400" },
  completed: { label: "Completed", color: "bg-purple-500/20 text-purple-700 dark:text-purple-400" },
  archived: { label: "Archived", color: "bg-gray-500/20 text-gray-700 dark:text-gray-400" },
};

export function useCampaigns() {
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();
  const { currentBrand } = useBrand();
  const { toast } = useToast();
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    if (!user) {
      setCampaigns([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      // Filter by business if selected
      if (currentBusiness) {
        query = query.eq("business_id", currentBusiness.id);
      }

      // Filter by brand if selected
      if (currentBrand) {
        query = query.eq("brand_id", currentBrand.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      
      // Use mock data if no real data exists
      if (!data || data.length === 0) {
        setCampaigns(mockCampaigns as unknown as Campaign[]);
      } else {
        setCampaigns(data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch campaigns";
      setError(message);
      console.error("Error fetching campaigns:", err);
      // Fallback to mock data on error
      setCampaigns(mockCampaigns as unknown as Campaign[]);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentBusiness, currentBrand]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const createCampaign = async (campaign: Omit<CampaignInsert, "created_by" | "team_id">) => {
    if (!user) throw new Error("Not authenticated");

    // Get user's team
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
      .from("campaigns")
      .insert({
        ...campaign,
        created_by: user.id,
        team_id: teamMember.team_id,
      })
      .select()
      .single();

    if (error) throw error;

    toast({
      title: "Campaign created",
      description: `"${data.name}" has been created successfully.`,
    });

    await fetchCampaigns();
    return data;
  };

  const updateCampaign = async (id: string, updates: CampaignUpdate) => {
    const { data, error } = await supabase
      .from("campaigns")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    toast({
      title: "Campaign updated",
      description: "Campaign has been updated successfully.",
    });

    await fetchCampaigns();
    return data;
  };

  const deleteCampaign = async (id: string) => {
    const { error } = await supabase
      .from("campaigns")
      .delete()
      .eq("id", id);

    if (error) throw error;

    toast({
      title: "Campaign deleted",
      description: "Campaign has been deleted successfully.",
    });

    await fetchCampaigns();
  };

  const updateStatus = async (id: string, status: CampaignStatus) => {
    return updateCampaign(id, { status });
  };

  return {
    campaigns,
    isLoading,
    error,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    updateStatus,
  };
}
