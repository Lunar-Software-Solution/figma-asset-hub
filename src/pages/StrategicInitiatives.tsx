import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useStrategicInitiatives, type StrategicInitiative } from "@/hooks/useStrategicInitiatives";
import {
  InitiativeFilters,
  InitiativeList,
  CreateInitiativeDialog,
  DeleteInitiativeDialog,
} from "@/components/initiatives";

export default function StrategicInitiatives() {
  const navigate = useNavigate();
  const { initiatives, isLoading, createInitiative, deleteInitiative } = useStrategicInitiatives();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState<StrategicInitiative | null>(null);

  const filteredInitiatives = useMemo(() => {
    return initiatives.filter((initiative) => {
      const matchesSearch = 
        initiative.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (initiative.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      const matchesStatus = statusFilter === "all" || initiative.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || initiative.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [initiatives, searchQuery, statusFilter, priorityFilter]);

  const handleSelect = (initiative: StrategicInitiative) => {
    navigate(`/initiatives/${initiative.id}`);
  };

  const handleEdit = (initiative: StrategicInitiative) => {
    navigate(`/initiatives/${initiative.id}`);
  };

  const handleDeleteClick = (initiative: StrategicInitiative) => {
    setSelectedInitiative(initiative);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedInitiative) {
      await deleteInitiative(selectedInitiative.id);
      setDeleteDialogOpen(false);
      setSelectedInitiative(null);
    }
  };

  const handleCreate = async (data: any) => {
    await createInitiative({
      name: data.name,
      description: data.description || null,
      status: data.status,
      priority: data.priority,
      timeline_start: data.timeline_start?.toISOString().split('T')[0] || null,
      timeline_end: data.timeline_end?.toISOString().split('T')[0] || null,
      action_plan: data.action_plan || null,
      resources_needed: data.resources_needed || null,
      risks: data.risks || null,
      business_id: data.business_id || null,
      brand_id: data.brand_id || null,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Strategic Initiatives</h1>
            <p className="text-muted-foreground">
              Plan and track high-level strategic initiatives with linked campaigns
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Initiative
          </Button>
        </div>

        <InitiativeFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
        />

        <InitiativeList
          initiatives={filteredInitiatives}
          isLoading={isLoading}
          onSelect={handleSelect}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </div>

      <CreateInitiativeDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
      />

      <DeleteInitiativeDialog
        initiative={selectedInitiative}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </AppLayout>
  );
}
