

# Plan: Add Strategic Initiatives as Top-Level Entity with Campaigns Nested Under

## Overview
Create a new **Strategic Initiatives** module at the same hierarchy level as the current Campaigns page, then restructure Campaigns to be children of Strategic Initiatives. This creates a clear planning hierarchy:

```text
Business -> Strategic Initiative -> Campaign -> Posts
```

## Current vs. Proposed Structure

**Current Navigation:**
- Dashboard
- Business Overview
- **Campaigns** (standalone)
- Calendar
- Asset Library
- Collections
- Figma Hub
- Business Canvas
- Team
- Analytics

**Proposed Navigation:**
- Dashboard
- Business Overview
- **Strategic Initiatives** (new - replaces Campaigns in nav)
- Calendar
- Asset Library
- Collections
- Figma Hub
- Business Canvas
- Team
- Analytics

When you click into a Strategic Initiative, you see its Campaigns within that detail view.

---

## Implementation Plan

### Phase 1: Database Schema

**Create `strategic_initiatives` table:**

```sql
CREATE TABLE public.strategic_initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status initiative_status NOT NULL DEFAULT 'planning',
  priority initiative_priority NOT NULL DEFAULT 'medium',
  
  -- Planning fields
  strategic_goals JSONB DEFAULT '[]'::jsonb,
  action_plan TEXT,
  timeline_start DATE,
  timeline_end DATE,
  resources_needed TEXT,
  risks TEXT,
  stakeholders JSONB DEFAULT '[]'::jsonb,
  success_metrics JSONB DEFAULT '[]'::jsonb,
  
  -- Hierarchy
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Metadata
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create status enum
CREATE TYPE public.initiative_status AS ENUM (
  'planning',
  'in_progress', 
  'on_hold',
  'completed',
  'cancelled'
);

-- Create priority enum
CREATE TYPE public.initiative_priority AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- Add initiative_id to campaigns table
ALTER TABLE public.campaigns 
ADD COLUMN initiative_id UUID REFERENCES strategic_initiatives(id) ON DELETE SET NULL;

-- RLS Policies
ALTER TABLE public.strategic_initiatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view initiatives"
  ON public.strategic_initiatives FOR SELECT
  USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "Editors can create initiatives"
  ON public.strategic_initiatives FOR INSERT
  WITH CHECK (can_edit_team(auth.uid(), team_id));

CREATE POLICY "Editors can update initiatives"
  ON public.strategic_initiatives FOR UPDATE
  USING (can_edit_team(auth.uid(), team_id));

CREATE POLICY "Editors can delete initiatives"
  ON public.strategic_initiatives FOR DELETE
  USING (can_edit_team(auth.uid(), team_id));

-- Index for performance
CREATE INDEX idx_initiatives_team_id ON public.strategic_initiatives(team_id);
CREATE INDEX idx_initiatives_business_id ON public.strategic_initiatives(business_id);
CREATE INDEX idx_campaigns_initiative_id ON public.campaigns(initiative_id);
```

### Phase 2: TypeScript Types & Hook

**New file: `src/hooks/useStrategicInitiatives.ts`**

```typescript
export type StrategicInitiative = Tables<"strategic_initiatives">;
export type InitiativeStatus = Enums<"initiative_status">;
export type InitiativePriority = Enums<"initiative_priority">;

export const INITIATIVE_STATUS_CONFIG = {
  planning: { label: "Planning", color: "bg-blue-500/20 text-blue-700" },
  in_progress: { label: "In Progress", color: "bg-green-500/20 text-green-700" },
  on_hold: { label: "On Hold", color: "bg-yellow-500/20 text-yellow-700" },
  completed: { label: "Completed", color: "bg-purple-500/20 text-purple-700" },
  cancelled: { label: "Cancelled", color: "bg-gray-500/20 text-gray-700" },
};

export function useStrategicInitiatives() {
  // Fetch, create, update, delete initiatives
  // Filter by business/brand context
}
```

### Phase 3: UI Components

**New Files to Create:**

| File | Purpose |
|------|---------|
| `src/pages/StrategicInitiatives.tsx` | Main listing page |
| `src/pages/InitiativeDetail.tsx` | Detail view with campaigns |
| `src/components/initiatives/InitiativeCard.tsx` | Card component for list |
| `src/components/initiatives/InitiativeFilters.tsx` | Search & filters |
| `src/components/initiatives/InitiativeList.tsx` | Grid/list view |
| `src/components/initiatives/CreateInitiativeDialog.tsx` | Create form |
| `src/components/initiatives/EditInitiativeDialog.tsx` | Edit form |
| `src/components/initiatives/DeleteInitiativeDialog.tsx` | Delete confirmation |
| `src/components/initiatives/InitiativeStatusBadge.tsx` | Status display |
| `src/components/initiatives/InitiativePriorityBadge.tsx` | Priority display |

**Initiative Detail Page Layout:**

```text
+------------------------------------------------------------------+
| <- Back to Initiatives                                            |
+------------------------------------------------------------------+
| [Initiative Name]                          [Edit] [Delete]        |
| Status: In Progress | Priority: High | Brand: BraxCloud          |
+------------------------------------------------------------------+
| [Overview] [Campaigns] [Timeline] [Resources]  <- Tabs            |
+------------------------------------------------------------------+

Overview Tab:
+------------------------------------------------------------------+
| Strategic Goals        | Action Plan                              |
| - Goal 1               | 1. Step one...                          |
| - Goal 2               | 2. Step two...                          |
+------------------------------------------------------------------+
| Risks & Mitigation     | Success Metrics                         |
| - Risk 1...            | - KPI 1: Target                         |
+------------------------------------------------------------------+

Campaigns Tab:
+------------------------------------------------------------------+
| [+ New Campaign]                           [Search] [Filter]      |
+------------------------------------------------------------------+
| Campaign Card | Campaign Card | Campaign Card                     |
| Campaign Card | Campaign Card | Campaign Card                     |
+------------------------------------------------------------------+
```

### Phase 4: Navigation Updates

**Update `src/components/layout/AppSidebar.tsx`:**

```typescript
import { Target } from "lucide-react"; // or Rocket, Flag

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Building2, label: "Business Overview", path: "/business" },
  { icon: Target, label: "Strategic Initiatives", path: "/initiatives" }, // NEW
  { icon: CalendarDays, label: "Calendar", path: "/calendar" },
  // ... rest unchanged
];
// Remove Campaigns from top-level nav - it's now accessed through Initiatives
```

### Phase 5: Route Updates

**Update `src/App.tsx`:**

```typescript
import StrategicInitiatives from "./pages/StrategicInitiatives";
import InitiativeDetail from "./pages/InitiativeDetail";

// Add routes:
<Route path="/initiatives" element={<ProtectedRoute><StrategicInitiatives /></ProtectedRoute>} />
<Route path="/initiatives/:id" element={<ProtectedRoute><InitiativeDetail /></ProtectedRoute>} />
// Keep /campaigns for backward compatibility but redirect or filter by initiative
```

### Phase 6: Update Campaigns

**Modify Campaign Dialog & Hook:**

1. Add `initiative_id` field to `CreateCampaignDialog.tsx`
2. Update `useCampaigns.ts` to accept optional `initiativeId` filter
3. Update campaign cards to show parent initiative

### Phase 7: Mock Data

**Add to `src/lib/mockData.ts`:**

```typescript
export const mockStrategicInitiatives = [
  {
    id: "mock-initiative-1",
    name: "Q1 2026 Market Expansion",
    description: "Expand BraxTech presence into European and Asian markets",
    status: "in_progress",
    priority: "high",
    strategic_goals: [
      { goal: "Establish EU headquarters", target: "Q1 2026" },
      { goal: "Launch localized products", target: "Q2 2026" },
    ],
    action_plan: "1. Legal entity setup\n2. Hire regional teams\n3. Partner recruitment",
    timeline_start: "2026-01-01",
    timeline_end: "2026-06-30",
    resources_needed: "$2M budget, 15 new hires",
    risks: "Regulatory compliance, currency fluctuation",
    stakeholders: [
      { name: "Sarah Chen", role: "Project Lead" },
      { name: "Marcus Weber", role: "EU Operations" },
    ],
    success_metrics: [
      { metric: "EU Revenue", target: "$5M", current: "$1.2M" },
      { metric: "Partner Count", target: "25", current: "8" },
    ],
    business_id: "mock-business-1",
    brand_id: null,
    team_id: "mock-team-1",
    created_by: "mock-user-1",
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "mock-initiative-2",
    name: "AI Product Portfolio Launch",
    description: "Launch comprehensive AI/ML product suite under BraxAI brand",
    status: "planning",
    priority: "critical",
    strategic_goals: [
      { goal: "Launch 3 AI products", target: "2026" },
      { goal: "Achieve $10M ARR", target: "End of 2026" },
    ],
    // ... more fields
  },
];

// Update mockCampaigns to include initiative_id
export const mockCampaigns = [
  {
    ...existingCampaign,
    initiative_id: "mock-initiative-1", // Link to initiative
  },
];
```

---

## Files Summary

### New Files to Create
| File | Purpose |
|------|---------|
| `supabase/migrations/[timestamp]_add_strategic_initiatives.sql` | Database schema |
| `src/hooks/useStrategicInitiatives.ts` | Data hook |
| `src/pages/StrategicInitiatives.tsx` | List page |
| `src/pages/InitiativeDetail.tsx` | Detail page with campaigns |
| `src/components/initiatives/InitiativeCard.tsx` | Card component |
| `src/components/initiatives/InitiativeFilters.tsx` | Filters |
| `src/components/initiatives/InitiativeList.tsx` | List/grid |
| `src/components/initiatives/CreateInitiativeDialog.tsx` | Create dialog |
| `src/components/initiatives/EditInitiativeDialog.tsx` | Edit dialog |
| `src/components/initiatives/DeleteInitiativeDialog.tsx` | Delete dialog |
| `src/components/initiatives/InitiativeStatusBadge.tsx` | Status badge |
| `src/components/initiatives/InitiativePriorityBadge.tsx` | Priority badge |
| `src/components/initiatives/index.ts` | Barrel export |

### Files to Modify
| File | Changes |
|------|---------|
| `src/App.tsx` | Add initiative routes |
| `src/components/layout/AppSidebar.tsx` | Update nav (replace Campaigns with Initiatives) |
| `src/hooks/useCampaigns.ts` | Add `initiativeId` filter |
| `src/components/campaigns/CreateCampaignDialog.tsx` | Add initiative selector |
| `src/components/campaigns/CampaignCard.tsx` | Show parent initiative |
| `src/lib/mockData.ts` | Add mock initiatives, update campaigns |
| `src/pages/Dashboard.tsx` | Update stats to show initiatives |

---

## Data Flow

```text
User clicks "Strategic Initiatives" in sidebar
        |
        v
StrategicInitiatives.tsx loads initiatives via useStrategicInitiatives()
        |
        v
User clicks an Initiative card
        |
        v
InitiativeDetail.tsx loads with initiative ID from URL
        |
        v
Campaigns tab shows campaigns filtered by initiative_id
        |
        v
User can create new campaign linked to this initiative
```

---

## Summary

This restructuring:

1. Creates **Strategic Initiatives** as a first-class entity
2. Nests **Campaigns** under initiatives for better organization
3. Maintains all existing campaign functionality
4. Adds planning fields (goals, risks, metrics) directly to initiatives
5. Updates navigation to reflect new hierarchy
6. Provides a detail view with tabs for managing initiative components

