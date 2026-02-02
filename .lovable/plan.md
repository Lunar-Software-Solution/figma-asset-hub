
# Plan: Enhance Dashboard with All System Objects

## Overview
Expand the current dashboard to display a comprehensive overview of all entity types in the system: **Businesses**, **Brands**, **Campaigns**, **Collections**, **Assets**, **Scheduled Posts**, **Figma Files**, and **Team Members**. The enhanced dashboard will provide at-a-glance visibility into all aspects of the platform with quick navigation to each section.

## Current State
The dashboard currently shows:
- 4 stat cards: Assets, Collections, Team Members, Downloads
- Recent Assets list
- Activity Feed

Missing from the dashboard:
- Businesses overview
- Brands overview
- Campaigns overview with status breakdown
- Scheduled Posts / Calendar preview
- Figma connection status

## Implementation Plan

### Phase 1: Expand Dashboard Stats Hook

**File: `src/hooks/useDashboardStats.ts`**

Add new data queries:
- `totalBusinesses` - Count from businesses table
- `totalBrands` - Count from brands table  
- `totalCampaigns` - Count from campaigns table
- `activeCampaigns` - Campaigns with status = 'active'
- `scheduledPosts` - Count of posts with status = 'scheduled'
- `upcomingPosts` - Next 5 scheduled posts with dates
- `recentCampaigns` - Last 5 campaigns created/modified
- `figmaConnected` - Boolean for Figma connection status
- `figmaFileCount` - Number of Figma files (if connected)

New interfaces:
```typescript
interface DashboardStats {
  totalAssets: number;
  totalCollections: number;
  teamMembers: number;
  totalDownloads: number;
  totalBusinesses: number;
  totalBrands: number;
  totalCampaigns: number;
  activeCampaigns: number;
  scheduledPosts: number;
  figmaConnected: boolean;
}

interface RecentCampaign {
  id: string;
  name: string;
  status: CampaignStatus;
  start_date: string | null;
  end_date: string | null;
}

interface UpcomingPost {
  id: string;
  title: string | null;
  content: string;
  scheduled_for: string;
  platform: SocialPlatform;
  campaign_name?: string;
}
```

### Phase 2: Redesign Dashboard Layout

**File: `src/pages/Dashboard.tsx`**

New layout structure:

```text
+--------------------------------------------------+
| Welcome Header + Quick Actions                    |
+--------------------------------------------------+
| Stats Row 1: Assets | Collections | Campaigns    |
+--------------------------------------------------+
| Stats Row 2: Businesses | Brands | Posts | Team  |
+--------------------------------------------------+
| +-------------------+  +----------------------+   |
| | Recent Campaigns  |  | Upcoming Posts       |   |
| | (campaign list    |  | (next scheduled      |   |
| | with status)      |  | posts preview)       |   |
| +-------------------+  +----------------------+   |
+--------------------------------------------------+
| +-------------------+  +-------------------+      |
| | Recent Assets     |  | Activity Feed     |      |
| | (asset cards)     |  | (team activity)   |      |
| +-------------------+  +-------------------+      |
+--------------------------------------------------+
| Figma Status Bar (optional, if connected)        |
+--------------------------------------------------+
```

### Phase 3: Create Dashboard Components

**New components in `src/components/dashboard/`:**

1. **DashboardStatCard.tsx**
   - Reusable stat card with icon, value, label, and optional trend
   - Click-through navigation to relevant page
   - Loading skeleton state

2. **RecentCampaignsCard.tsx**
   - Shows 5 most recent campaigns
   - Displays name, status badge, date range
   - "View all" link to /campaigns

3. **UpcomingPostsCard.tsx**
   - Shows next 5 scheduled posts
   - Displays post preview, platform icon, scheduled time
   - "View calendar" link to /calendar

4. **FigmaStatusCard.tsx**
   - Shows connection status
   - File count if connected
   - Quick link to Figma Hub

5. **EntityOverviewCard.tsx**
   - Generic card for Business/Brand quick stats
   - Shows current selection with color indicator
   - Links to Business Overview page

### Phase 4: Update Dashboard Page

**Changes to `src/pages/Dashboard.tsx`:**

1. **Enhanced Stats Grid**
   - 8 stat cards in 2 rows (4 columns each)
   - Row 1: Assets, Collections, Campaigns (active), Scheduled Posts
   - Row 2: Businesses, Brands, Team Members, Downloads

2. **Quick Actions Update**
   - Add "New Campaign" action
   - Add "Schedule Post" action
   - Keep existing: Upload Assets, Create Collection, Connect Figma

3. **New Content Sections**
   - Recent Campaigns card (lg:col-span-1)
   - Upcoming Posts card (lg:col-span-1)
   - Recent Assets card (lg:col-span-1) - already exists
   - Activity Feed card (lg:col-span-1) - already exists

4. **Figma Integration Status**
   - Small banner/badge showing Figma connection status
   - Quick action to connect if not connected

### Phase 5: Add Navigation Links

Each dashboard card/stat will link to its respective page:
- Assets stat -> /assets
- Collections stat -> /collections  
- Campaigns stat -> /campaigns
- Businesses stat -> /business (BusinessOverview)
- Brands stat -> /business (with brand filter)
- Team stat -> /team
- Posts stat -> /calendar
- Figma -> /figma

## Data Flow

```text
Dashboard.tsx
    |
    +-> useDashboardStats() -- expanded hook
    |       |
    |       +-> assets (count)
    |       +-> collections (count)
    |       +-> campaigns (count + active count + recent)
    |       +-> businesses (count)
    |       +-> brands (count)
    |       +-> team_members (count)
    |       +-> campaign_posts + post_schedules (upcoming)
    |       +-> figma_connections (status)
    |       +-> activity_log (recent)
    |       +-> asset_analytics (downloads)
    |
    +-> useBusiness() -- current business context
    +-> useBrand() -- current brand context
```

## Files to Create
- `src/components/dashboard/DashboardStatCard.tsx`
- `src/components/dashboard/RecentCampaignsCard.tsx`
- `src/components/dashboard/UpcomingPostsCard.tsx`
- `src/components/dashboard/FigmaStatusCard.tsx`
- `src/components/dashboard/index.ts`

## Files to Modify
- `src/hooks/useDashboardStats.ts` - Add new queries for all entities
- `src/pages/Dashboard.tsx` - Complete redesign with new layout

## Technical Details

### Database Queries (in useDashboardStats.ts)

```typescript
// Parallel fetch for all counts
const [
  assetsRes,
  collectionsRes,
  campaignsRes,
  businessesRes,
  brandsRes,
  membersRes,
  analyticsRes,
  scheduledPostsRes,
  figmaRes,
] = await Promise.all([
  supabase.from("assets").select("id", { count: "exact", head: true }).eq("team_id", currentTeamId),
  supabase.from("collections").select("id", { count: "exact", head: true }).eq("team_id", currentTeamId),
  supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("team_id", currentTeamId),
  supabase.from("businesses").select("id", { count: "exact", head: true }).eq("team_id", currentTeamId),
  supabase.from("brands").select("id", { count: "exact", head: true }).eq("team_id", currentTeamId),
  supabase.from("team_members").select("id", { count: "exact", head: true }).eq("team_id", currentTeamId),
  supabase.from("asset_analytics").select("id", { count: "exact", head: true }).eq("action", "download"),
  supabase.from("campaign_posts").select("id", { count: "exact", head: true })
    .eq("team_id", currentTeamId).eq("status", "scheduled"),
  supabase.from("figma_connections").select("id").eq("team_id", currentTeamId).maybeSingle(),
]);

// Fetch upcoming posts with schedule info
const { data: upcomingPosts } = await supabase
  .from("post_schedules")
  .select(`
    id,
    scheduled_for,
    platform,
    post:campaign_posts(id, title, content, campaign:campaigns(name))
  `)
  .gte("scheduled_for", new Date().toISOString())
  .order("scheduled_for", { ascending: true })
  .limit(5);

// Fetch recent campaigns
const { data: recentCampaigns } = await supabase
  .from("campaigns")
  .select("id, name, status, start_date, end_date")
  .eq("team_id", currentTeamId)
  .order("updated_at", { ascending: false })
  .limit(5);
```

### UI Component Example

```tsx
// Stat card with navigation
<Link to="/campaigns">
  <Card className="hover-lift cursor-pointer">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        Active Campaigns
      </CardTitle>
      <Megaphone className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
      <p className="text-xs text-muted-foreground">
        of {stats.totalCampaigns} total campaigns
      </p>
    </CardContent>
  </Card>
</Link>
```

## Empty State Handling

For new users with no data:
- Show encouraging onboarding prompts
- "Get started" CTA buttons for each empty section
- Hide sections that have no relevance (e.g., hide Figma status if not connected)

## Performance Considerations

- Use parallel queries with `Promise.all` for all counts
- React Query caching to prevent redundant fetches
- Skeleton loading states for each section independently
- Only fetch detailed data (recent items) after counts load
