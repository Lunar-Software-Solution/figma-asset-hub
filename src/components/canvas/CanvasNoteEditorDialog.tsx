import { useState, useEffect } from "react";
import { Eye, Edit3, Columns, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "./RichTextEditor";
import { MarkdownPreview } from "./MarkdownPreview";
import { AIWritingAssistant } from "./AIWritingAssistant";

type ViewMode = "edit" | "preview" | "split";

interface CanvasNoteEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialContent?: string;
  initialColor?: string;
  blockLabel: string;
  blockType: string;
  onSave: (content: string, color: string) => void;
  mode: "create" | "edit";
}

const colorOptions = [
  { name: "yellow", class: "bg-yellow-200", border: "border-yellow-400" },
  { name: "pink", class: "bg-pink-200", border: "border-pink-400" },
  { name: "blue", class: "bg-blue-200", border: "border-blue-400" },
  { name: "green", class: "bg-green-200", border: "border-green-400" },
  { name: "purple", class: "bg-purple-200", border: "border-purple-400" },
  { name: "orange", class: "bg-orange-200", border: "border-orange-400" },
];

export function CanvasNoteEditorDialog({
  open,
  onOpenChange,
  initialContent = "",
  initialColor = "yellow",
  blockLabel,
  blockType,
  onSave,
  mode,
}: CanvasNoteEditorDialogProps) {
  const [content, setContent] = useState(initialContent);
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [viewMode, setViewMode] = useState<ViewMode>("edit");

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setContent(initialContent);
      setSelectedColor(initialColor);
      setViewMode("edit");
    }
  }, [open, initialContent, initialColor]);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim(), selectedColor);
      onOpenChange(false);
    }
  };

  const handleApplyAIContent = (aiContent: string) => {
    setContent(aiContent);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-lg">
            {mode === "create" ? "Add to" : "Edit"} {blockLabel}
          </DialogTitle>
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList className="h-8">
                <TabsTrigger value="edit" className="h-7 px-2 text-xs gap-1">
                  <Edit3 className="h-3 w-3" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="split" className="h-7 px-2 text-xs gap-1">
                  <Columns className="h-3 w-3" />
                  Split
                </TabsTrigger>
                <TabsTrigger value="preview" className="h-7 px-2 text-xs gap-1">
                  <Eye className="h-3 w-3" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Color Picker */}
            <div className="flex items-center gap-1.5 pl-3 border-l">
              {colorOptions.map((opt) => (
                <button
                  key={opt.name}
                  type="button"
                  className={cn(
                    "h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
                    opt.class,
                    opt.border,
                    selectedColor === opt.name ? "ring-2 ring-foreground ring-offset-1" : ""
                  )}
                  onClick={() => setSelectedColor(opt.name)}
                  title={opt.name}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden p-4">
            {viewMode === "edit" && (
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Start writing your note... Use markdown for formatting."
                className="h-full"
                minHeight="100%"
              />
            )}

            {viewMode === "preview" && (
              <div className="h-full overflow-y-auto border rounded-lg p-4 bg-card">
                <MarkdownPreview content={content} />
              </div>
            )}

            {viewMode === "split" && (
              <div className="h-full grid grid-cols-2 gap-4">
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Start writing your note... Use markdown for formatting."
                  className="h-full"
                  minHeight="100%"
                />
                <div className="h-full overflow-y-auto border rounded-lg p-4 bg-card">
                  <Label className="text-xs text-muted-foreground mb-2 block">Preview</Label>
                  <MarkdownPreview content={content} />
                </div>
              </div>
            )}
          </div>

          {/* AI Assistant */}
          <AIWritingAssistant
            currentContent={content}
            blockType={blockType}
            onApplyContent={handleApplyAIContent}
          />
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!content.trim()}>
            {mode === "create" ? "Add Note" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
