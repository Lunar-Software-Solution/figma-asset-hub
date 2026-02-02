import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type TeamRole = Database["public"]["Enums"]["team_role"];

export interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: TeamRole;
  joined_at: string;
  invited_by: string | null;
  profile: {
    email: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  created_at: string;
  created_by: string;
}

export function useTeam(teamId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch team details
  const teamQuery = useQuery({
    queryKey: ["team", teamId],
    queryFn: async () => {
      if (!teamId) return null;
      const { data, error } = await supabase
        .from("teams")
        .select("*")
        .eq("id", teamId)
        .single();
      if (error) throw error;
      return data as Team;
    },
    enabled: !!teamId,
  });

  // Fetch team members with profiles
  const membersQuery = useQuery({
    queryKey: ["team-members", teamId],
    queryFn: async () => {
      if (!teamId) return [];
      
      // First get team members
      const { data: members, error: membersError } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", teamId);
      
      if (membersError) throw membersError;
      
      // Then get profiles for all member user_ids
      const userIds = members.map(m => m.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, email, full_name, avatar_url")
        .in("user_id", userIds);
      
      if (profilesError) throw profilesError;
      
      // Join members with profiles
      const membersWithProfiles: TeamMember[] = members.map(member => ({
        ...member,
        profile: profiles.find(p => p.user_id === member.user_id) || null,
      }));
      
      return membersWithProfiles;
    },
    enabled: !!teamId,
  });

  // Get current user's role in the team
  const currentUserRole = membersQuery.data?.find(
    (m) => m.user_id === user?.id
  )?.role;
  const isAdmin = currentUserRole === "admin";

  // Role counts
  const roleCounts = {
    admin: membersQuery.data?.filter((m) => m.role === "admin").length || 0,
    editor: membersQuery.data?.filter((m) => m.role === "editor").length || 0,
    viewer: membersQuery.data?.filter((m) => m.role === "viewer").length || 0,
  };

  // Invite member by email
  const inviteMemberMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: TeamRole }) => {
      if (!teamId || !user) throw new Error("No team or user");

      // First check if user exists in profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("email", email)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        throw new Error("User not found. They must sign up first.");
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", teamId)
        .eq("user_id", profile.user_id)
        .maybeSingle();

      if (existingMember) {
        throw new Error("User is already a team member.");
      }

      // Add to team
      const { error } = await supabase.from("team_members").insert({
        team_id: teamId,
        user_id: profile.user_id,
        role,
        invited_by: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });
      toast.success("Team member added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update member role
  const updateRoleMutation = useMutation({
    mutationFn: async ({
      memberId,
      newRole,
    }: {
      memberId: string;
      newRole: TeamRole;
    }) => {
      const { error } = await supabase
        .from("team_members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });
      toast.success("Role updated successfully");
    },
    onError: () => {
      toast.error("Failed to update role");
    },
  });

  // Remove member
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", teamId] });
      toast.success("Team member removed");
    },
    onError: () => {
      toast.error("Failed to remove team member");
    },
  });

  return {
    team: teamQuery.data,
    teamLoading: teamQuery.isLoading,
    members: membersQuery.data || [],
    membersLoading: membersQuery.isLoading,
    currentUserRole,
    isAdmin,
    roleCounts,
    inviteMember: inviteMemberMutation.mutate,
    inviting: inviteMemberMutation.isPending,
    updateRole: updateRoleMutation.mutate,
    updatingRole: updateRoleMutation.isPending,
    removeMember: removeMemberMutation.mutate,
    removing: removeMemberMutation.isPending,
  };
}
