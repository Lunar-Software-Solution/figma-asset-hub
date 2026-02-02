import { Campaign, CampaignStatus, CAMPAIGN_STATUS_CONFIG } from "@/hooks/useCampaigns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CampaignStatusBadge } from "./CampaignStatusBadge";
import { 
  MoreVertical, 
  Calendar, 
  DollarSign, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  CheckCircle, 
  Archive,
  Send
} from "lucide-react";
import { format } from "date-fns";

interface CampaignCardProps {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
  onStatusChange: (id: string, status: CampaignStatus) => void;
}

export function CampaignCard({ campaign, onEdit, onDelete, onStatusChange }: CampaignCardProps) {
  const statusActions = getStatusActions(campaign.status);

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{campaign.name}</h3>
            {campaign.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {campaign.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(campaign)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              
              {statusActions.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  {statusActions.map((action) => (
                    <DropdownMenuItem 
                      key={action.status}
                      onClick={() => onStatusChange(campaign.id, action.status)}
                    >
                      <action.icon className="h-4 w-4 mr-2" />
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(campaign)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <CampaignStatusBadge status={campaign.status} />
          
          {(campaign.start_date || campaign.end_date) && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {campaign.start_date && format(new Date(campaign.start_date), "MMM d")}
                {campaign.start_date && campaign.end_date && " - "}
                {campaign.end_date && format(new Date(campaign.end_date), "MMM d, yyyy")}
              </span>
            </div>
          )}
          
          {campaign.budget && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              <span>
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: campaign.currency || "USD",
                  minimumFractionDigits: 0,
                }).format(Number(campaign.budget))}
              </span>
            </div>
          )}
        </div>
        
        {campaign.tags && campaign.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {campaign.tags.slice(0, 3).map((tag) => (
              <span 
                key={tag} 
                className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
            {campaign.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-muted-foreground">
                +{campaign.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getStatusActions(currentStatus: CampaignStatus) {
  const actions: Array<{ status: CampaignStatus; label: string; icon: typeof Play }> = [];
  
  switch (currentStatus) {
    case "draft":
      actions.push({ status: "in_review", label: "Submit for Review", icon: Send });
      break;
    case "in_review":
      actions.push({ status: "approved", label: "Approve", icon: CheckCircle });
      actions.push({ status: "draft", label: "Return to Draft", icon: Edit });
      break;
    case "approved":
      actions.push({ status: "active", label: "Activate", icon: Play });
      break;
    case "active":
      actions.push({ status: "paused", label: "Pause", icon: Pause });
      actions.push({ status: "completed", label: "Mark Complete", icon: CheckCircle });
      break;
    case "paused":
      actions.push({ status: "active", label: "Resume", icon: Play });
      actions.push({ status: "completed", label: "Mark Complete", icon: CheckCircle });
      break;
    case "completed":
      actions.push({ status: "archived", label: "Archive", icon: Archive });
      break;
  }
  
  return actions;
}
