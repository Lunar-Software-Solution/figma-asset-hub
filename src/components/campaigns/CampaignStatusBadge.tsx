import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CampaignStatus, CAMPAIGN_STATUS_CONFIG } from "@/hooks/useCampaigns";

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
  className?: string;
}

export function CampaignStatusBadge({ status, className }: CampaignStatusBadgeProps) {
  const config = CAMPAIGN_STATUS_CONFIG[status];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(config.color, "border-0", className)}
    >
      {config.label}
    </Badge>
  );
}
