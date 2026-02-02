import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { 
  Images, 
  FolderOpen, 
  Users, 
  Upload, 
  Megaphone,
  Building2,
  Palette,
  CalendarClock,
  Download,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  DashboardStatCard,
  RecentCampaignsCard,
  UpcomingPostsCard,
  FigmaStatusCard,
} from "@/components/dashboard";
import { RecentAssetsCard } from "@/components/dashboard/RecentAssetsCard";
import { ActivityFeedCard } from "@/components/dashboard/ActivityFeedCard";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();
  const {
    stats,
    statsLoading,
    recentAssets,
    recentAssetsLoading,
    recentCampaigns,
    recentCampaignsLoading,
    upcomingPosts,
    upcomingPostsLoading,
    activity,
    activityLoading,
  } = useDashboardStats();

  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  const quickActions = [
    { label: "Upload Assets", icon: Upload, variant: "default" as const, to: "/assets" },
    { label: "New Campaign", icon: Plus, variant: "outline" as const, to: "/campaigns" },
    { label: "Create Collection", icon: FolderOpen, variant: "outline" as const, to: "/collections" },
  ];

  return (
    <AppLayout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Welcome back, {userName}</h1>
            <p className="text-muted-foreground">
              Here's what's happening with your design assets today.
            </p>
          </div>
          <div className="flex gap-3">
            {quickActions.map((action) => (
              <Button key={action.label} variant={action.variant} size="sm" className="gap-2" asChild>
                <Link to={action.to}>
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid - Row 1 */}
        <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardStatCard
            label="Total Assets"
            value={stats.totalAssets}
            icon={Images}
            to="/assets"
            loading={statsLoading}
          />
          <DashboardStatCard
            label="Collections"
            value={stats.totalCollections}
            icon={FolderOpen}
            to="/collections"
            loading={statsLoading}
          />
          <DashboardStatCard
            label="Active Campaigns"
            value={stats.activeCampaigns}
            icon={Megaphone}
            to="/campaigns"
            subtitle={`of ${stats.totalCampaigns} total`}
            loading={statsLoading}
          />
          <DashboardStatCard
            label="Scheduled Posts"
            value={stats.scheduledPosts}
            icon={CalendarClock}
            to="/calendar"
            loading={statsLoading}
          />
        </motion.div>

        {/* Stats Grid - Row 2 */}
        <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardStatCard
            label="Businesses"
            value={stats.totalBusinesses}
            icon={Building2}
            to="/business"
            loading={statsLoading}
          />
          <DashboardStatCard
            label="Brands"
            value={stats.totalBrands}
            icon={Palette}
            to="/business"
            loading={statsLoading}
          />
          <DashboardStatCard
            label="Team Members"
            value={stats.teamMembers}
            icon={Users}
            to="/team"
            loading={statsLoading}
          />
          <DashboardStatCard
            label="Downloads"
            value={stats.totalDownloads}
            icon={Download}
            to="/analytics"
            loading={statsLoading}
          />
        </motion.div>

        {/* Content Grid - Row 1: Campaigns & Posts */}
        <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
          <RecentCampaignsCard campaigns={recentCampaigns} loading={recentCampaignsLoading} />
          <UpcomingPostsCard posts={upcomingPosts} loading={upcomingPostsLoading} />
        </motion.div>

        {/* Content Grid - Row 2: Assets & Activity */}
        <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
          <RecentAssetsCard assets={recentAssets} loading={recentAssetsLoading} />
          <ActivityFeedCard activity={activity} loading={activityLoading} />
        </motion.div>

        {/* Figma Status */}
        <motion.div variants={item}>
          <FigmaStatusCard connected={stats.figmaConnected} />
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
