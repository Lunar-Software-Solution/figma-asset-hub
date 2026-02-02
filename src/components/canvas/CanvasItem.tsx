import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Palette, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MarkdownPreview } from "./MarkdownPreview";

interface CanvasItemProps {
  id: string;
  content: string;
  color: string;
  onUpdate: (id: string, content: string) => void;
  onUpdateColor: (id: string, color: string) => void;
  onDelete: (id: string) => void;
  onEdit: () => void;
}

const colorOptions = [
  { name: "yellow", class: "bg-yellow-200 hover:bg-yellow-300", border: "border-yellow-400" },
  { name: "pink", class: "bg-pink-200 hover:bg-pink-300", border: "border-pink-400" },
  { name: "blue", class: "bg-blue-200 hover:bg-blue-300", border: "border-blue-400" },
  { name: "green", class: "bg-green-200 hover:bg-green-300", border: "border-green-400" },
  { name: "purple", class: "bg-purple-200 hover:bg-purple-300", border: "border-purple-400" },
  { name: "orange", class: "bg-orange-200 hover:bg-orange-300", border: "border-orange-400" },
];

const getColorClass = (color: string) => {
  const colorOption = colorOptions.find((c) => c.name === color);
  return colorOption?.class || "bg-yellow-200 hover:bg-yellow-300";
};

const getBorderClass = (color: string) => {
  const colorOption = colorOptions.find((c) => c.name === color);
  return colorOption?.border || "border-yellow-400";
};

export function CanvasItem({
  id,
  content,
  color,
  onUpdate,
  onUpdateColor,
  onDelete,
  onEdit,
}: CanvasItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (editContent.trim() !== content) {
      onUpdate(id, editContent.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === "Escape") {
      setEditContent(content);
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "group relative rounded-md border p-2 shadow-sm transition-shadow hover:shadow-md cursor-pointer min-h-[60px]",
        getColorClass(color),
        getBorderClass(color)
      )}
      onClick={onEdit}
    >
      {/* Action buttons */}
      <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="secondary"
          size="icon"
          className="h-6 w-6 rounded-full shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Maximize2 className="h-3 w-3" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6 rounded-full shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <Palette className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="end">
            <div className="flex gap-1">
              {colorOptions.map((opt) => (
                <button
                  key={opt.name}
                  className={cn(
                    "h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
                    opt.class,
                    color === opt.name ? "ring-2 ring-foreground ring-offset-2" : ""
                  )}
                  onClick={() => onUpdateColor(id, opt.name)}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Button
          variant="destructive"
          size="icon"
          className="h-6 w-6 rounded-full shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Content - Show markdown preview */}
      <MarkdownPreview content={content} truncate className="pointer-events-none" />
    </motion.div>
  );
}
