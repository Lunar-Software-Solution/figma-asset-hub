import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CanvasBlock } from "@/components/canvas/CanvasBlock";
import { AddCanvasItemDialog } from "@/components/canvas/AddCanvasItemDialog";
import { useBusinessCanvas, CanvasBlockType, CanvasLevel } from "@/hooks/useBusinessCanvas";
import { useBrand } from "@/contexts/BrandContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Building, Tag, LayoutGrid, Target, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BlockConfig {
  type: CanvasBlockType;
  title: string;
  description: string;
  color: string;
}

// Original BMC blocks (9 blocks)
const bmcBlockConfigs: BlockConfig[] = [
  {
    type: "key_partners",
    title: "Key Partners",
    description: "Strategic alliances and suppliers",
    color: "#8B5CF6", // violet
  },
  {
    type: "key_activities",
    title: "Key Activities",
    description: "Actions to deliver value",
    color: "#F97316", // orange
  },
  {
    type: "key_resources",
    title: "Key Resources",
    description: "Assets needed for success",
    color: "#F97316", // orange
  },
  {
    type: "value_propositions",
    title: "Value Propositions",
    description: "Value created for customers",
    color: "#EF4444", // red
  },
  {
    type: "customer_relationships",
    title: "Customer Relationships",
    description: "How you interact with customers",
    color: "#22C55E", // green
  },
  {
    type: "channels",
    title: "Channels",
    description: "How you deliver value",
    color: "#22C55E", // green
  },
  {
    type: "customer_segments",
    title: "Customer Segments",
    description: "Who you create value for",
    color: "#3B82F6", // blue
  },
  {
    type: "cost_structure",
    title: "Cost Structure",
    description: "All costs to operate",
    color: "#EC4899", // pink
  },
  {
    type: "revenue_streams",
    title: "Revenue Streams",
    description: "How you earn income",
    color: "#14B8A6", // teal
  },
];

// Strategy & Competition blocks (4 blocks)
const strategyBlockConfigs: BlockConfig[] = [
  {
    type: "challenges",
    title: "Challenges",
    description: "Problems and obstacles to overcome",
    color: "#DC2626", // red
  },
  {
    type: "competitors",
    title: "Competitors",
    description: "Market competition analysis",
    color: "#7C3AED", // purple
  },
  {
    type: "innovation",
    title: "Innovation",
    description: "New ideas and improvements",
    color: "#0EA5E9", // sky
  },
  {
    type: "unique_selling_point",
    title: "Unique Selling Point",
    description: "What sets you apart",
    color: "#F59E0B", // amber
  },
];

// Operations & Metrics blocks (4 blocks)
const operationsBlockConfigs: BlockConfig[] = [
  {
    type: "corporate_structure",
    title: "Corporate Structure",
    description: "Organizational hierarchy",
    color: "#6366F1", // indigo
  },
  {
    type: "solution",
    title: "Solution",
    description: "How you solve customer problems",
    color: "#10B981", // emerald
  },
  {
    type: "impact",
    title: "Impact",
    description: "Measurable outcomes and effects",
    color: "#8B5CF6", // violet
  },
  {
    type: "success_metrics",
    title: "Success Metrics",
    description: "KPIs and success indicators",
    color: "#F43F5E", // rose
  },
];

// Combine all for lookup
const allBlockConfigs = [...bmcBlockConfigs, ...strategyBlockConfigs, ...operationsBlockConfigs];

type CanvasTab = "business_model" | "strategy" | "operations";

export default function BusinessCanvas() {
  const { currentBrand, isLoading: brandLoading } = useBrand();
  const { currentBusiness, isLoading: businessLoading } = useBusiness();
  const [canvasLevel, setCanvasLevel] = useState<CanvasLevel>("brand");
  const [activeTab, setActiveTab] = useState<CanvasTab>("business_model");
  
  const {
    isLoading,
    addItem,
    updateItem,
    updateItemColor,
    deleteItem,
    getItemsByBlock,
  } = useBusinessCanvas(canvasLevel);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<BlockConfig | null>(null);

  const handleAddClick = (block: BlockConfig) => {
    setSelectedBlock(block);
    setDialogOpen(true);
  };

  const handleAddItem = async (content: string, color: string) => {
    if (selectedBlock) {
      await addItem(selectedBlock.type, content, color);
    }
  };

  const contextLoading = brandLoading || businessLoading;
  const hasValidContext = canvasLevel === "business" ? currentBusiness : currentBrand;

  if (contextLoading || isLoading) {
    return (
      <AppLayout>
        <div className="h-full flex flex-col p-6">
          <div className="mb-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <div className="flex-1 grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!hasValidContext) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            No {canvasLevel === "business" ? "Business" : "Brand"} Selected
          </h2>
          <p className="text-muted-foreground">
            Please select a {canvasLevel === "business" ? "business" : "brand"} from the sidebar to view its Business Canvas.
          </p>
        </div>
      </AppLayout>
    );
  }

  const contextName = canvasLevel === "business" 
    ? currentBusiness?.name 
    : currentBrand?.name;
  
  const contextColor = canvasLevel === "business"
    ? currentBusiness?.primary_color
    : currentBrand?.primary_color;

  const renderBlock = (block: BlockConfig, className?: string) => (
    <div key={block.type} className={className}>
      <CanvasBlock
        title={block.title}
        description={block.description}
        colorAccent={block.color}
        items={getItemsByBlock(block.type)}
        onAddClick={() => handleAddClick(block)}
        onUpdateItem={updateItem}
        onUpdateItemColor={updateItemColor}
        onDeleteItem={deleteItem}
        className="h-full"
      />
    </div>
  );

  return (
    <AppLayout>
      <div className="h-full flex flex-col p-6">
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: contextColor || "#6366f1" }}
              >
                {canvasLevel === "business" ? (
                  <Building className="h-5 w-5 text-white" />
                ) : (
                  <Tag className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">
                    Business Model Canvas
                  </h1>
                  <Badge variant={canvasLevel === "business" ? "default" : "secondary"}>
                    {canvasLevel === "business" ? "Company-wide" : "Brand"}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  Strategic planning for{" "}
                  <span className="font-medium text-foreground">
                    {contextName}
                  </span>
                </p>
              </div>
            </div>
            
            {/* Level Toggle */}
            <Tabs value={canvasLevel} onValueChange={(v) => setCanvasLevel(v as CanvasLevel)}>
              <TabsList>
                <TabsTrigger value="business" className="gap-2" disabled={!currentBusiness}>
                  <Building className="h-4 w-4" />
                  Business
                </TabsTrigger>
                <TabsTrigger value="brand" className="gap-2" disabled={!currentBrand}>
                  <Tag className="h-4 w-4" />
                  Brand
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Canvas Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as CanvasTab)} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mb-4 w-fit">
            <TabsTrigger value="business_model" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              Business Model
            </TabsTrigger>
            <TabsTrigger value="strategy" className="gap-2">
              <Target className="h-4 w-4" />
              Strategy
            </TabsTrigger>
            <TabsTrigger value="operations" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Operations & Metrics
            </TabsTrigger>
          </TabsList>

          {/* Business Model Tab - Original BMC Layout */}
          <TabsContent value="business_model" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-10 grid-rows-6 gap-2 min-h-[600px]">
                {/* Row 1-4: Main blocks */}
                {/* Key Partners - spans 2 cols, 4 rows */}
                {renderBlock(bmcBlockConfigs[0], "col-span-2 row-span-4")}

                {/* Key Activities - spans 2 cols, 2 rows */}
                {renderBlock(bmcBlockConfigs[1], "col-span-2 row-span-2")}

                {/* Value Propositions - spans 2 cols, 4 rows (center) */}
                {renderBlock(bmcBlockConfigs[3], "col-span-2 row-span-4")}

                {/* Customer Relationships - spans 2 cols, 2 rows */}
                {renderBlock(bmcBlockConfigs[4], "col-span-2 row-span-2")}

                {/* Customer Segments - spans 2 cols, 4 rows */}
                {renderBlock(bmcBlockConfigs[6], "col-span-2 row-span-4")}

                {/* Key Resources - spans 2 cols, 2 rows (below Key Activities) */}
                {renderBlock(bmcBlockConfigs[2], "col-span-2 row-span-2 col-start-3 row-start-3")}

                {/* Channels - spans 2 cols, 2 rows (below Customer Relationships) */}
                {renderBlock(bmcBlockConfigs[5], "col-span-2 row-span-2 col-start-7 row-start-3")}

                {/* Row 5-6: Bottom blocks */}
                {/* Cost Structure - spans 5 cols, 2 rows */}
                {renderBlock(bmcBlockConfigs[7], "col-span-5 row-span-2 col-start-1 row-start-5")}

                {/* Revenue Streams - spans 5 cols, 2 rows */}
                {renderBlock(bmcBlockConfigs[8], "col-span-5 row-span-2 col-start-6 row-start-5")}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Strategy Tab - 2x2 Grid */}
          <TabsContent value="strategy" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-2 grid-rows-2 gap-4 min-h-[500px]">
                {strategyBlockConfigs.map((block) => renderBlock(block, "min-h-[240px]"))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Operations & Metrics Tab - 2x2 Grid */}
          <TabsContent value="operations" className="flex-1 min-h-0 mt-0">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-2 grid-rows-2 gap-4 min-h-[500px]">
                {operationsBlockConfigs.map((block) => renderBlock(block, "min-h-[240px]"))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Add Item Dialog */}
        <AddCanvasItemDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          blockType={selectedBlock?.type || null}
          blockLabel={selectedBlock?.title || ""}
          onAdd={handleAddItem}
        />
      </div>
    </AppLayout>
  );
}
