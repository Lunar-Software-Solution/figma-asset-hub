import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useBusiness } from "@/contexts/BusinessContext";
import { useBrand } from "@/contexts/BrandContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  Tag, 
  LayoutGrid, 
  Plus,
  ArrowRight,
  Palette,
  FolderTree
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CreateBrandDialog } from "@/components/brand/CreateBrandDialog";

export default function BusinessOverview() {
  const { currentBusiness, isLoading: businessLoading } = useBusiness();
  const { brands, setCurrentBrand, isLoading: brandLoading } = useBrand();
  const [showCreateBrandDialog, setShowCreateBrandDialog] = useState(false);

  const isLoading = businessLoading || brandLoading;

  // Get brands for current business
  const businessBrands = currentBusiness 
    ? brands.filter((b) => b.business_id === currentBusiness.id && !b.parent_id)
    : [];

  // Get sub-brands count for a brand
  const getSubBrandCount = (brandId: string) => 
    brands.filter((b) => b.parent_id === brandId).length;

  // Get all sub-brands for current business
  const totalSubBrands = businessBrands.reduce(
    (acc, brand) => acc + getSubBrandCount(brand.id), 
    0
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  if (!currentBusiness) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
          <Building className="h-16 w-16 text-muted-foreground/50" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">No Business Selected</h2>
            <p className="text-muted-foreground mt-1">
              Select or create a business from the sidebar to view its overview.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="h-14 w-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: currentBusiness.primary_color }}
            >
              <Building className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {currentBusiness.name}
              </h1>
              {currentBusiness.description && (
                <p className="text-muted-foreground mt-1">
                  {currentBusiness.description}
                </p>
              )}
            </div>
          </div>
          <Button onClick={() => setShowCreateBrandDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Brand
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Brands
              </CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{businessBrands.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sub-Brands
              </CardTitle>
              <FolderTree className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalSubBrands}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Brand Color
              </CardTitle>
              <Palette className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div 
                  className="h-8 w-8 rounded-lg border"
                  style={{ backgroundColor: currentBusiness.primary_color }}
                />
                <span className="text-sm font-mono text-muted-foreground">
                  {currentBusiness.primary_color}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Brands Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Brands</h2>
          </div>

          {businessBrands.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Tag className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">
                  No brands yet
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first brand under {currentBusiness.name}
                </p>
                <Button onClick={() => setShowCreateBrandDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Brand
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businessBrands.map((brand, index) => {
                const subBrandCount = getSubBrandCount(brand.id);
                const subBrands = brands.filter((b) => b.parent_id === brand.id);
                
                return (
                  <motion.div
                    key={brand.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-10 w-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: brand.primary_color || "#6366f1" }}
                            >
                              {brand.logo_url ? (
                                <img 
                                  src={brand.logo_url} 
                                  alt="" 
                                  className="h-6 w-6 rounded"
                                />
                              ) : (
                                <span className="text-sm font-bold text-white">
                                  {brand.name[0]}
                                </span>
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-base">{brand.name}</CardTitle>
                              {subBrandCount > 0 && (
                                <CardDescription className="text-xs">
                                  {subBrandCount} sub-brand{subBrandCount !== 1 ? "s" : ""}
                                </CardDescription>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setCurrentBrand(brand)}
                            asChild
                          >
                            <Link to="/canvas">
                              <LayoutGrid className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {brand.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {brand.description}
                          </p>
                        )}
                        
                        {/* Sub-brands */}
                        {subBrands.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Sub-brands
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {subBrands.slice(0, 3).map((sub) => (
                                <Badge
                                  key={sub.id}
                                  variant="secondary"
                                  className="text-xs cursor-pointer hover:bg-secondary/80"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentBrand(sub);
                                  }}
                                >
                                  <div
                                    className="h-2 w-2 rounded-full mr-1.5"
                                    style={{ backgroundColor: sub.primary_color || "#6366f1" }}
                                  />
                                  {sub.name}
                                </Badge>
                              ))}
                              {subBrands.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{subBrands.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action row */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: brand.primary_color || "#6366f1" }}
                            />
                            <span className="text-xs font-mono text-muted-foreground">
                              {brand.primary_color || "#6366f1"}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => setCurrentBrand(brand)}
                            asChild
                          >
                            <Link to="/canvas">
                              View Canvas
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <CreateBrandDialog
        open={showCreateBrandDialog}
        onOpenChange={setShowCreateBrandDialog}
      />
    </AppLayout>
  );
}
