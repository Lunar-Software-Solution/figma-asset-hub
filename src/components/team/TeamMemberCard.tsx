import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Shield, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/hooks/useTeam";
import type { Database } from "@/integrations/supabase/types";

type TeamRole = Database["public"]["Enums"]["team_role"];

interface TeamMemberCardProps {
  member: TeamMember;
  isCurrentUser: boolean;
  isAdmin: boolean;
  onChangeRole: (member: TeamMember) => void;
  onRemove: (member: TeamMember) => void;
}

const roleColors: Record<TeamRole, string> = {
  admin: "bg-primary/10 text-primary border-primary/20",
  editor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  viewer: "bg-secondary text-muted-foreground",
};

const roleIcons: Record<TeamRole, typeof Shield> = {
  admin: Crown,
  editor: Shield,
  viewer: Shield,
};

export function TeamMemberCard({
  member,
  isCurrentUser,
  isAdmin,
  onChangeRole,
  onRemove,
}: TeamMemberCardProps) {
  const RoleIcon = roleIcons[member.role];
  const displayName = member.profile?.full_name || member.profile?.email || "Unknown User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
      {/* Avatar */}
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
        {member.profile?.avatar_url ? (
          <img
            src={member.profile.avatar_url}
            alt={displayName}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-medium text-primary">{initials}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium">{displayName}</p>
          {isCurrentUser && (
            <Badge variant="outline" className="text-xs">
              You
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{member.profile?.email}</p>
      </div>

      {/* Role Badge */}
      <Badge variant="outline" className={cn("gap-1 capitalize", roleColors[member.role])}>
        <RoleIcon className="h-3 w-3" />
        {member.role}
      </Badge>

      {/* Actions */}
      {isAdmin && !isCurrentUser && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onChangeRole(member)}>
              Change Role
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onRemove(member)}
              className="text-destructive"
            >
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
