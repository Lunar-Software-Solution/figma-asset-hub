import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Grid3X3,
  List,
  Filter,
  SortAsc,
  Upload,
  FolderPlus,
  MoreHorizontal,
  Download,
  Link as LinkIcon,
  Trash2,
  Eye,
  Tag,
  FolderOpen,
  ImageIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAssets, type Asset } from "@/hooks/useAssets";
import { AddToCollectionDialog } from "@/components/collections";

const typeColors: Record<string, string> = {
  image: "bg-blue-500/10 text-blue-600",
  icon: "bg-purple-500/10 text-purple-600",
  vector: "bg-green-500/10 text-green-600",
  design_file: "bg-orange-500/10 text-orange-600",
  brand_asset: "bg-cyan-500/10 text-cyan-600",
  other: "bg-gray-500/10 text-gray-600",
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export default function Assets() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>("all");
  const [addToCollectionAsset, setAddToCollectionAsset] = useState<Asset | null>(null);

  const {
    assets,
    isLoading,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    addToCollection,
    deleteAsset,
  } = useAssets({ assetType: assetTypeFilter as any });

  const toggleAssetSelection = (id: string) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleAddToCollection = async (collectionId: string) => {
    if (!addToCollectionAsset) return;
    await addToCollection({ assetId: addToCollectionAsset.id, collectionId });
    setAddToCollectionAsset(null);
  };

  const handleDeleteSelected = async () => {
    for (const id of selectedAssets) {
      await deleteAsset(id);
    }
    setSelectedAssets([]);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Asset Library</h1>
            <p className="text-muted-foreground">
              Manage and organize all your design assets in one place.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <FolderPlus className="h-4 w-4" />
              New Folder
            </Button>
            <Button size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, tag, or type..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="icon">Icons</SelectItem>
              <SelectItem value="vector">Vectors</SelectItem>
              <SelectItem value="design_file">Design files</SelectItem>
              <SelectItem value="brand_asset">Brand assets</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-40">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Last updated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="size">Size</SelectItem>
              <SelectItem value="type">Type</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
            <TabsList className="h-9">
              <TabsTrigger value="grid" className="px-3">
                <Grid3X3 className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list" className="px-3">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Selection Bar */}
        {selectedAssets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 rounded-lg bg-primary/5 border border-primary/20 px-4 py-3"
          >
            <span className="text-sm font-medium">
              {selectedAssets.length} selected
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Tag className="h-4 w-4" />
                Add Tags
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-destructive hover:text-destructive"
                onClick={handleDeleteSelected}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedAssets([])}
              className="ml-auto"
            >
              Clear selection
            </Button>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : assets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No assets yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first asset to get started.
            </p>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Assets
            </Button>
          </motion.div>
        ) : viewMode === "grid" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {assets.map((asset) => (
              <motion.div
                key={asset.id}
                whileHover={{ y: -2 }}
                className={cn(
                  "group relative rounded-xl border bg-card overflow-hidden cursor-pointer transition-all",
                  selectedAssets.includes(asset.id)
                    ? "ring-2 ring-primary border-primary"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => toggleAssetSelection(asset.id)}
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-secondary flex items-center justify-center">
                  {asset.thumbnail_url ? (
                    <img
                      src={asset.thumbnail_url}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-2xl font-semibold text-muted-foreground">
                        {asset.name[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{asset.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", typeColors[asset.asset_type])}>
                      {asset.asset_type.replace("_", " ")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(asset.file_size)}
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="secondary" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setAddToCollectionAsset(asset);
                        }}
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Add to Collection
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAsset(asset.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-border overflow-hidden"
          >
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Name</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Type</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Size</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Updated</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr
                    key={asset.id}
                    className={cn(
                      "border-t border-border hover:bg-secondary/30 cursor-pointer transition-colors",
                      selectedAssets.includes(asset.id) && "bg-primary/5"
                    )}
                    onClick={() => toggleAssetSelection(asset.id)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                          {asset.thumbnail_url ? (
                            <img
                              src={asset.thumbnail_url}
                              alt={asset.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-muted-foreground">
                              {asset.name[0]?.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="font-medium">{asset.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn("text-xs px-2 py-1 rounded-full", typeColors[asset.asset_type])}>
                        {asset.asset_type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{formatFileSize(asset.file_size)}</td>
                    <td className="p-4 text-muted-foreground">{formatDate(asset.updated_at)}</td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setAddToCollectionAsset(asset);
                            }}
                          >
                            <FolderOpen className="h-4 w-4 mr-2" />
                            Add to Collection
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAsset(asset.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>

      {/* Add to Collection Dialog */}
      <AddToCollectionDialog
        open={!!addToCollectionAsset}
        onOpenChange={(open) => !open && setAddToCollectionAsset(null)}
        onAdd={handleAddToCollection}
        assetName={addToCollectionAsset?.name}
      />
    </AppLayout>
  );
}
