import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCampaigns, Campaign, CampaignStatus } from "@/hooks/useCampaigns";
import { CampaignList } from "@/components/campaigns/CampaignList";
import { CampaignFilters } from "@/components/campaigns/CampaignFilters";
import { CreateCampaignDialog } from "@/components/campaigns/CreateCampaignDialog";
import { EditCampaignDialog } from "@/components/campaigns/EditCampaignDialog";
import { DeleteCampaignDialog } from "@/components/campaigns/DeleteCampaignDialog";
import { format } from "date-fns";

export default function Campaigns() {
  const { 
    campaigns, 
    isLoading, 
    createCampaign, 
    updateCampaign, 
    deleteCampaign, 
    updateStatus 
  } = useCampaigns();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      // Search filter
      const matchesSearch = 
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchQuery, statusFilter]);

  const handleCreateCampaign = async (data: {
    name: string;
    description?: string;
    start_date?: Date;
    end_date?: Date;
    budget?: string;
    currency?: string;
    business_id?: string;
    brand_id?: string;
  }) => {
    await createCampaign({
      name: data.name,
      description: data.description || null,
      start_date: data.start_date ? format(data.start_date, "yyyy-MM-dd") : null,
      end_date: data.end_date ? format(data.end_date, "yyyy-MM-dd") : null,
      budget: data.budget ? parseFloat(data.budget) : null,
      currency: data.currency || "USD",
      business_id: data.business_id || null,
      brand_id: data.brand_id || null,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Campaigns</h1>
            <p className="text-muted-foreground">
              Manage your marketing campaigns and track their progress
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>

        {/* Filters */}
        <CampaignFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {/* Campaign List */}
        <CampaignList
          campaigns={filteredCampaigns}
          isLoading={isLoading}
          onEdit={setEditingCampaign}
          onDelete={setDeletingCampaign}
          onStatusChange={updateStatus}
        />

        {/* Dialogs */}
        <CreateCampaignDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleCreateCampaign}
        />

        <EditCampaignDialog
          campaign={editingCampaign}
          open={!!editingCampaign}
          onOpenChange={(open) => !open && setEditingCampaign(null)}
          onSubmit={updateCampaign}
        />

        <DeleteCampaignDialog
          campaign={deletingCampaign}
          open={!!deletingCampaign}
          onOpenChange={(open) => !open && setDeletingCampaign(null)}
          onConfirm={deleteCampaign}
        />
      </div>
    </AppLayout>
  );
}
