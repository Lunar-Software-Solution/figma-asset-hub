import { Campaign, CampaignStatus } from "@/hooks/useCampaigns";
import { CampaignCard } from "./CampaignCard";
import { Skeleton } from "@/components/ui/skeleton";

interface CampaignListProps {
  campaigns: Campaign[];
  isLoading: boolean;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
  onStatusChange: (id: string, status: CampaignStatus) => void;
}

export function CampaignList({ 
  campaigns, 
  isLoading, 
  onEdit, 
  onDelete, 
  onStatusChange 
}: CampaignListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium">No campaigns yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first campaign to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
