import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { CanvasBlock } from "@/components/canvas/CanvasBlock";
import { AddCanvasItemDialog } from "@/components/canvas/AddCanvasItemDialog";
import { useBusinessCanvas, CanvasBlockType, CanvasLevel } from "@/hooks/useBusinessCanvas";
import { useBrand } from "@/contexts/BrandContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Tag, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BlockConfig {
  type: CanvasBlockType;
  title: string;
  description: string;
  color: string;
}

const blockConfigs: BlockConfig[] = [
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

export default function BusinessCanvas() {
  const { currentBrand, isLoading: brandLoading } = useBrand();
  const { currentBusiness, isLoading: businessLoading } = useBusiness();
  const [canvasLevel, setCanvasLevel] = useState<CanvasLevel>("brand");
  
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
          <div className="flex-1 grid grid-cols-5 grid-rows-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-full min-h-[150px]" />
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

        {/* Canvas Grid - Following BMC standard layout */}
        <div className="flex-1 min-h-0 grid grid-cols-10 grid-rows-6 gap-2">
          {/* Row 1-4: Main blocks */}
          {/* Key Partners - spans 2 cols, 4 rows */}
          <div className="col-span-2 row-span-4">
            <CanvasBlock
              title={blockConfigs[0].title}
              description={blockConfigs[0].description}
              colorAccent={blockConfigs[0].color}
              items={getItemsByBlock(blockConfigs[0].type)}
              onAddClick={() => handleAddClick(blockConfigs[0])}
              onUpdateItem={updateItem}
              onUpdateItemColor={updateItemColor}
              onDeleteItem={deleteItem}
              className="h-full"
            />
          </div>

          {/* Key Activities - spans 2 cols, 2 rows */}
          <div className="col-span-2 row-span-2">
            <CanvasBlock
              title={blockConfigs[1].title}
              description={blockConfigs[1].description}
              colorAccent={blockConfigs[1].color}
              items={getItemsByBlock(blockConfigs[1].type)}
              onAddClick={() => handleAddClick(blockConfigs[1])}
              onUpdateItem={updateItem}
              onUpdateItemColor={updateItemColor}
              onDeleteItem={deleteItem}
              className="h-full"
            />
          </div>

          {/* Value Propositions - spans 2 cols, 4 rows (center) */}
          <div className="col-span-2 row-span-4">
            <CanvasBlock
              title={blockConfigs[3].title}
              description={blockConfigs[3].description}
              colorAccent={blockConfigs[3].color}
              items={getItemsByBlock(blockConfigs[3].type)}
              onAddClick={() => handleAddClick(blockConfigs[3])}
              onUpdateItem={updateItem}
              onUpdateItemColor={updateItemColor}
              onDeleteItem={deleteItem}
              className="h-full"
            />
          </div>

          {/* Customer Relationships - spans 2 cols, 2 rows */}
          <div className="col-span-2 row-span-2">
            <CanvasBlock
              title={blockConfigs[4].title}
              description={blockConfigs[4].description}
              colorAccent={blockConfigs[4].color}
              items={getItemsByBlock(blockConfigs[4].type)}
              onAddClick={() => handleAddClick(blockConfigs[4])}
              onUpdateItem={updateItem}
              onUpdateItemColor={updateItemColor}
              onDeleteItem={deleteItem}
              className="h-full"
            />
          </div>

          {/* Customer Segments - spans 2 cols, 4 rows */}
          <div className="col-span-2 row-span-4">
            <CanvasBlock
              title={blockConfigs[6].title}
              description={blockConfigs[6].description}
              colorAccent={blockConfigs[6].color}
              items={getItemsByBlock(blockConfigs[6].type)}
              onAddClick={() => handleAddClick(blockConfigs[6])}
              onUpdateItem={updateItem}
              onUpdateItemColor={updateItemColor}
              onDeleteItem={deleteItem}
              className="h-full"
            />
          </div>

          {/* Key Resources - spans 2 cols, 2 rows (below Key Activities) */}
          <div className="col-span-2 row-span-2 col-start-3 row-start-3">
            <CanvasBlock
              title={blockConfigs[2].title}
              description={blockConfigs[2].description}
              colorAccent={blockConfigs[2].color}
              items={getItemsByBlock(blockConfigs[2].type)}
              onAddClick={() => handleAddClick(blockConfigs[2])}
              onUpdateItem={updateItem}
              onUpdateItemColor={updateItemColor}
              onDeleteItem={deleteItem}
              className="h-full"
            />
          </div>

          {/* Channels - spans 2 cols, 2 rows (below Customer Relationships) */}
          <div className="col-span-2 row-span-2 col-start-7 row-start-3">
            <CanvasBlock
              title={blockConfigs[5].title}
              description={blockConfigs[5].description}
              colorAccent={blockConfigs[5].color}
              items={getItemsByBlock(blockConfigs[5].type)}
              onAddClick={() => handleAddClick(blockConfigs[5])}
              onUpdateItem={updateItem}
              onUpdateItemColor={updateItemColor}
              onDeleteItem={deleteItem}
              className="h-full"
            />
          </div>

          {/* Row 5-6: Bottom blocks */}
          {/* Cost Structure - spans 5 cols, 2 rows */}
          <div className="col-span-5 row-span-2 col-start-1 row-start-5">
            <CanvasBlock
              title={blockConfigs[7].title}
              description={blockConfigs[7].description}
              colorAccent={blockConfigs[7].color}
              items={getItemsByBlock(blockConfigs[7].type)}
              onAddClick={() => handleAddClick(blockConfigs[7])}
              onUpdateItem={updateItem}
              onUpdateItemColor={updateItemColor}
              onDeleteItem={deleteItem}
              className="h-full"
            />
          </div>

          {/* Revenue Streams - spans 5 cols, 2 rows */}
          <div className="col-span-5 row-span-2 col-start-6 row-start-5">
            <CanvasBlock
              title={blockConfigs[8].title}
              description={blockConfigs[8].description}
              colorAccent={blockConfigs[8].color}
              items={getItemsByBlock(blockConfigs[8].type)}
              onAddClick={() => handleAddClick(blockConfigs[8])}
              onUpdateItem={updateItem}
              onUpdateItemColor={updateItemColor}
              onDeleteItem={deleteItem}
              className="h-full"
            />
          </div>
        </div>

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
