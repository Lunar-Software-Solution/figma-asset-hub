import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Asset = Tables<"assets">;

type AssetType = "image" | "icon" | "vector" | "design_file" | "brand_asset" | "other";

interface UseAssetsOptions {
  collectionId?: string | null;
  brandId?: string | null;
  folderId?: string | null;
  assetType?: AssetType | "all" | null;
}

export function useAssets(options: UseAssetsOptions = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"updated" | "name" | "size" | "type">("updated");

  const { collectionId, brandId, folderId, assetType } = options;

  const {
    data: assets = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["assets", collectionId, brandId, folderId, assetType, searchQuery, sortBy],
    queryFn: async () => {
      let query = supabase.from("assets").select("*");

      // If filtering by collection, join through collection_assets
      if (collectionId) {
        const { data: collectionAssets, error: caError } = await supabase
          .from("collection_assets")
          .select("asset_id")
          .eq("collection_id", collectionId);

        if (caError) throw caError;

        const assetIds = collectionAssets?.map((ca) => ca.asset_id) || [];
        if (assetIds.length === 0) return [];

        query = query.in("id", assetIds);
      }

      // Filter by brand
      if (brandId) {
        query = query.eq("brand_id", brandId);
      }

      // Filter by folder
      if (folderId) {
        query = query.eq("folder_id", folderId);
      }

      // Filter by asset type
      if (assetType && assetType !== "all") {
        query = query.eq("asset_type", assetType as AssetType);
      }

      // Search by name
      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      // Sort
      switch (sortBy) {
        case "name":
          query = query.order("name", { ascending: true });
          break;
        case "size":
          query = query.order("file_size", { ascending: false });
          break;
        case "type":
          query = query.order("asset_type", { ascending: true });
          break;
        default:
          query = query.order("updated_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Asset[];
    },
    enabled: !!user,
  });

  const addToCollectionMutation = useMutation({
    mutationFn: async ({
      assetId,
      collectionId,
    }: {
      assetId: string;
      collectionId: string;
    }) => {
      const { error } = await supabase.from("collection_assets").insert({
        asset_id: assetId,
        collection_id: collectionId,
      });

      if (error) {
        if (error.code === "23505") {
          throw new Error("Asset is already in this collection");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Asset added to collection");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeFromCollectionMutation = useMutation({
    mutationFn: async ({
      assetId,
      collectionId,
    }: {
      assetId: string;
      collectionId: string;
    }) => {
      const { error } = await supabase
        .from("collection_assets")
        .delete()
        .eq("asset_id", assetId)
        .eq("collection_id", collectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Asset removed from collection");
    },
    onError: (error) => {
      toast.error("Failed to remove asset: " + error.message);
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("assets").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Asset deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete asset: " + error.message);
    },
  });

  return {
    assets,
    isLoading,
    error,
    refetch,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    addToCollection: addToCollectionMutation.mutateAsync,
    removeFromCollection: removeFromCollectionMutation.mutateAsync,
    deleteAsset: deleteAssetMutation.mutateAsync,
    isAddingToCollection: addToCollectionMutation.isPending,
    isRemovingFromCollection: removeFromCollectionMutation.isPending,
    isDeleting: deleteAssetMutation.isPending,
  };
}
