import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type TeamRole = Database["public"]["Enums"]["team_role"];

interface Team {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  created_at: string;
  created_by: string;
}

interface TeamMembership {
  id: string;
  team_id: string;
  role: TeamRole;
  team: Team;
}

interface TeamContextType {
  currentTeam: Team | null;
  currentTeamId: string | null;
  setCurrentTeamId: (id: string | null) => void;
  teams: Team[];
  isLoadingTeams: boolean;
  currentRole: TeamRole | null;
  isAdmin: boolean;
  isEditor: boolean;
  refreshTeams: () => void;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);

  // Fetch user's team memberships
  const teamsQuery = useQuery({
    queryKey: ["user-teams", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("team_members")
        .select(`
          id,
          team_id,
          role,
          team:teams (
            id,
            name,
            description,
            avatar_url,
            created_at,
            created_by
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;

      // Transform to TeamMembership array
      return (data || []).map((item) => ({
        id: item.id,
        team_id: item.team_id,
        role: item.role,
        team: item.team as unknown as Team,
      })) as TeamMembership[];
    },
    enabled: !!user && !authLoading,
  });

  const teams = teamsQuery.data?.map((m) => m.team) || [];
  
  // Auto-select first team if none selected
  useEffect(() => {
    if (teams.length > 0 && !currentTeamId) {
      setCurrentTeamId(teams[0].id);
    }
  }, [teams, currentTeamId]);

  const currentTeam = teams.find((t) => t.id === currentTeamId) || null;
  const currentMembership = teamsQuery.data?.find(
    (m) => m.team_id === currentTeamId
  );
  const currentRole = currentMembership?.role || null;
  const isAdmin = currentRole === "admin";
  const isEditor = currentRole === "editor" || currentRole === "admin";

  return (
    <TeamContext.Provider
      value={{
        currentTeam,
        currentTeamId,
        setCurrentTeamId,
        teams,
        isLoadingTeams: teamsQuery.isLoading,
        currentRole,
        isAdmin,
        isEditor,
        refreshTeams: () => teamsQuery.refetch(),
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeamContext() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error("useTeamContext must be used within a TeamProvider");
  }
  return context;
}
