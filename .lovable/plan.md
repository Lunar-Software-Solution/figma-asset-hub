

# Plan: Implement Team, Dashboard, and Analytics with Real Data

## Overview
Connect the existing Team, Dashboard, and Analytics pages to real database data, replacing the current mock/hardcoded data. This includes creating necessary hooks for data fetching and implementing functional CRUD operations for team management.

## Current State Analysis

### Existing Pages (with mock data):
- **Dashboard**: Shows stats (assets, collections, team members, downloads), recent assets, and activity feed - all hardcoded
- **Team**: Shows team members list, role stats, and invite form - all mock data
- **Analytics**: Shows charts for downloads, views, asset distribution, top assets - all mock data

### Database Tables Available:
- `teams` - Team information
- `team_members` - Team membership with roles (admin, editor, viewer)
- `profiles` - User profile information
- `activity_log` - Team activity tracking (currently empty)
- `asset_analytics` - Asset view/download tracking (currently empty)
- `assets` - Design assets
- `collections` - Asset collections
- `businesses` - Business entities
- `brands` - Brand entities
- `campaigns` - Marketing campaigns

### Existing Infrastructure:
- `create_team_with_admin` function for atomic team creation
- RLS policies for team-based access control
- `is_team_member`, `get_team_role`, `can_edit_team` helper functions

---

## Implementation Plan

### Phase 1: Create Team Context and Hook

#### 1.1 Create `useTeam` Hook
New file: `src/hooks/useTeam.ts`

Functionality:
- Fetch current user's team(s) via `team_members` table
- Fetch team members with profile data
- Invite new members by email
- Update member roles
- Remove team members
- Track team role counts (admins, editors, viewers)

#### 1.2 Create Team Context
New file: `src/contexts/TeamContext.tsx`

Provides:
- `currentTeam` - The active team
- `teamMembers` - List of team members with profiles
- `isAdmin` - Whether current user is team admin
- `refreshTeam` - Function to refresh team data

---

### Phase 2: Implement Dashboard with Real Data

#### 2.1 Create `useDashboardStats` Hook
New file: `src/hooks/useDashboardStats.ts`

Fetches:
- Total assets count (from `assets` table)
- Total collections count (from `collections` table)
- Team members count (from `team_members` table)
- Total downloads count (from `asset_analytics` where action='download')
- Recent assets (last 5, from `assets` table)
- Recent activity (last 10, from `activity_log` table)

#### 2.2 Update Dashboard Page
Modify: `src/pages/Dashboard.tsx`

Changes:
- Replace hardcoded stats with real database counts
- Replace mock recent assets with actual recent uploads
- Replace mock activity feed with real activity log
- Show personalized greeting using user profile
- Handle loading and empty states gracefully

---

### Phase 3: Implement Team Page with Real Data

#### 3.1 Create Team Member Management Components
New files:
- `src/components/team/InviteMemberDialog.tsx` - Dialog for inviting new members
- `src/components/team/ChangeRoleDialog.tsx` - Dialog for changing member roles
- `src/components/team/RemoveMemberDialog.tsx` - Confirmation dialog for removal
- `src/components/team/TeamMemberCard.tsx` - Individual member display

#### 3.2 Update Team Page
Modify: `src/pages/Team.tsx`

Changes:
- Use `useTeam` hook for real team data
- Display actual team members with profiles
- Implement invite functionality (stores invitation in team_members with pending status)
- Implement role change (admin only)
- Implement member removal (admin only)
- Show real role distribution stats
- Disable admin-only actions for non-admins

---

### Phase 4: Implement Analytics with Real Data

#### 4.1 Create `useAnalytics` Hook
New file: `src/hooks/useAnalytics.ts`

Fetches:
- Download counts over time (from `asset_analytics`)
- View counts over time (from `asset_analytics`)
- Asset distribution by type (from `assets`)
- Top assets by downloads/views
- Storage usage estimate (sum of `file_size` from assets)
- Filterable by date range (7d, 30d, 90d)

#### 4.2 Log Analytics Events
Helper function in hook to log analytics events when users:
- View an asset (action: 'view')
- Download an asset (action: 'download')
- Share an asset (action: 'share')

#### 4.3 Update Analytics Page
Modify: `src/pages/Analytics.tsx`

Changes:
- Use `useAnalytics` hook for real data
- Display real download/view charts (or helpful empty state if no data)
- Show actual asset type distribution
- Display real top assets based on analytics
- Calculate and show actual storage usage
- Maintain existing chart styling and layout

---

### Phase 5: Activity Logging Integration

#### 5.1 Create `useActivityLog` Hook
New file: `src/hooks/useActivityLog.ts`

Provides:
- `logActivity(action, entityType, entityId, metadata)` function
- Fetches recent activity for display

#### 5.2 Integrate Activity Logging
Add activity logging calls to existing operations:
- Asset upload/update/delete
- Collection create/update/delete
- Campaign create/update/delete
- Team member invite/remove/role change

---

## Data Flow Diagram

```text
+------------------+     +------------------+     +------------------+
|     Dashboard    |     |      Team        |     |    Analytics     |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         v                        v                        v
+--------+---------+     +--------+---------+     +--------+---------+
| useDashboardStats|     |     useTeam      |     |   useAnalytics   |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         +------------+-----------+------------+-----------+
                      |                        |
                      v                        v
              +-------+--------+       +-------+--------+
              |   TeamContext  |       | useActivityLog |
              +-------+--------+       +-------+--------+
                      |                        |
                      +------------+-----------+
                                   |
                                   v
                           +-------+--------+
                           |    Supabase    |
                           |   (Database)   |
                           +----------------+
```

---

## Files to Create
- `src/contexts/TeamContext.tsx`
- `src/hooks/useTeam.ts`
- `src/hooks/useDashboardStats.ts`
- `src/hooks/useAnalytics.ts`
- `src/hooks/useActivityLog.ts`
- `src/components/team/InviteMemberDialog.tsx`
- `src/components/team/ChangeRoleDialog.tsx`
- `src/components/team/RemoveMemberDialog.tsx`
- `src/components/team/TeamMemberCard.tsx`

## Files to Modify
- `src/App.tsx` - Add TeamProvider
- `src/pages/Dashboard.tsx` - Connect to real data
- `src/pages/Team.tsx` - Connect to real data + CRUD
- `src/pages/Analytics.tsx` - Connect to real data

---

## Technical Considerations

### Team Member Invitation Flow
Since we don't have email invitation infrastructure, the initial implementation will:
1. Check if user exists in `profiles` by email
2. If exists, add them directly to `team_members`
3. If not exists, show message that user must sign up first

### Empty State Handling
When there's no data (new teams, no analytics yet):
- Dashboard: Show encouraging onboarding prompts
- Analytics: Show helpful message explaining data will appear as assets are used
- Team: Always shows at least the current user (admin)

### Role-Based UI
- Only team admins can invite, change roles, or remove members
- UI elements will be disabled/hidden for non-admins
- Server-side enforcement via existing RLS policies

### Performance
- Use React Query for caching and automatic refetching
- Aggregate queries where possible to minimize database calls
- Add appropriate indexes if needed (already in place for most queries)

