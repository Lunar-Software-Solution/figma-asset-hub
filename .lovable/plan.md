

# DesignVault - Digital Asset Management System

A comprehensive DAM platform for design teams with deep Figma integration, built with a clean, minimal aesthetic inspired by Linear and Notion.

---

## Core Features

### 1. Asset Library
- **Upload & organize assets** - Drag-and-drop upload for images, icons, vectors, and design files
- **Folder structure** - Create nested folders to organize assets by project, brand, or type
- **Tagging system** - Add tags to assets for easy categorization
- **Smart filtering** - Filter by file type, tags, date, uploader, or project
- **Full-text search** - Search across file names, descriptions, and tags
- **Grid/List views** - Toggle between visual gallery and detailed list view

### 2. Figma Integration
- **Connect Figma account** - OAuth connection to your Figma workspace
- **Import from Figma** - Pull components, frames, and images directly from Figma files
- **Push to Figma** - Send approved assets to your Figma design library
- **Library sync** - Keep your DAM and Figma component library in sync
- **Live previews** - View Figma file thumbnails and frame previews within the DAM
- **Figma file browser** - Browse your Figma projects and select assets to import

### 3. Version Control
- **Automatic versioning** - Every upload creates a new version
- **Version history** - View the complete history of changes for each asset
- **Visual comparison** - Side-by-side comparison between versions
- **Rollback** - Restore any previous version with one click
- **Version notes** - Add descriptions to explain what changed

### 4. Team Collaboration
- **User authentication** - Email/password login with team invites
- **Role-based access** - Viewer (view/download), Editor (upload/edit), Admin (full control)
- **Comments** - Leave feedback directly on assets
- **Approval workflow** - Submit assets for review before publishing
- **Share links** - Generate public or password-protected share links
- **Activity feed** - See who uploaded, edited, or commented on assets

### 5. Analytics Dashboard
- **Usage metrics** - Track downloads, views, and shares per asset
- **Popular assets** - See which assets are used most frequently
- **Team activity** - View team member contributions and activity
- **Storage overview** - Monitor storage usage and file counts
- **Export reports** - Download analytics as CSV

---

## User Experience

### Pages & Navigation
1. **Dashboard** - Overview with recent activity, popular assets, and quick actions
2. **Asset Library** - Main browse/search interface with filters and views
3. **Asset Detail** - Full preview, metadata, versions, and comments
4. **Figma Hub** - Connect Figma, browse files, import/push assets
5. **Collections** - Create and manage curated asset collections
6. **Team** - Manage team members, roles, and invitations
7. **Analytics** - Usage statistics and insights
8. **Settings** - Profile, integrations, and preferences

### Design Principles
- **Clean & minimal** - Ample whitespace, subtle borders, light color palette
- **Visual-first** - Large thumbnails and previews for easy scanning
- **Quick actions** - Hover states reveal common actions (download, share, delete)
- **Responsive** - Works on desktop and tablet devices

---

## Technical Requirements

### Backend (Lovable Cloud)
- **Database** - Store assets metadata, users, teams, comments, versions
- **Storage** - Secure file storage for all uploaded assets
- **Authentication** - User accounts with email login and team invites
- **Edge Functions** - Handle Figma API integration and file processing

### Figma API Integration
- OAuth authentication with Figma
- Fetch files, projects, and components
- Export images and frames
- Webhook for sync notifications

