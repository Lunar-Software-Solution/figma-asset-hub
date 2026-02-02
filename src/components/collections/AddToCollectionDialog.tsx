import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, FolderOpen, Building2, Palette, Megaphone } from "lucide-react";
import { useCollections, type Collection } from "@/hooks/useCollections";

interface AddToCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (collectionId: string) => Promise<void>;
  assetName?: string;
}

export function AddToCollectionDialog({
  open,
  onOpenChange,
  onAdd,
  assetName,
}: AddToCollectionDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const { collections, isLoading, searchQuery, setSearchQuery } = useCollections();

  const getOwnerIcon = (collection: Collection) => {
    if (collection.campaign_id) return <Megaphone className="h-3 w-3" />;
    if (collection.brand_id) return <Palette className="h-3 w-3" />;
    if (collection.business_id) return <Building2 className="h-3 w-3" />;
    return null;
  };

  const getOwnerName = (collection: Collection): string | null => {
    if (collection.campaign) return collection.campaign.name;
    if (collection.brand) return collection.brand.name;
    if (collection.business) return collection.business.name;
    return null;
  };

  const handleAdd = async () => {
    if (!selectedId) return;
    setIsAdding(true);
    try {
      await onAdd(selectedId);
      setSelectedId(null);
      onOpenChange(false);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
          <DialogDescription>
            {assetName
              ? `Select a collection to add "${assetName}" to.`
              : "Select a collection to add the asset to."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-64 rounded-md border">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading collections...</p>
              </div>
            ) : collections.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4">
                <FolderOpen className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">No collections found</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => setSelectedId(collection.id)}
                  >
                    <Checkbox
                      checked={selectedId === collection.id}
                      onCheckedChange={() => setSelectedId(collection.id)}
                    />
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{collection.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {collection.asset_count ?? 0} assets
                      </p>
                    </div>
                    {getOwnerName(collection) && (
                      <Badge variant="outline" className="text-xs gap-1 shrink-0">
                        {getOwnerIcon(collection)}
                        {getOwnerName(collection)}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selectedId || isAdding}>
            {isAdding ? "Adding..." : "Add to Collection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
