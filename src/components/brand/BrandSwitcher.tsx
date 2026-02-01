import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Building2 } from "lucide-react";
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
import { useBrand, Brand } from "@/contexts/BrandContext";
import { CreateBrandDialog } from "./CreateBrandDialog";

export function BrandSwitcher() {
  const { brands, currentBrand, setCurrentBrand, isLoading } = useBrand();
  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Organize brands into parent/child structure
  const parentBrands = brands.filter((b) => !b.parent_id);
  const getSubBrands = (parentId: string) =>
    brands.filter((b) => b.parent_id === parentId);

  const handleSelect = (brand: Brand) => {
    setCurrentBrand(brand);
    setOpen(false);
  };

  if (isLoading) {
    return (
      <div className="h-10 w-full animate-pulse rounded-lg bg-secondary" />
    );
  }

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
              {currentBrand ? (
                <>
                  <div
                    className="h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: currentBrand.primary_color }}
                  >
                    {currentBrand.logo_url ? (
                      <img
                        src={currentBrand.logo_url}
                        alt=""
                        className="h-4 w-4 rounded"
                      />
                    ) : (
                      <span className="text-xs font-bold text-white">
                        {currentBrand.name[0]}
                      </span>
                    )}
                  </div>
                  <span className="truncate font-medium">
                    {currentBrand.name}
                  </span>
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Select brand...</span>
                </>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search brands..." />
            <CommandList>
              <CommandEmpty>No brands found.</CommandEmpty>
              {parentBrands.length > 0 && (
                <CommandGroup heading="Brands">
                  {parentBrands.map((brand) => (
                    <div key={brand.id}>
                      <CommandItem
                        value={brand.name}
                        onSelect={() => handleSelect(brand)}
                        className="cursor-pointer"
                      >
                        <div
                          className="h-5 w-5 rounded flex items-center justify-center mr-2"
                          style={{ backgroundColor: brand.primary_color }}
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
                      {/* Sub-brands */}
                      {getSubBrands(brand.id).map((subBrand) => (
                        <CommandItem
                          key={subBrand.id}
                          value={subBrand.name}
                          onSelect={() => handleSelect(subBrand)}
                          className="cursor-pointer pl-8"
                        >
                          <div
                            className="h-4 w-4 rounded flex items-center justify-center mr-2"
                            style={{ backgroundColor: subBrand.primary_color }}
                          >
                            <span className="text-[8px] font-bold text-white">
                              {subBrand.name[0]}
                            </span>
                          </div>
                          <span className="flex-1 text-sm">{subBrand.name}</span>
                          {currentBrand?.id === subBrand.id && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </CommandItem>
                      ))}
                    </div>
                  ))}
                </CommandGroup>
              )}
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setShowCreateDialog(true);
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

      <CreateBrandDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}
