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

  const connect = async () => {
    if (!teamId || !user) {
      toast.error("You must be logged in and have a team selected");
      return;
    }

    try {
      const state = btoa(JSON.stringify({
        team_id: teamId,
        user_id: user.id,
        redirect_url: window.location.origin + "/figma-hub",
      }));

      const { data, error } = await supabase.functions.invoke("figma-auth", {
        body: {
          redirectUri: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/figma-callback`,
          state,
        },
      });

      if (error) throw error;

      // Redirect to Figma OAuth
      window.location.href = data.authUrl;
    } catch (error: any) {
      console.error("Error initiating Figma auth:", error);
      toast.error(error.message || "Failed to connect to Figma");
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
    connect,
    disconnect,
    refreshFiles: fetchFiles,
  };
}
