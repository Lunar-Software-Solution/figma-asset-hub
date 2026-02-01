import { useState } from "react";
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
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Mock data
const mockAssets = [
  { id: 1, name: "Hero Banner.png", type: "image", size: "2.4 MB", updated: "2 hours ago", tags: ["marketing", "hero"] },
  { id: 2, name: "Icon Pack - Navigation.svg", type: "icon", size: "156 KB", updated: "4 hours ago", tags: ["icons", "ui"] },
  { id: 3, name: "Brand Colors.fig", type: "design_file", size: "1.2 MB", updated: "Yesterday", tags: ["brand"] },
  { id: 4, name: "Logo - Dark Mode.svg", type: "vector", size: "48 KB", updated: "2 days ago", tags: ["logo", "brand"] },
  { id: 5, name: "Product Shot 1.jpg", type: "image", size: "3.8 MB", updated: "3 days ago", tags: ["product"] },
  { id: 6, name: "Social Media Kit.zip", type: "design_file", size: "12 MB", updated: "1 week ago", tags: ["social", "marketing"] },
  { id: 7, name: "UI Components.fig", type: "design_file", size: "4.2 MB", updated: "1 week ago", tags: ["ui", "components"] },
  { id: 8, name: "Illustration - Welcome.svg", type: "vector", size: "234 KB", updated: "2 weeks ago", tags: ["illustration"] },
];

const typeColors: Record<string, string> = {
  image: "bg-vault-blue/10 text-vault-blue",
  icon: "bg-vault-purple/10 text-vault-purple",
  vector: "bg-vault-green/10 text-vault-green",
  design_file: "bg-vault-orange/10 text-vault-orange",
};

export default function Assets() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedAssets, setSelectedAssets] = useState<number[]>([]);

  const toggleAssetSelection = (id: number) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
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
            />
          </div>

          {/* Filters */}
          <Select>
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
            </SelectContent>
          </Select>

          <Select>
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
              <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive">
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

        {/* Asset Grid */}
        {viewMode === "grid" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {mockAssets.map((asset) => (
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
                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-2xl font-semibold text-muted-foreground">
                      {asset.name[0]}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{asset.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", typeColors[asset.type])}>
                      {asset.type.replace("_", " ")}
                    </span>
                    <span className="text-xs text-muted-foreground">{asset.size}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
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
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Tags</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockAssets.map((asset) => (
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
                        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                          <span className="text-sm font-medium text-muted-foreground">
                            {asset.name[0]}
                          </span>
                        </div>
                        <span className="font-medium">{asset.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn("text-xs px-2 py-1 rounded-full", typeColors[asset.type])}>
                        {asset.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{asset.size}</td>
                    <td className="p-4 text-muted-foreground">{asset.updated}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {asset.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-secondary px-2 py-0.5 rounded-full text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                        {asset.tags.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{asset.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <LinkIcon className="h-4 w-4 mr-2" />
                            Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
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
    </AppLayout>
  );
}
