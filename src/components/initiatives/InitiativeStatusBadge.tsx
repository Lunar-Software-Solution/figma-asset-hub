import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { INITIATIVE_STATUS_CONFIG, type InitiativeStatus } from "@/hooks/useStrategicInitiatives";

interface InitiativeStatusBadgeProps {
  status: InitiativeStatus;
  className?: string;
}

export function InitiativeStatusBadge({ status, className }: InitiativeStatusBadgeProps) {
  const config = INITIATIVE_STATUS_CONFIG[status];
  
  return (
    <Badge 
      variant="secondary" 
      className={cn("font-medium", config.color, className)}
    >
      {config.label}
    </Badge>
  );
}
