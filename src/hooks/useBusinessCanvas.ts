import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBrand } from "@/contexts/BrandContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export type CanvasBlockType =
  | "key_partners"
  | "key_activities"
  | "key_resources"
  | "value_propositions"
  | "customer_relationships"
  | "channels"
  | "customer_segments"
  | "cost_structure"
  | "revenue_streams";

export interface CanvasItem {
  id: string;
  canvas_id: string;
  block_type: CanvasBlockType;
  content: string;
  color: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessCanvas {
  id: string;
  brand_id: string;
  team_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useBusinessCanvas() {
  const { currentBrand } = useBrand();
  const { user } = useAuth();
  const [canvas, setCanvas] = useState<BusinessCanvas | null>(null);
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCanvas = useCallback(async () => {
    if (!currentBrand || !user) {
      setCanvas(null);
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch canvas for current brand
      const { data: canvasData, error: canvasError } = await supabase
        .from("business_canvases")
        .select("*")
        .eq("brand_id", currentBrand.id)
        .maybeSingle();

      if (canvasError) throw canvasError;

      if (canvasData) {
        setCanvas(canvasData as BusinessCanvas);

        // Fetch items for this canvas
        const { data: itemsData, error: itemsError } = await supabase
          .from("business_canvas_items")
          .select("*")
          .eq("canvas_id", canvasData.id)
          .order("position");

        if (itemsError) throw itemsError;
        setItems((itemsData || []) as CanvasItem[]);
      } else {
        setCanvas(null);
        setItems([]);
      }
    } catch (error) {
      console.error("Error fetching canvas:", error);
      toast({
        title: "Error",
        description: "Failed to load business canvas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentBrand, user]);

  useEffect(() => {
    fetchCanvas();
  }, [fetchCanvas]);

  const createCanvas = async () => {
    if (!currentBrand || !user) return null;

    try {
      const { data, error } = await supabase
        .from("business_canvases")
        .insert({
          brand_id: currentBrand.id,
          team_id: currentBrand.team_id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      setCanvas(data as BusinessCanvas);
      return data as BusinessCanvas;
    } catch (error) {
      console.error("Error creating canvas:", error);
      toast({
        title: "Error",
        description: "Failed to create canvas",
        variant: "destructive",
      });
      return null;
    }
  };

  const addItem = async (blockType: CanvasBlockType, content: string, color: string = "yellow") => {
    let targetCanvas = canvas;

    // Create canvas if it doesn't exist
    if (!targetCanvas) {
      targetCanvas = await createCanvas();
      if (!targetCanvas) return null;
    }

    try {
      const maxPosition = items
        .filter((i) => i.block_type === blockType)
        .reduce((max, i) => Math.max(max, i.position), -1);

      const { data, error } = await supabase
        .from("business_canvas_items")
        .insert({
          canvas_id: targetCanvas.id,
          block_type: blockType,
          content,
          color,
          position: maxPosition + 1,
        })
        .select()
        .single();

      if (error) throw error;

      setItems((prev) => [...prev, data as CanvasItem]);
      return data as CanvasItem;
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateItem = async (itemId: string, content: string) => {
    try {
      const { error } = await supabase
        .from("business_canvas_items")
        .update({ content })
        .eq("id", itemId);

      if (error) throw error;

      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, content } : item))
      );
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const updateItemColor = async (itemId: string, color: string) => {
    try {
      const { error } = await supabase
        .from("business_canvas_items")
        .update({ color })
        .eq("id", itemId);

      if (error) throw error;

      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, color } : item))
      );
    } catch (error) {
      console.error("Error updating item color:", error);
      toast({
        title: "Error",
        description: "Failed to update item color",
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("business_canvas_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const getItemsByBlock = (blockType: CanvasBlockType) => {
    return items.filter((item) => item.block_type === blockType);
  };

  return {
    canvas,
    items,
    isLoading,
    addItem,
    updateItem,
    updateItemColor,
    deleteItem,
    getItemsByBlock,
    refresh: fetchCanvas,
  };
}
