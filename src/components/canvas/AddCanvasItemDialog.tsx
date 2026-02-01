import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { CanvasBlockType } from "@/hooks/useBusinessCanvas";

interface AddCanvasItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blockType: CanvasBlockType | null;
  blockLabel: string;
  onAdd: (content: string, color: string) => void;
}

const colorOptions = [
  { name: "yellow", class: "bg-yellow-200", border: "border-yellow-400" },
  { name: "pink", class: "bg-pink-200", border: "border-pink-400" },
  { name: "blue", class: "bg-blue-200", border: "border-blue-400" },
  { name: "green", class: "bg-green-200", border: "border-green-400" },
  { name: "purple", class: "bg-purple-200", border: "border-purple-400" },
  { name: "orange", class: "bg-orange-200", border: "border-orange-400" },
];

export function AddCanvasItemDialog({
  open,
  onOpenChange,
  blockLabel,
  onAdd,
}: AddCanvasItemDialogProps) {
  const [content, setContent] = useState("");
  const [selectedColor, setSelectedColor] = useState("yellow");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onAdd(content.trim(), selectedColor);
      setContent("");
      setSelectedColor("yellow");
      onOpenChange(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setContent("");
      setSelectedColor("yellow");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to {blockLabel}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Enter your note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {colorOptions.map((opt) => (
                <button
                  key={opt.name}
                  type="button"
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                    opt.class,
                    opt.border,
                    selectedColor === opt.name
                      ? "ring-2 ring-foreground ring-offset-2"
                      : ""
                  )}
                  onClick={() => setSelectedColor(opt.name)}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!content.trim()}>
              Add Note
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
