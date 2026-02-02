import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamContext } from "@/contexts/TeamContext";
import type { Json } from "@/integrations/supabase/types";

type EntityType = "asset" | "collection" | "campaign" | "team_member" | "brand" | "business";
type Action = "created" | "updated" | "deleted" | "uploaded" | "invited" | "removed" | "role_changed" | "approved" | "commented";

interface LogActivityParams {
  action: Action;
  entityType: EntityType;
  entityId: string;
  metadata?: Json;
}

export function useActivityLog() {
  const { user } = useAuth();
  const { currentTeamId } = useTeamContext();
  const queryClient = useQueryClient();

  const logActivityMutation = useMutation({
    mutationFn: async ({ action, entityType, entityId, metadata }: LogActivityParams) => {
      if (!user || !currentTeamId) {
        throw new Error("User or team not available");
      }

      const { error } = await supabase.from("activity_log").insert([{
        team_id: currentTeamId,
        user_id: user.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata: metadata ?? null,
      }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recent-activity", currentTeamId] });
    },
  });

  return {
    logActivity: logActivityMutation.mutate,
    isLogging: logActivityMutation.isPending,
  };
}

// Helper to format activity for display
export function formatActivityMessage(
  action: string,
  entityType: string,
  metadata?: Record<string, unknown> | null
): string {
  const entityName = metadata?.name as string || entityType;
  
  switch (action) {
    case "created":
      return `created ${entityName}`;
    case "updated":
      return `updated ${entityName}`;
    case "deleted":
      return `deleted ${entityName}`;
    case "uploaded":
      return `uploaded ${entityName}`;
    case "invited":
      return `invited ${entityName} to the team`;
    case "removed":
      return `removed ${entityName} from the team`;
    case "role_changed":
      return `changed role of ${entityName}`;
    case "approved":
      return `approved ${entityName}`;
    case "commented":
      return `commented on ${entityName}`;
    default:
      return `${action} ${entityName}`;
  }
}

// Helper to get time ago string
export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
