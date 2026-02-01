import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserPlus,
  MoreHorizontal,
  Mail,
  Shield,
  Crown,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const mockTeamMembers = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "admin", avatar: null, status: "active" },
  { id: 2, name: "Sarah Smith", email: "sarah@example.com", role: "editor", avatar: null, status: "active" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "editor", avatar: null, status: "active" },
  { id: 4, name: "Emma Wilson", email: "emma@example.com", role: "viewer", avatar: null, status: "active" },
  { id: 5, name: "Alex Brown", email: "alex@example.com", role: "viewer", avatar: null, status: "pending" },
];

const roleColors: Record<string, string> = {
  admin: "bg-vault-purple/10 text-vault-purple border-vault-purple/20",
  editor: "bg-vault-blue/10 text-vault-blue border-vault-blue/20",
  viewer: "bg-secondary text-muted-foreground",
};

const roleIcons: Record<string, typeof Shield> = {
  admin: Crown,
  editor: Shield,
  viewer: Shield,
};

export default function Team() {
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
          <Button size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
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
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-sm text-muted-foreground">Admin</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-vault-blue/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-vault-blue" />
                </div>
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">Editors</p>
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
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">Viewers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invite Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Invite Team Members</CardTitle>
            <CardDescription>
              Send invitations to add new members to your team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Enter email addresses..." className="pl-10" />
              </div>
              <Select defaultValue="viewer">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button>Send Invite</Button>
            </div>
          </CardContent>
        </Card>

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Members</CardTitle>
            <CardDescription>
              {mockTeamMembers.length} members in your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {mockTeamMembers.map((member) => {
                const RoleIcon = roleIcons[member.role];
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {member.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.name}</p>
                        {member.status === "pending" && (
                          <Badge variant="outline" className="text-xs">Pending</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>

                    {/* Role Badge */}
                    <Badge variant="outline" className={cn("gap-1 capitalize", roleColors[member.role])}>
                      <RoleIcon className="h-3 w-3" />
                      {member.role}
                    </Badge>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Change Role</DropdownMenuItem>
                        <DropdownMenuItem>View Activity</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
