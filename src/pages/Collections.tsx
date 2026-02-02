import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FolderOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useCollections, type Collection, type OwnerType } from "@/hooks/useCollections";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  CreateCollectionDialog,
  EditCollectionDialog,
  DeleteCollectionDialog,
  CollectionFilters,
  CollectionCard,
} from "@/components/collections";

export default function Collections() {
  const { user } = useAuth();
  const [ownerFilter, setOwnerFilter] = useState<OwnerType>("all");
  const [teamId, setTeamId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<Collection | null>(null);

  const {
    collections,
    isLoading,
    searchQuery,
    setSearchQuery,
    createCollection,
    updateCollection,
    deleteCollection,
    isDeleting,
  } = useCollections({ ownerType: ownerFilter });

  // Fetch user's team
  useEffect(() => {
    const fetchTeam = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (data) {
        setTeamId(data.team_id);
      }
    };
    fetchTeam();
  }, [user]);

  const handleCreate = async (data: Parameters<typeof createCollection>[0]) => {
    await createCollection(data);
  };

  const handleEdit = async (data: { id: string; name: string; description?: string; is_public: boolean }) => {
    await updateCollection(data);
  };

  const handleDelete = async () => {
    if (!deletingCollection) return;
    await deleteCollection(deletingCollection.id);
    setDeletingCollection(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Collections</h1>
            <p className="text-muted-foreground">
              Organize assets into curated collections for easy access.
            </p>
          </div>
          <Button size="sm" className="gap-2" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            New Collection
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <CollectionFilters value={ownerFilter} onChange={setOwnerFilter} />
          <div className="relative w-full sm:w-auto sm:max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Collections Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-48 rounded-xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No collections yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first collection to start organizing assets.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Collection
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onEdit={setEditingCollection}
                onDelete={setDeletingCollection}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Dialogs */}
      {teamId && (
        <CreateCollectionDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleCreate}
          teamId={teamId}
        />
      )}

      <EditCollectionDialog
        collection={editingCollection}
        open={!!editingCollection}
        onOpenChange={(open) => !open && setEditingCollection(null)}
        onSubmit={handleEdit}
      />

      <DeleteCollectionDialog
        collection={deletingCollection}
        open={!!deletingCollection}
        onOpenChange={(open) => !open && setDeletingCollection(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </AppLayout>
  );
}
