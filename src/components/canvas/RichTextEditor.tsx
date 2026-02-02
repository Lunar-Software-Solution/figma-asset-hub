import { useRef, useCallback } from "react";
import { Bold, Italic, Heading2, List, ListOrdered, Code, Link, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

type FormatType = "bold" | "italic" | "heading" | "bullet" | "numbered" | "code" | "link" | "quote";

const toolbarButtons: { type: FormatType; icon: typeof Bold; label: string; shortcut?: string }[] = [
  { type: "bold", icon: Bold, label: "Bold", shortcut: "Ctrl+B" },
  { type: "italic", icon: Italic, label: "Italic", shortcut: "Ctrl+I" },
  { type: "heading", icon: Heading2, label: "Heading" },
  { type: "bullet", icon: List, label: "Bullet List" },
  { type: "numbered", icon: ListOrdered, label: "Numbered List" },
  { type: "code", icon: Code, label: "Code" },
  { type: "link", icon: Link, label: "Link" },
  { type: "quote", icon: Quote, label: "Quote" },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  className,
  minHeight = "200px",
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = useCallback(
    (format: FormatType) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = value.substring(start, end);
      const beforeText = value.substring(0, start);
      const afterText = value.substring(end);

      let newText = "";
      let cursorOffset = 0;

      const formats: Record<FormatType, () => { text: string; offset: number }> = {
        bold: () => ({
          text: `**${selected || "bold text"}**`,
          offset: selected ? selected.length + 4 : 2,
        }),
        italic: () => ({
          text: `*${selected || "italic text"}*`,
          offset: selected ? selected.length + 2 : 1,
        }),
        heading: () => ({
          text: `\n## ${selected || "Heading"}\n`,
          offset: selected ? selected.length + 5 : 4,
        }),
        bullet: () => ({
          text: `\n- ${selected || "List item"}\n`,
          offset: selected ? selected.length + 4 : 3,
        }),
        numbered: () => ({
          text: `\n1. ${selected || "List item"}\n`,
          offset: selected ? selected.length + 5 : 4,
        }),
        code: () => ({
          text: selected.includes("\n")
            ? `\n\`\`\`\n${selected || "code"}\n\`\`\`\n`
            : `\`${selected || "code"}\``,
          offset: selected ? (selected.includes("\n") ? selected.length + 8 : selected.length + 2) : 1,
        }),
        link: () => ({
          text: `[${selected || "link text"}](url)`,
          offset: selected ? selected.length + 3 : 1,
        }),
        quote: () => ({
          text: `\n> ${selected || "Quote"}\n`,
          offset: selected ? selected.length + 4 : 3,
        }),
      };

      const result = formats[format]();
      newText = beforeText + result.text + afterText;
      cursorOffset = start + result.offset;

      onChange(newText);

      // Set cursor position after state update
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          if (!selected) {
            // Select the placeholder text
            const placeholderStart = start + (format === "bold" ? 2 : format === "italic" ? 1 : format === "link" ? 1 : format === "code" ? 1 : 3);
            const placeholderEnd = cursorOffset;
            textarea.setSelectionRange(placeholderStart, placeholderEnd);
          } else {
            textarea.setSelectionRange(cursorOffset, cursorOffset);
          }
        }
      }, 0);
    },
    [value, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "b") {
          e.preventDefault();
          insertFormatting("bold");
        } else if (e.key === "i") {
          e.preventDefault();
          insertFormatting("italic");
        }
      }
    },
    [insertFormatting]
  );

  return (
    <div className={cn("flex flex-col border rounded-lg bg-background", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-2 border-b bg-muted/30">
        {toolbarButtons.map((btn) => (
          <Tooltip key={btn.type}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => insertFormatting(btn.type)}
              >
                <btn.icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {btn.label}
              {btn.shortcut && (
                <span className="ml-2 text-muted-foreground text-xs">{btn.shortcut}</span>
              )}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Editor */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 border-0 rounded-none rounded-b-lg resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
        style={{ minHeight }}
      />
    </div>
  );
}
