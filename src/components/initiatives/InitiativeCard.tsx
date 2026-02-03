import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Calendar, Target, Users } from "lucide-react";
import { InitiativeStatusBadge } from "./InitiativeStatusBadge";
import { InitiativePriorityBadge } from "./InitiativePriorityBadge";
import { format } from "date-fns";
import type { StrategicInitiative, InitiativeStatus, InitiativePriority } from "@/hooks/useStrategicInitiatives";
import type { Json } from "@/integrations/supabase/types";

interface InitiativeCardProps {
  initiative: StrategicInitiative;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function InitiativeCard({ initiative, onClick, onEdit, onDelete }: InitiativeCardProps) {
  const goals = initiative.strategic_goals as { goal: string; target: string }[] | null;
  const stakeholders = initiative.stakeholders as { name: string; role: string }[] | null;
  
  const formatDateRange = () => {
    if (!initiative.timeline_start && !initiative.timeline_end) return null;
    const start = initiative.timeline_start ? format(new Date(initiative.timeline_start), "MMM d, yyyy") : "TBD";
    const end = initiative.timeline_end ? format(new Date(initiative.timeline_end), "MMM d, yyyy") : "TBD";
    return `${start} - ${end}`;
  };

  return (
    <Card 
      className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{initiative.name}</h3>
            {initiative.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {initiative.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <InitiativeStatusBadge status={initiative.status as InitiativeStatus} />
          <InitiativePriorityBadge priority={initiative.priority as InitiativePriority} />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {formatDateRange() && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDateRange()}</span>
          </div>
        )}
        
        {goals && goals.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>{goals.length} strategic goal{goals.length !== 1 ? 's' : ''}</span>
          </div>
        )}
        
        {stakeholders && stakeholders.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{stakeholders.length} stakeholder{stakeholders.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
