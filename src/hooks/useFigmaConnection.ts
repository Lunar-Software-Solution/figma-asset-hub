import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface FigmaConnection {
  id: string;
  team_id: string;
  figma_user_id: string;
  figma_email: string | null;
  connected_at: string;
}

interface FigmaFile {
  key: string;
  name: string;
  thumbnail_url?: string;
  last_modified: string;
}

export function useFigmaConnection(teamId: string | null) {
  const { user } = useAuth();
  const [connection, setConnection] = useState<FigmaConnection | null>(null);
  const [files, setFiles] = useState<FigmaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const fetchConnection = useCallback(async () => {
    if (!teamId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("figma_connections")
        .select("id, team_id, figma_user_id, figma_email, connected_at")
        .eq("team_id", teamId)
        .maybeSingle();

      if (error) throw error;
      setConnection(data);
    } catch (error) {
      console.error("Error fetching Figma connection:", error);
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  // Check for OAuth callback result
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("figma_connected") === "true") {
      toast.success("Figma connected successfully!");
      fetchConnection();
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
    const error = params.get("error");
    if (error) {
      toast.error(error);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [fetchConnection]);

  const [isConnecting, setIsConnecting] = useState(false);

  const connect = async (token: string) => {
    if (!teamId || !user) {
      toast.error("You must be logged in and have a team selected");
      return;
    }

    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("figma-connect", {
        body: { teamId, token },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success("Figma connected successfully!");
      fetchConnection();
    } catch (error: any) {
      console.error("Error connecting Figma:", error);
      toast.error(error.message || "Failed to connect to Figma");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    if (!teamId) return;

    try {
      const { error } = await supabase.functions.invoke("figma-disconnect", {
        body: { teamId },
      });

      if (error) throw error;

      setConnection(null);
      setFiles([]);
      toast.success("Figma disconnected");
    } catch (error: any) {
      console.error("Error disconnecting Figma:", error);
      toast.error(error.message || "Failed to disconnect");
    }
  };

  const fetchFiles = async () => {
    if (!teamId || !connection) return;

    setIsLoadingFiles(true);
    try {
      const { data, error } = await supabase.functions.invoke("figma-files", {
        body: { teamId },
      });

      if (error) throw error;
      setFiles(data.files || []);
    } catch (error: any) {
      console.error("Error fetching Figma files:", error);
      toast.error(error.message || "Failed to fetch files");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const importFileByUrl = async (figmaUrl: string) => {
    if (!teamId || !connection) return null;

    // Extract file key from Figma URL
    // Formats: https://www.figma.com/file/KEY/... or https://www.figma.com/design/KEY/...
    const match = figmaUrl.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
    if (!match) {
      toast.error("Invalid Figma URL. Please paste a valid Figma file URL.");
      return null;
    }

    const fileKey = match[1];
    setIsLoadingFiles(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("figma-files", {
        body: { teamId, fileKey },
      });

      if (error) throw error;
      
      if (data.files && data.files.length > 0) {
        // Add the new file to the list (avoid duplicates)
        setFiles((prev) => {
          const exists = prev.some((f) => f.key === data.files[0].key);
          if (exists) {
            return prev;
          }
          return [...data.files, ...prev];
        });
        toast.success(`Imported "${data.files[0].name}" from Figma`);
        return data.files[0];
      }
      return null;
    } catch (error: any) {
      console.error("Error importing Figma file:", error);
      toast.error(error.message || "Failed to import file");
      return null;
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (connection) {
      fetchFiles();
    }
  }, [connection]);

  return {
    connection,
    files,
    isLoading,
    isLoadingFiles,
    isConnecting,
    connect,
    disconnect,
    refreshFiles: fetchFiles,
    importFileByUrl,
  };
}
