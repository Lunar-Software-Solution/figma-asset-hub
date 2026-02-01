import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useBrand, Brand } from "@/contexts/BrandContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { toast } from "@/hooks/use-toast";
import { Tag } from "lucide-react";

interface AssignBrandsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignBrandsDialog({
  open,
  onOpenChange,
}: AssignBrandsDialogProps) {
  const { brands, refreshBrands } = useBrand();
  const { currentBusiness } = useBusiness();
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Get unassigned brands (no business_id) that are top-level (no parent_id)
  const unassignedBrands = brands.filter((b) => !b.business_id && !b.parent_id);

  const toggleBrand = (brandId: string) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brandId)) {
        next.delete(brandId);
      } else {
        next.add(brandId);
      }
      return next;
    });
  };

  const handleAssign = async () => {
    if (!currentBusiness || selectedBrands.size === 0) return;

    setIsLoading(true);
    try {
      const brandIds = Array.from(selectedBrands);
      
      const { error } = await supabase
        .from("brands")
        .update({ business_id: currentBusiness.id })
        .in("id", brandIds);

      if (error) throw error;

      toast({
        title: "Brands assigned",
        description: `${brandIds.length} brand${brandIds.length !== 1 ? "s" : ""} assigned to ${currentBusiness.name}.`,
      });

      await refreshBrands();
      setSelectedBrands(new Set());
      onOpenChange(false);
    } catch (error) {
      console.error("Error assigning brands:", error);
      toast({
        title: "Error",
        description: "Failed to assign brands. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedBrands(new Set());
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Brands to Business</DialogTitle>
          <DialogDescription>
            Select existing brands to assign to{" "}
            <span className="font-medium text-foreground">
              {currentBusiness?.name}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        {unassignedBrands.length === 0 ? (
          <div className="py-8 text-center">
            <Tag className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No unassigned brands available.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              All brands are already assigned to a business.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[300px] pr-4">
            <div className="space-y-3">
              {unassignedBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => toggleBrand(brand.id)}
                >
                  <Checkbox
                    id={brand.id}
                    checked={selectedBrands.has(brand.id)}
                    onCheckedChange={() => toggleBrand(brand.id)}
                  />
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: brand.primary_color || "#6366f1" }}
                  >
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt=""
                        className="h-5 w-5 rounded"
                      />
                    ) : (
                      <span className="text-xs font-bold text-white">
                        {brand.name[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={brand.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {brand.name}
                    </Label>
                    {brand.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {brand.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isLoading || selectedBrands.size === 0}
          >
            {isLoading
              ? "Assigning..."
              : `Assign ${selectedBrands.size > 0 ? `(${selectedBrands.size})` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
