import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { useBrand } from "@/contexts/BrandContext";
import { useToast } from "@/hooks/use-toast";
import { mockStrategicInitiatives } from "@/lib/mockData";
import type { Tables, TablesInsert, TablesUpdate, Enums } from "@/integrations/supabase/types";

export type StrategicInitiative = Tables<"strategic_initiatives">;
export type InitiativeInsert = TablesInsert<"strategic_initiatives">;
export type InitiativeUpdate = TablesUpdate<"strategic_initiatives">;
export type InitiativeStatus = Enums<"initiative_status">;
export type InitiativePriority = Enums<"initiative_priority">;

export const INITIATIVE_STATUS_CONFIG: Record<InitiativeStatus, { label: string; color: string }> = {
  planning: { label: "Planning", color: "bg-blue-500/20 text-blue-700 dark:text-blue-400" },
  in_progress: { label: "In Progress", color: "bg-green-500/20 text-green-700 dark:text-green-400" },
  on_hold: { label: "On Hold", color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" },
  completed: { label: "Completed", color: "bg-purple-500/20 text-purple-700 dark:text-purple-400" },
  cancelled: { label: "Cancelled", color: "bg-gray-500/20 text-gray-700 dark:text-gray-400" },
};

export const INITIATIVE_PRIORITY_CONFIG: Record<InitiativePriority, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-gray-500/20 text-gray-700 dark:text-gray-400" },
  medium: { label: "Medium", color: "bg-blue-500/20 text-blue-700 dark:text-blue-400" },
  high: { label: "High", color: "bg-orange-500/20 text-orange-700 dark:text-orange-400" },
  critical: { label: "Critical", color: "bg-red-500/20 text-red-700 dark:text-red-400" },
};

export function useStrategicInitiatives() {
  const { user } = useAuth();
  const { currentBusiness } = useBusiness();
  const { currentBrand } = useBrand();
  const { toast } = useToast();
  
  const [initiatives, setInitiatives] = useState<StrategicInitiative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInitiatives = useCallback(async () => {
    if (!user) {
      setInitiatives([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("strategic_initiatives")
        .select("*")
        .order("created_at", { ascending: false });

      if (currentBusiness) {
        query = query.eq("business_id", currentBusiness.id);
      }

      if (currentBrand) {
        query = query.eq("brand_id", currentBrand.id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      
      if (!data || data.length === 0) {
        setInitiatives(mockStrategicInitiatives as unknown as StrategicInitiative[]);
      } else {
        setInitiatives(data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch initiatives";
      setError(message);
      console.error("Error fetching initiatives:", err);
      setInitiatives(mockStrategicInitiatives as unknown as StrategicInitiative[]);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentBusiness, currentBrand]);

  useEffect(() => {
    fetchInitiatives();
  }, [fetchInitiatives]);

  const createInitiative = async (initiative: Omit<InitiativeInsert, "created_by" | "team_id">) => {
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
      .from("strategic_initiatives")
      .insert({
        ...initiative,
        created_by: user.id,
        team_id: teamMember.team_id,
      })
      .select()
      .single();

    if (error) throw error;

    toast({
      title: "Initiative created",
      description: `"${data.name}" has been created successfully.`,
    });

    await fetchInitiatives();
    return data;
  };

  const updateInitiative = async (id: string, updates: InitiativeUpdate) => {
    const { data, error } = await supabase
      .from("strategic_initiatives")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    toast({
      title: "Initiative updated",
      description: "Initiative has been updated successfully.",
    });

    await fetchInitiatives();
    return data;
  };

  const deleteInitiative = async (id: string) => {
    const { error } = await supabase
      .from("strategic_initiatives")
      .delete()
      .eq("id", id);

    if (error) throw error;

    toast({
      title: "Initiative deleted",
      description: "Initiative has been deleted successfully.",
    });

    await fetchInitiatives();
  };

  const updateStatus = async (id: string, status: InitiativeStatus) => {
    return updateInitiative(id, { status });
  };

  const updatePriority = async (id: string, priority: InitiativePriority) => {
    return updateInitiative(id, { priority });
  };

  return {
    initiatives,
    isLoading,
    error,
    fetchInitiatives,
    createInitiative,
    updateInitiative,
    deleteInitiative,
    updateStatus,
    updatePriority,
  };
}
