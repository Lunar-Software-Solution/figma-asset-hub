

# Business Canvas Maker Implementation Plan

## What is a Business Model Canvas?

The Business Model Canvas (BMC) is a strategic management tool created by Alexander Osterwalder. It's a visual template with 9 building blocks that helps businesses plan and document their business model on a single page.

### The 9 Building Blocks

| Block | Description |
|-------|-------------|
| **Key Partners** | Strategic alliances, suppliers, and partners |
| **Key Activities** | Most important actions to execute value proposition |
| **Key Resources** | Assets needed to create value (human, financial, physical, intellectual) |
| **Value Propositions** | Products/services that create value for customers |
| **Customer Relationships** | How you interact with customer segments |
| **Channels** | How you deliver value to customers |
| **Customer Segments** | Who you're creating value for |
| **Cost Structure** | All costs to operate the business model |
| **Revenue Streams** | How the business earns income |

### Canvas Layout

The canvas uses a specific visual layout:

```text
+------------------+------------------+------------------+------------------+------------------+
|                  |                  |                  |                  |                  |
|  Key Partners    |  Key Activities  |                  | Customer         | Customer         |
|                  |                  |  Value           | Relationships    | Segments         |
|                  +------------------+  Propositions    +------------------+                  |
|                  |                  |                  |                  |                  |
|                  |  Key Resources   |                  | Channels         |                  |
|                  |                  |                  |                  |                  |
+------------------+------------------+------------------+------------------+------------------+
|                                                        |                                     |
|                    Cost Structure                      |           Revenue Streams           |
|                                                        |                                     |
+--------------------------------------------------------+-------------------------------------+
```

---

## How This Fits DesignVault

Since DesignVault already has a **Brand Management** system with hierarchical brand/sub-brand organization, the Business Canvas Maker becomes a powerful strategic planning tool for each brand:

- Each **brand** can have its own Business Model Canvas
- Teams can visually document and iterate on brand strategy
- Canvas data is stored per-brand and filtered by the existing BrandContext
- Collaborative editing with sticky-note style items

---

## Implementation Overview

### New Page: Business Canvas

A dedicated page at `/canvas` that provides:

1. **Interactive Canvas Grid** - The 9-block layout with drag-and-drop capability
2. **Sticky Note Items** - Add, edit, and delete items within each block
3. **Brand-Scoped** - Each canvas is tied to the currently selected brand
4. **Color-Coded Blocks** - Visual distinction between different sections
5. **Export/Print** - Generate PDF or image of the canvas

---

## What You'll Get

### Visual Design

- Clean, minimal aesthetic matching DesignVault's Linear/Notion-inspired style
- Responsive grid layout adapting to screen sizes
- Drag-and-drop sticky notes with smooth animations
- Color-coded sections for easy visual scanning
- Hover states and quick actions for editing

### Features

- **Create/Edit Canvas** - One canvas per brand
- **Add Items** - Click to add sticky notes to any block
- **Inline Editing** - Click to edit text directly
- **Color Options** - Choose note colors (yellow, pink, blue, green)
- **Delete Items** - Remove notes with confirmation
- **Auto-Save** - Changes saved automatically
- **Empty States** - Helpful prompts for new canvases

---

## Technical Details

### Database Changes

A new `business_canvases` table to store canvas data:

```text
business_canvases
- id (uuid, primary key)
- brand_id (uuid, references brands)
- team_id (uuid, references teams)
- created_by (uuid)
- created_at, updated_at (timestamps)

business_canvas_items
- id (uuid, primary key)
- canvas_id (uuid, references business_canvases)
- block_type (enum: key_partners, key_activities, etc.)
- content (text)
- color (text)
- position (integer for ordering)
- created_at, updated_at (timestamps)
```

### New Components

| Component | Purpose |
|-----------|---------|
| `BusinessCanvas.tsx` | Main canvas page component |
| `CanvasBlock.tsx` | Individual block container (9 total) |
| `CanvasItem.tsx` | Sticky note component with edit/delete |
| `AddItemDialog.tsx` | Modal for adding new items |

### Files to Create

1. `src/pages/BusinessCanvas.tsx` - Main page
2. `src/components/canvas/CanvasBlock.tsx` - Block container
3. `src/components/canvas/CanvasItem.tsx` - Sticky note
4. `src/components/canvas/AddCanvasItemDialog.tsx` - Add item modal
5. `src/hooks/useBusinessCanvas.ts` - Data fetching hook

### Files to Modify

1. `src/App.tsx` - Add new route `/canvas`
2. `src/components/layout/AppSidebar.tsx` - Add Canvas link to navigation

### Navigation Update

Add "Business Canvas" to the sidebar navigation between "Figma Hub" and "Team":

```text
Dashboard
Asset Library
Collections
Figma Hub
Business Canvas  <-- NEW
Team
Analytics
Settings
```

---

## Summary

This implementation adds a full-featured Business Model Canvas tool to DesignVault, allowing teams to strategically plan each brand using the industry-standard 9-block framework. The design follows the existing clean aesthetic while adding interactive sticky-note functionality for collaborative planning.

