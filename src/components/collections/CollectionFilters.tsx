import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Palette, Megaphone, Users, Layers } from "lucide-react";
import type { OwnerType } from "@/hooks/useCollections";

interface CollectionFiltersProps {
  value: OwnerType;
  onChange: (value: OwnerType) => void;
}

export function CollectionFilters({ value, onChange }: CollectionFiltersProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as OwnerType)}>
      <TabsList>
        <TabsTrigger value="all" className="gap-2">
          <Layers className="h-4 w-4" />
          All
        </TabsTrigger>
        <TabsTrigger value="team" className="gap-2">
          <Users className="h-4 w-4" />
          Team
        </TabsTrigger>
        <TabsTrigger value="business" className="gap-2">
          <Building2 className="h-4 w-4" />
          Business
        </TabsTrigger>
        <TabsTrigger value="brand" className="gap-2">
          <Palette className="h-4 w-4" />
          Brand
        </TabsTrigger>
        <TabsTrigger value="campaign" className="gap-2">
          <Megaphone className="h-4 w-4" />
          Campaign
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
