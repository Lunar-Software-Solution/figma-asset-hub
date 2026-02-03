import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { INITIATIVE_PRIORITY_CONFIG, type InitiativePriority } from "@/hooks/useStrategicInitiatives";

interface InitiativePriorityBadgeProps {
  priority: InitiativePriority;
  className?: string;
}

export function InitiativePriorityBadge({ priority, className }: InitiativePriorityBadgeProps) {
  const config = INITIATIVE_PRIORITY_CONFIG[priority];
  
  return (
    <Badge 
      variant="outline" 
      className={cn("font-medium", config.color, className)}
    >
      {config.label}
    </Badge>
  );
}
