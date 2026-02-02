

# Plan: Collections Ownership by Campaign, Brand, or Business

## Overview
Extend the collections system to support ownership by campaigns, brands, or businesses. This allows assets to be organized into collections that are contextually linked to different organizational entities.

## Current State
- The `collections` table has `brand_id` but lacks `business_id` and `campaign_id`
- Assets link to collections via the `collection_assets` junction table (already working)
- The relationship: **Assets -> Collections -> (Campaign | Brand | Business)**

## Database Changes

### 1. Add New Columns to Collections Table
Add `business_id` and `campaign_id` columns to the `collections` table:

```text
collections
  - id (existing)
  - team_id (existing)
  - brand_id (existing, nullable)
  - business_id (new, nullable)
  - campaign_id (new, nullable)
  - name, description, cover_image_url, is_public (existing)
  - created_by, created_at, updated_at (existing)
```

### 2. Add Constraint for Ownership
Add a check constraint ensuring a collection belongs to exactly one owner type:
- Only ONE of `campaign_id`, `brand_id`, or `business_id` should be set
- OR all can be null (team-level collection)

### 3. Add Indexes
Create indexes on `business_id` and `campaign_id` for query performance.

## Frontend Changes

### 1. Create `useCollections` Hook
New hook for CRUD operations on collections with filtering by owner type:
- `src/hooks/useCollections.ts`
- Fetch collections filtered by current business/brand/campaign context
- Create, update, delete collection functions
- Filter by owner type (campaign, brand, business, or team-level)

### 2. Create `useAssets` Hook
New hook for CRUD operations on assets:
- `src/hooks/useAssets.ts`
- Fetch assets, optionally filtered by collection
- Upload, update, delete asset functions
- Add/remove assets from collections

### 3. Update Collections Page
Enhance `src/pages/Collections.tsx`:
- Replace mock data with real Supabase data
- Add "Create Collection" dialog with owner type selector
- Add filtering by owner type (Campaign, Brand, Business, All)
- Show owner badge on collection cards
- Add "Edit" and "Delete" functionality

### 4. Update Assets Page
Enhance `src/pages/Assets.tsx`:
- Replace mock data with real Supabase data
- Add collection assignment capability (add asset to collection)
- Filter by collection

### 5. Collection Components
Create supporting components:
- `src/components/collections/CreateCollectionDialog.tsx`
- `src/components/collections/EditCollectionDialog.tsx`
- `src/components/collections/CollectionCard.tsx`
- `src/components/collections/CollectionFilters.tsx`
- `src/components/collections/AddToCollectionDialog.tsx`

## Data Flow Diagram

```text
+------------+     +----------------+     +------------+
|  Campaign  |<----|                |---->|   Brand    |
+------------+     |   Collection   |     +------------+
                   |                |
+------------+     |  - name        |
|  Business  |<----|  - description |
+------------+     |  - is_public   |
                   +-------+--------+
                           |
                           | (collection_assets)
                           v
                   +----------------+
                   |     Asset      |
                   |  - file_url    |
                   |  - thumbnail   |
                   |  - tags        |
                   +----------------+
```

## Implementation Steps

### Phase 1: Database Migration
1. Add `business_id` column to collections (FK to businesses)
2. Add `campaign_id` column to collections (FK to campaigns)
3. Add check constraint for mutual exclusivity
4. Create indexes for new columns
5. Update RLS policies to account for campaign access

### Phase 2: Data Layer (Hooks)
1. Create `useCollections` hook with filtering and CRUD
2. Create `useAssets` hook with collection management

### Phase 3: Collections UI
1. Create collection dialog components
2. Update Collections page with real data
3. Add owner type filtering and badges

### Phase 4: Assets UI
1. Update Assets page with real data
2. Add "Add to Collection" functionality
3. Add collection-based filtering

---

## Technical Details

### Migration SQL Preview

```sql
-- Add business_id and campaign_id to collections
ALTER TABLE public.collections 
ADD COLUMN business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
ADD COLUMN campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE;

-- Add check constraint: collection can have at most one owner
ALTER TABLE public.collections 
ADD CONSTRAINT collection_single_owner CHECK (
  (CASE WHEN campaign_id IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN brand_id IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN business_id IS NOT NULL THEN 1 ELSE 0 END) <= 1
);

-- Add indexes
CREATE INDEX idx_collections_business_id ON public.collections(business_id);
CREATE INDEX idx_collections_campaign_id ON public.collections(campaign_id);
```

### Collection Types
The UI will support these collection types:
- **Campaign Collection**: Linked to a specific marketing campaign
- **Brand Collection**: Linked to a brand/sub-brand
- **Business Collection**: Linked to a business
- **Team Collection**: No specific owner (team-wide)

### Files to Create
- `src/hooks/useCollections.ts`
- `src/hooks/useAssets.ts`
- `src/components/collections/CreateCollectionDialog.tsx`
- `src/components/collections/EditCollectionDialog.tsx`
- `src/components/collections/CollectionCard.tsx`
- `src/components/collections/CollectionFilters.tsx`
- `src/components/collections/AddToCollectionDialog.tsx`

### Files to Modify
- `src/pages/Collections.tsx` - Replace mock data, add dialogs
- `src/pages/Assets.tsx` - Replace mock data, add collection management

