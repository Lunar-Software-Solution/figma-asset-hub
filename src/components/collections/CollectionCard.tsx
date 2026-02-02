import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FolderOpen,
  Lock,
  Globe,
  Images,
  MoreHorizontal,
  Building2,
  Palette,
  Megaphone,
  Pencil,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Collection } from "@/hooks/useCollections";

const ownerColors: Record<string, string> = {
  business: "bg-blue-500/10 text-blue-600 border-blue-200",
  brand: "bg-purple-500/10 text-purple-600 border-purple-200",
  campaign: "bg-orange-500/10 text-orange-600 border-orange-200",
  team: "bg-green-500/10 text-green-600 border-green-200",
};

const coverColors = [
  "bg-gradient-to-br from-blue-500 to-blue-600",
  "bg-gradient-to-br from-purple-500 to-purple-600",
  "bg-gradient-to-br from-green-500 to-green-600",
  "bg-gradient-to-br from-orange-500 to-orange-600",
  "bg-gradient-to-br from-cyan-500 to-cyan-600",
  "bg-gradient-to-br from-pink-500 to-pink-600",
];

interface CollectionCardProps {
  collection: Collection;
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
  onClick?: (collection: Collection) => void;
}

export function CollectionCard({
  collection,
  onEdit,
  onDelete,
  onClick,
}: CollectionCardProps) {
  const getOwnerType = (): "business" | "brand" | "campaign" | "team" => {
    if (collection.campaign_id) return "campaign";
    if (collection.brand_id) return "brand";
    if (collection.business_id) return "business";
    return "team";
  };

  const getOwnerName = (): string | null => {
    if (collection.campaign) return collection.campaign.name;
    if (collection.brand) return collection.brand.name;
    if (collection.business) return collection.business.name;
    return null;
  };

  const getOwnerIcon = () => {
    const type = getOwnerType();
    switch (type) {
      case "business":
        return <Building2 className="h-3 w-3" />;
      case "brand":
        return <Palette className="h-3 w-3" />;
      case "campaign":
        return <Megaphone className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const ownerType = getOwnerType();
  const ownerName = getOwnerName();
  const colorIndex = collection.name.charCodeAt(0) % coverColors.length;
  const coverColor = coverColors[colorIndex];

  return (
    <motion.div whileHover={{ y: -2 }}>
      <Card
        className="group cursor-pointer hover:border-primary/50 transition-all overflow-hidden"
        onClick={() => onClick?.(collection)}
      >
        {/* Cover */}
        <div className={cn("h-32 relative", coverColor)}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-white" />
            <span className="text-white font-medium line-clamp-1">
              {collection.name}
            </span>
          </div>
          <div className="absolute top-3 right-3 flex gap-2">
            {ownerName && (
              <Badge
                variant="outline"
                className={cn(
                  "bg-white/90 backdrop-blur-sm text-xs gap-1",
                  ownerColors[ownerType]
                )}
              >
                {getOwnerIcon()}
                {ownerName}
              </Badge>
            )}
            {collection.is_public ? (
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
              <span className="text-sm">{collection.asset_count ?? 0} assets</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(collection);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(collection);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
