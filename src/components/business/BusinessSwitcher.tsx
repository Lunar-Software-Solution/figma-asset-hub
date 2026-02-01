import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Building, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useBusiness, Business } from "@/contexts/BusinessContext";
import { useBrand, Brand } from "@/contexts/BrandContext";
import { CreateBusinessDialog } from "./CreateBusinessDialog";
import { CreateBrandDialog } from "@/components/brand/CreateBrandDialog";

export function BusinessSwitcher() {
  const { businesses, currentBusiness, setCurrentBusiness, isLoading: businessLoading } = useBusiness();
  const { brands, currentBrand, setCurrentBrand, isLoading: brandLoading } = useBrand();
  const [open, setOpen] = useState(false);
  const [showCreateBusinessDialog, setShowCreateBusinessDialog] = useState(false);
  const [showCreateBrandDialog, setShowCreateBrandDialog] = useState(false);
  const [expandedBusinesses, setExpandedBusinesses] = useState<Set<string>>(new Set());

  const isLoading = businessLoading || brandLoading;

  // Get brands for a specific business
  const getBrandsByBusiness = (businessId: string) =>
    brands.filter((b) => b.business_id === businessId && !b.parent_id);

  // Get sub-brands for a specific brand
  const getSubBrands = (brandId: string) =>
    brands.filter((b) => b.parent_id === brandId);

  // Get unassigned brands (no business_id)
  const unassignedBrands = brands.filter((b) => !b.business_id && !b.parent_id);

  const toggleBusinessExpanded = (businessId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedBusinesses((prev) => {
      const next = new Set(prev);
      if (next.has(businessId)) {
        next.delete(businessId);
      } else {
        next.add(businessId);
      }
      return next;
    });
  };

  const handleSelectBusiness = (business: Business) => {
    setCurrentBusiness(business);
    setCurrentBrand(null);
    setOpen(false);
  };

  const handleSelectBrand = (brand: Brand) => {
    // Find the business for this brand
    if (brand.business_id) {
      const business = businesses.find((b) => b.id === brand.business_id);
      if (business) setCurrentBusiness(business);
    }
    setCurrentBrand(brand);
    setOpen(false);
  };

  if (isLoading) {
    return (
      <div className="h-10 w-full animate-pulse rounded-lg bg-secondary" />
    );
  }

  // Determine display text
  const getDisplayInfo = () => {
    if (currentBrand) {
      return {
        name: currentBrand.name,
        color: currentBrand.primary_color || "#6366f1",
        type: "brand" as const,
      };
    }
    if (currentBusiness) {
      return {
        name: currentBusiness.name,
        color: currentBusiness.primary_color,
        type: "business" as const,
      };
    }
    return null;
  };

  const displayInfo = getDisplayInfo();

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between gap-2 h-11 px-3"
          >
            <div className="flex items-center gap-2 min-w-0">
              {displayInfo ? (
                <>
                  <div
                    className="h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: displayInfo.color }}
                  >
                    <span className="text-xs font-bold text-white">
                      {displayInfo.name[0]}
                    </span>
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span className="truncate font-medium text-sm">
                      {displayInfo.name}
                    </span>
                    {currentBusiness && currentBrand && (
                      <span className="text-[10px] text-muted-foreground truncate">
                        {currentBusiness.name}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Select...</span>
                </>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              
              {/* Businesses with their brands */}
              {businesses.length > 0 && (
                <CommandGroup heading="Businesses">
                  {businesses.map((business) => {
                    const businessBrands = getBrandsByBusiness(business.id);
                    const isExpanded = expandedBusinesses.has(business.id);
                    
                    return (
                      <div key={business.id}>
                        <CommandItem
                          value={business.name}
                          onSelect={() => handleSelectBusiness(business)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            {businessBrands.length > 0 && (
                              <button
                                onClick={(e) => toggleBusinessExpanded(business.id, e)}
                                className="p-0.5 hover:bg-accent rounded"
                              >
                                <ChevronRight
                                  className={cn(
                                    "h-3 w-3 transition-transform",
                                    isExpanded && "rotate-90"
                                  )}
                                />
                              </button>
                            )}
                            <div
                              className="h-5 w-5 rounded flex items-center justify-center"
                              style={{ backgroundColor: business.primary_color }}
                            >
                              <Building className="h-3 w-3 text-white" />
                            </div>
                            <span className="flex-1">{business.name}</span>
                          </div>
                          {currentBusiness?.id === business.id && !currentBrand && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </CommandItem>
                        
                        {/* Brands under this business */}
                        {isExpanded && businessBrands.map((brand) => (
                          <div key={brand.id}>
                            <CommandItem
                              value={`${business.name} ${brand.name}`}
                              onSelect={() => handleSelectBrand(brand)}
                              className="cursor-pointer pl-10"
                            >
                              <div
                                className="h-4 w-4 rounded flex items-center justify-center mr-2"
                                style={{ backgroundColor: brand.primary_color || "#6366f1" }}
                              >
                                <span className="text-[8px] font-bold text-white">
                                  {brand.name[0]}
                                </span>
                              </div>
                              <span className="flex-1 text-sm">{brand.name}</span>
                              {currentBrand?.id === brand.id && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </CommandItem>
                            
                            {/* Sub-brands */}
                            {getSubBrands(brand.id).map((subBrand) => (
                              <CommandItem
                                key={subBrand.id}
                                value={`${business.name} ${brand.name} ${subBrand.name}`}
                                onSelect={() => handleSelectBrand(subBrand)}
                                className="cursor-pointer pl-14"
                              >
                                <div
                                  className="h-3 w-3 rounded flex items-center justify-center mr-2"
                                  style={{ backgroundColor: subBrand.primary_color || "#6366f1" }}
                                />
                                <span className="flex-1 text-xs">{subBrand.name}</span>
                                {currentBrand?.id === subBrand.id && (
                                  <Check className="h-4 w-4 text-primary" />
                                )}
                              </CommandItem>
                            ))}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </CommandGroup>
              )}
              
              {/* Unassigned brands (for backwards compatibility) */}
              {unassignedBrands.length > 0 && (
                <CommandGroup heading="Other Brands">
                  {unassignedBrands.map((brand) => (
                    <CommandItem
                      key={brand.id}
                      value={brand.name}
                      onSelect={() => handleSelectBrand(brand)}
                      className="cursor-pointer"
                    >
                      <div
                        className="h-5 w-5 rounded flex items-center justify-center mr-2"
                        style={{ backgroundColor: brand.primary_color || "#6366f1" }}
                      >
                        <span className="text-[10px] font-bold text-white">
                          {brand.name[0]}
                        </span>
                      </div>
                      <span className="flex-1">{brand.name}</span>
                      {currentBrand?.id === brand.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setShowCreateBusinessDialog(true);
                  }}
                  className="cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create new business
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setShowCreateBrandDialog(true);
                  }}
                  className="cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create new brand
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <CreateBusinessDialog
        open={showCreateBusinessDialog}
        onOpenChange={setShowCreateBusinessDialog}
      />
      <CreateBrandDialog
        open={showCreateBrandDialog}
        onOpenChange={setShowCreateBrandDialog}
      />
    </>
  );
}
