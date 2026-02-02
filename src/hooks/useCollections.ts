import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { mockCollections } from "@/lib/mockData";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Collection = Tables<"collections"> & {
  business?: { id: string; name: string } | null;
  brand?: { id: string; name: string } | null;
  campaign?: { id: string; name: string } | null;
  asset_count?: number;
};

export type OwnerType = "campaign" | "brand" | "business" | "team" | "all";

interface UseCollectionsOptions {
  ownerType?: OwnerType;
  businessId?: string | null;
  brandId?: string | null;
  campaignId?: string | null;
}

export function useCollections(options: UseCollectionsOptions = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const { ownerType = "all", businessId, brandId, campaignId } = options;

  const {
    data: collections = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["collections", ownerType, businessId, brandId, campaignId, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("collections")
        .select(`
          *,
          business:businesses(id, name),
          brand:brands(id, name),
          campaign:campaigns(id, name)
        `)
        .order("created_at", { ascending: false });

      // Filter by owner type
      if (ownerType === "campaign") {
        query = query.not("campaign_id", "is", null);
      } else if (ownerType === "brand") {
        query = query.not("brand_id", "is", null);
      } else if (ownerType === "business") {
        query = query.not("business_id", "is", null);
      } else if (ownerType === "team") {
        query = query
          .is("campaign_id", null)
          .is("brand_id", null)
          .is("business_id", null);
      }

      // Filter by specific IDs
      if (businessId) {
        query = query.eq("business_id", businessId);
      }
      if (brandId) {
        query = query.eq("brand_id", brandId);
      }
      if (campaignId) {
        query = query.eq("campaign_id", campaignId);
      }

      // Search by name
      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Use mock data if no real data exists
      if (!data || data.length === 0) {
        return mockCollections as Collection[];
      }

      // Get asset counts for each collection
      const collectionsWithCounts = await Promise.all(
        (data || []).map(async (collection) => {
          const { count } = await supabase
            .from("collection_assets")
            .select("*", { count: "exact", head: true })
            .eq("collection_id", collection.id);

          return {
            ...collection,
            asset_count: count || 0,
          } as Collection;
        })
      );

      return collectionsWithCounts;
    },
    enabled: !!user,
  });

  const createCollectionMutation = useMutation({
    mutationFn: async (
      input: Omit<TablesInsert<"collections">, "created_by" | "team_id"> & { team_id: string }
    ) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("collections")
        .insert({
          ...input,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Collection created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create collection: " + error.message);
    },
  });

  const updateCollectionMutation = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: TablesUpdate<"collections"> & { id: string }) => {
      const { data, error } = await supabase
        .from("collections")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Collection updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update collection: " + error.message);
    },
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("collections").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Collection deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete collection: " + error.message);
    },
  });

  return {
    collections,
    isLoading,
    error,
    refetch,
    searchQuery,
    setSearchQuery,
    createCollection: createCollectionMutation.mutateAsync,
    updateCollection: updateCollectionMutation.mutateAsync,
    deleteCollection: deleteCollectionMutation.mutateAsync,
    isCreating: createCollectionMutation.isPending,
    isUpdating: updateCollectionMutation.isPending,
    isDeleting: deleteCollectionMutation.isPending,
  };
}
