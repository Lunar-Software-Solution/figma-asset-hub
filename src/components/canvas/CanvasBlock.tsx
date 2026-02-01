import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CanvasItem } from "./CanvasItem";
import type { CanvasItem as CanvasItemType } from "@/hooks/useBusinessCanvas";

interface CanvasBlockProps {
  title: string;
  description: string;
  items: CanvasItemType[];
  colorAccent: string;
  onAddClick: () => void;
  onUpdateItem: (id: string, content: string) => void;
  onUpdateItemColor: (id: string, color: string) => void;
  onDeleteItem: (id: string) => void;
  className?: string;
}

export function CanvasBlock({
  title,
  description,
  items,
  colorAccent,
  onAddClick,
  onUpdateItem,
  onUpdateItemColor,
  onDeleteItem,
  className,
}: CanvasBlockProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border bg-card p-3 h-full",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: colorAccent }}
            />
            <h3 className="font-semibold text-sm text-foreground truncate">
              {title}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {description}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0 ml-1"
          onClick={onAddClick}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center py-4"
            >
              <p className="text-xs text-muted-foreground">No items yet</p>
              <Button
                variant="link"
                size="sm"
                className="text-xs h-auto py-1"
                onClick={onAddClick}
              >
                Add your first note
              </Button>
            </motion.div>
          ) : (
            items.map((item) => (
              <CanvasItem
                key={item.id}
                id={item.id}
                content={item.content}
                color={item.color}
                onUpdate={onUpdateItem}
                onUpdateColor={onUpdateItemColor}
                onDelete={onDeleteItem}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
