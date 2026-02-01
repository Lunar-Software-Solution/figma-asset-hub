import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreHorizontal,
  FolderOpen,
  Lock,
  Globe,
  Images,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const mockCollections = [
  { id: 1, name: "Q1 Marketing Campaign", assetCount: 24, isPublic: false, color: "bg-vault-blue" },
  { id: 2, name: "Brand Guidelines", assetCount: 12, isPublic: true, color: "bg-vault-purple" },
  { id: 3, name: "Product Photography", assetCount: 48, isPublic: false, color: "bg-vault-green" },
  { id: 4, name: "Social Media Kit", assetCount: 36, isPublic: true, color: "bg-vault-orange" },
  { id: 5, name: "Icon Library", assetCount: 120, isPublic: false, color: "bg-vault-cyan" },
  { id: 6, name: "Presentation Templates", assetCount: 8, isPublic: false, color: "bg-vault-pink" },
];

export default function Collections() {
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
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Collection
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search collections..." className="pl-10" />
        </div>

        {/* Collections Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {mockCollections.map((collection) => (
            <motion.div key={collection.id} whileHover={{ y: -2 }}>
              <Card className="group cursor-pointer hover:border-primary/50 transition-all overflow-hidden">
                {/* Cover */}
                <div className={cn("h-32 relative", collection.color)}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-white" />
                    <span className="text-white font-medium">{collection.name}</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    {collection.isPublic ? (
                      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                        <Globe className="h-3 w-3 text-white" />
                        <span className="text-xs text-white">Public</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                        <Lock className="h-3 w-3 text-white" />
                        <span className="text-xs text-white">Private</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Images className="h-4 w-4" />
                      <span className="text-sm">{collection.assetCount} assets</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Share</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </AppLayout>
  );
}
