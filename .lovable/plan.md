

# Reorganizing Data for Multi-Business, Multi-Brand Structure

## Current Situation

Your data currently uses a single `brands` table with a `parent_id` to create a two-level hierarchy (Brand → Sub-brand). This works for simple setups but becomes limiting when you have:

- Multiple distinct businesses (e.g., different companies or divisions)
- Each business having its own set of brands
- Each brand potentially having sub-brands

## Proposed Hierarchy

```text
Business (Company/Division)
    └── Brand
            └── Sub-brand
                    └── Canvas items
```

| Level | Example | Purpose |
|-------|---------|---------|
| **Business** | Holding Corp, Division A | Top-level organizational unit |
| **Brand** | Consumer Brand, Enterprise Brand | Main brand identity |
| **Sub-brand** | Premium Line, Budget Line | Product variations |

---

## Option A: Add Explicit "Business" Entity (Recommended)

Create a new `businesses` table as the top-level container, then link brands to businesses.

### New Structure

```text
businesses
├── id, team_id, name, description, logo_url
└── (One per company/division)

brands
├── business_id (NEW - links to businesses)
├── parent_id (for sub-brands within same business)
└── (Existing fields)

business_canvases
├── business_id (NEW - optional, for business-level canvas)
├── brand_id (for brand-specific canvas)
└── (Both levels can have their own canvas)
```

### Benefits

- Clear separation between organizational units and brand identities
- Business-level canvas for company-wide strategy
- Brand-level canvas for brand-specific planning
- Better organization in the UI with grouped navigation

### UI Changes

The Brand Switcher would become a hierarchical picker:

```text
📁 Business: Holding Corp
    ├── 🏷️ Consumer Brand
    │       └── Premium Line
    │       └── Budget Line
    └── 🏷️ Enterprise Brand

📁 Business: Other Company
    └── 🏷️ Their Brand
```

---

## Option B: Enhanced Current Structure (Simpler)

Keep the current brands table but add a `level` or `type` field to distinguish businesses from brands.

### Changes

```text
brands (modified)
├── type: 'business' | 'brand' | 'sub_brand' (NEW)
├── parent_id (existing - now used for full hierarchy)
└── (Existing fields)
```

### Benefits

- No new tables needed
- Minimal database changes
- Same RLS policies apply

### Limitations

- Less semantic clarity
- All entities share the same table structure
- Cannot have different fields for businesses vs brands

---

## Recommendation

**Option A (Add Business Entity)** is recommended because:

1. **Cleaner Data Model** - Each level has its own purpose and can have unique fields
2. **Flexible Canvas Strategy** - Business can have an overall canvas, brands have their own
3. **Better Filtering** - Easily filter by business first, then by brand
4. **Scalable** - Adding more business-level features is straightforward

---

## Implementation Summary

### Database Changes

1. Create `businesses` table with team association
2. Add `business_id` column to `brands` table
3. Add optional `business_id` to `business_canvases`
4. Migrate existing top-level brands to businesses (or create default business)
5. Set up RLS policies for the new table

### UI Changes

1. Update Brand Switcher to show Business → Brand → Sub-brand hierarchy
2. Add Business Canvas view for company-wide strategy
3. Keep Brand Canvas for brand-specific planning
4. Add "Create Business" dialog
5. Update navigation to show current business context

### Files to Create

| File | Purpose |
|------|---------|
| `src/contexts/BusinessContext.tsx` | Manage current business selection |
| `src/components/business/BusinessSwitcher.tsx` | Top-level business picker |
| `src/pages/BusinessOverview.tsx` | Business-level dashboard |

### Files to Modify

| File | Changes |
|------|---------|
| `src/contexts/BrandContext.tsx` | Filter brands by current business |
| `src/components/brand/BrandSwitcher.tsx` | Show brands under current business |
| `src/hooks/useBusinessCanvas.ts` | Support business-level canvas |
| `src/pages/BusinessCanvas.tsx` | Option to view business or brand canvas |

---

## Summary

This restructuring adds a "Business" layer above brands, giving you:

- Clear organizational hierarchy (Business → Brand → Sub-brand)
- Separate strategic planning at business and brand levels
- Better navigation for multi-business scenarios
- A foundation for business-level features (team permissions per business, business analytics, etc.)

