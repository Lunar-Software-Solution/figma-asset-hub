import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Crown, Shield } from "lucide-react";
import { useTeam } from "@/hooks/useTeam";
import { useTeamContext } from "@/contexts/TeamContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  InviteMemberDialog,
  ChangeRoleDialog,
  RemoveMemberDialog,
  TeamMemberCard,
} from "@/components/team";
import type { TeamMember } from "@/hooks/useTeam";
import type { Database } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";

type TeamRole = Database["public"]["Enums"]["team_role"];

export default function Team() {
  const { user } = useAuth();
  const { currentTeamId, isAdmin } = useTeamContext();
  const {
    members,
    membersLoading,
    roleCounts,
    inviteMember,
    inviting,
    updateRole,
    updatingRole,
    removeMember,
    removing,
  } = useTeam(currentTeamId);

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [changeRoleMember, setChangeRoleMember] = useState<TeamMember | null>(null);
  const [removeMemberTarget, setRemoveMemberTarget] = useState<TeamMember | null>(null);

  const handleInvite = (data: { email: string; role: TeamRole }) => {
    inviteMember(data, {
      onSuccess: () => setInviteDialogOpen(false),
    });
  };

  const handleChangeRole = (newRole: TeamRole) => {
    if (changeRoleMember) {
      updateRole(
        { memberId: changeRoleMember.id, newRole },
        { onSuccess: () => setChangeRoleMember(null) }
      );
    }
  };

  const handleRemoveMember = () => {
    if (removeMemberTarget) {
      removeMember(removeMemberTarget.id, {
        onSuccess: () => setRemoveMemberTarget(null),
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Team</h1>
            <p className="text-muted-foreground">
              Manage team members and their access permissions.
            </p>
          </div>
          {isAdmin && (
            <Button size="sm" className="gap-2" onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Invite Member
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  {membersLoading ? (
                    <Skeleton className="h-8 w-8" />
                  ) : (
                    <p className="text-2xl font-bold">{roleCounts.admin}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Admin{roleCounts.admin !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  {membersLoading ? (
                    <Skeleton className="h-8 w-8" />
                  ) : (
                    <p className="text-2xl font-bold">{roleCounts.editor}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Editor{roleCounts.editor !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  {membersLoading ? (
                    <Skeleton className="h-8 w-8" />
                  ) : (
                    <p className="text-2xl font-bold">{roleCounts.viewer}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Viewer{roleCounts.viewer !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Members</CardTitle>
            <CardDescription>
              {membersLoading ? (
                <Skeleton className="h-4 w-40" />
              ) : (
                `${members.length} member${members.length !== 1 ? "s" : ""} in your team`
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {membersLoading ? (
              <div className="divide-y divide-border">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 py-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No team members yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {members.map((member) => (
                  <TeamMemberCard
                    key={member.id}
                    member={member}
                    isCurrentUser={member.user_id === user?.id}
                    isAdmin={isAdmin}
                    onChangeRole={setChangeRoleMember}
                    onRemove={setRemoveMemberTarget}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <InviteMemberDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          onInvite={handleInvite}
          isLoading={inviting}
        />

        {changeRoleMember && (
          <ChangeRoleDialog
            open={!!changeRoleMember}
            onOpenChange={(open) => !open && setChangeRoleMember(null)}
            memberName={changeRoleMember.profile?.full_name || changeRoleMember.profile?.email || "Unknown"}
            currentRole={changeRoleMember.role}
            onChangeRole={handleChangeRole}
            isLoading={updatingRole}
          />
        )}

        {removeMemberTarget && (
          <RemoveMemberDialog
            open={!!removeMemberTarget}
            onOpenChange={(open) => !open && setRemoveMemberTarget(null)}
            memberName={removeMemberTarget.profile?.full_name || removeMemberTarget.profile?.email || "Unknown"}
            onConfirm={handleRemoveMember}
            isLoading={removing}
          />
        )}
      </div>
    </AppLayout>
  );
}
