

# Plan: Add Long-Form Rich Text Editor with AI Capabilities to Canvas Notes

## Overview
Enhance the Business Canvas notes to support long-form markdown content with a rich text editor, plus AI-powered writing and editing features. Currently, notes are simple text fields with basic inline editing. This upgrade will provide a full-screen editor dialog with markdown support, formatting toolbar, and AI assistance.

## Current State
- **CanvasItem.tsx**: Simple sticky note with inline textarea editing
- **AddCanvasItemDialog.tsx**: Basic dialog with plain Textarea component
- **Content Storage**: Plain text in `business_canvas_items.content` field (text type - already supports long content)
- **No Rich Text**: No markdown rendering or formatting toolbar exists

## Proposed Solution

### User Experience Flow

1. **Click "Add your first note"** -> Opens expanded editor dialog
2. **Click existing note** -> Opens editor dialog with current content
3. **Editor Features**:
   - Full-screen dialog with markdown editor
   - Formatting toolbar (bold, italic, lists, headings, links)
   - Live markdown preview panel
   - AI assistant panel for content generation and editing
4. **AI Capabilities**:
   - "Write with AI" - Generate content based on prompts
   - "Improve" - Enhance existing text
   - "Expand" - Add more detail to content
   - "Summarize" - Condense lengthy content
   - "Fix Grammar" - Correct writing issues

---

## Implementation Plan

### Phase 1: Create Rich Text Editor Component

**New File: `src/components/canvas/RichTextEditor.tsx`**

A reusable markdown editor component with:
- Textarea for markdown input with formatting toolbar
- Preview pane showing rendered markdown
- Toggle between edit/preview/split view modes
- Keyboard shortcuts for common formatting (Ctrl+B, Ctrl+I, etc.)

```typescript
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}
```

Toolbar buttons:
- **Bold** (B) - Wraps selection with `**`
- **Italic** (I) - Wraps selection with `*`
- **Heading** (H) - Adds `## ` prefix
- **Bullet List** - Adds `- ` prefix
- **Numbered List** - Adds `1. ` prefix
- **Link** - Wraps with `[text](url)`
- **Code** - Wraps with backticks

### Phase 2: Create AI Writing Assistant

**New File: `src/components/canvas/AIWritingAssistant.tsx`**

Collapsible AI panel with:
- Text input for prompts
- Quick action buttons (Improve, Expand, Summarize, Fix Grammar)
- Streaming response display
- "Apply" button to insert AI-generated content

**New File: `supabase/functions/canvas-ai/index.ts`**

Edge function to handle AI requests using Lovable AI:
- System prompt tailored for business canvas content
- Supports different action types (write, improve, expand, summarize, fix)
- Streams response back to client

### Phase 3: Create Full Canvas Note Editor Dialog

**New File: `src/components/canvas/CanvasNoteEditorDialog.tsx`**

Full-screen editor dialog combining:
- Rich text editor with toolbar
- Markdown preview panel (toggle or split view)
- AI assistant panel (collapsible sidebar)
- Note color selector
- Auto-save indicator
- Cancel/Save actions

```typescript
interface CanvasNoteEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialContent?: string;
  initialColor?: string;
  blockLabel: string;
  onSave: (content: string, color: string) => void;
  mode: "create" | "edit";
}
```

Layout structure:
```text
+------------------------------------------------------------------+
| Block Name                              [Preview] [Split]  [X]   |
+------------------------------------------------------------------+
| Toolbar: B | I | H | List | Code | Link          | Color Picker  |
+------------------------------------------------------------------+
| +------------------------+  +------------------------------+     |
| | Markdown Editor        |  | Preview                      |     |
| | (textarea)             |  | (rendered markdown)          |     |
| |                        |  |                              |     |
| |                        |  |                              |     |
| +------------------------+  +------------------------------+     |
+------------------------------------------------------------------+
| AI Assistant                                          [Collapse] |
| +--------------------------------------------------------------+ |
| | [Write with AI...                                    ] [Go]  | |
| | [Improve] [Expand] [Summarize] [Fix Grammar]                 | |
| +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
|                                        [Cancel]  [Save Note]     |
+------------------------------------------------------------------+
```

### Phase 4: Update Existing Components

**Modify: `src/components/canvas/CanvasItem.tsx`**

- Keep sticky note appearance for display
- Show markdown preview (truncated) instead of raw text
- Double-click opens full editor dialog
- Single click no longer enables inline editing (opens dialog instead)

**Modify: `src/components/canvas/CanvasBlock.tsx`**

- Pass new `onEditItem` handler
- Update click behavior for notes

**Modify: `src/components/canvas/AddCanvasItemDialog.tsx`**

- Replace with redirect to new CanvasNoteEditorDialog
- Or keep for quick notes, add "Expand Editor" button

**Modify: `src/pages/BusinessCanvas.tsx`**

- Add state for editor dialog
- Add `editItem` handler for opening existing notes
- Connect editor dialog to canvas operations

### Phase 5: Markdown Rendering

**Add dependency or simple implementation:**

Option A: Use `marked` or `react-markdown` library for rendering
Option B: Simple regex-based rendering for basic markdown (bold, italic, lists, headings)

For the preview pane, render markdown to HTML safely.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/canvas/RichTextEditor.tsx` | Markdown editor with formatting toolbar |
| `src/components/canvas/AIWritingAssistant.tsx` | AI panel with quick actions |
| `src/components/canvas/CanvasNoteEditorDialog.tsx` | Full editor dialog |
| `src/components/canvas/MarkdownPreview.tsx` | Markdown to HTML renderer |
| `supabase/functions/canvas-ai/index.ts` | Edge function for AI requests |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/canvas/CanvasItem.tsx` | Click opens editor, show markdown preview |
| `src/components/canvas/CanvasBlock.tsx` | Add onEditItem prop |
| `src/pages/BusinessCanvas.tsx` | Add editor dialog state and handlers |
| `supabase/config.toml` | Add canvas-ai function |

---

## Technical Details

### Edge Function: canvas-ai

```typescript
// supabase/functions/canvas-ai/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { action, content, prompt, blockType } = await req.json();
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

  const systemPrompts = {
    write: `You are a business strategist helping create content for a "${blockType}" section of a Business Model Canvas. Write clear, actionable content based on the user's request.`,
    improve: `Improve the following business canvas content. Make it clearer, more professional, and more actionable while preserving the core message.`,
    expand: `Expand on the following business canvas content with more detail, examples, and actionable insights.`,
    summarize: `Summarize the following business canvas content into a concise, impactful statement.`,
    fix: `Fix any grammar, spelling, or punctuation errors in the following text while preserving the meaning.`,
  };

  const messages = [
    { role: "system", content: systemPrompts[action] },
    { role: "user", content: action === "write" ? prompt : content },
  ];

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages,
      stream: true,
    }),
  });

  return new Response(response.body, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
});
```

### Markdown Toolbar Implementation

```typescript
const insertFormatting = (format: string) => {
  const textarea = textareaRef.current;
  if (!textarea) return;
  
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.substring(start, end);
  
  const formats = {
    bold: `**${selected || 'bold text'}**`,
    italic: `*${selected || 'italic text'}*`,
    heading: `\n## ${selected || 'Heading'}\n`,
    bullet: `\n- ${selected || 'List item'}\n`,
    code: `\`${selected || 'code'}\``,
    link: `[${selected || 'link text'}](url)`,
  };
  
  const newValue = value.substring(0, start) + formats[format] + value.substring(end);
  onChange(newValue);
};
```

### Simple Markdown Renderer

```typescript
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^- (.*)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\n/g, '<br/>');
}
```

---

## Database Changes
None required - the existing `content` column (text type) already supports long-form content.

---

## UI/UX Considerations

1. **Progressive Disclosure**: Quick notes still possible, full editor for detailed content
2. **Autosave**: Save draft locally to prevent data loss
3. **Mobile Friendly**: Editor adapts to smaller screens with stacked layout
4. **AI Loading States**: Show streaming text as AI generates content
5. **Keyboard Shortcuts**: Power users can format quickly with Ctrl+B, Ctrl+I, etc.

---

## Summary

This implementation adds:
1. **Rich Text Editor** - Markdown editing with formatting toolbar
2. **Preview Mode** - Live rendering of markdown content
3. **AI Writing Assistant** - AI-powered content generation and editing
4. **Full-Screen Dialog** - Dedicated space for long-form content creation
5. **Seamless Integration** - Works with existing canvas items and database

