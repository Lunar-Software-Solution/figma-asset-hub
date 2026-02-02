import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Images, 
  FolderOpen, 
  Users, 
  TrendingUp, 
  Upload, 
  ArrowRight,
  Clock,
  Star,
  Download
} from "lucide-react";
import { motion } from "framer-motion";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAuth } from "@/contexts/AuthContext";
import { formatActivityMessage, getTimeAgo } from "@/hooks/useActivityLog";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, statsLoading, recentAssets, recentAssetsLoading, activity, activityLoading } = useDashboardStats();

  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  const statsData = [
    { label: "Total Assets", value: stats.totalAssets.toLocaleString(), icon: Images, trend: "+12%" },
    { label: "Collections", value: stats.totalCollections.toLocaleString(), icon: FolderOpen, trend: "+3" },
    { label: "Team Members", value: stats.teamMembers.toLocaleString(), icon: Users, trend: "+2" },
    { label: "Downloads", value: stats.totalDownloads.toLocaleString(), icon: Download, trend: "+24%" },
  ];

  const quickActions = [
    { label: "Upload Assets", icon: Upload, variant: "default" as const, to: "/assets" },
    { label: "Create Collection", icon: FolderOpen, variant: "outline" as const, to: "/collections" },
    { label: "Connect Figma", icon: Star, variant: "outline" as const, to: "/figma" },
  ];

  return (
    <AppLayout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
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

        {/* Stats Grid */}
        <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat) => (
            <Card key={stat.label} className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  {stat.trend} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Assets */}
          <motion.div variants={item} className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Assets</CardTitle>
                  <CardDescription>Your recently uploaded or modified assets</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <Link to="/assets">
                    View all <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentAssetsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-40 mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentAssets.length === 0 ? (
                  <div className="text-center py-8">
                    <Images className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No assets yet</p>
                    <Button size="sm" className="mt-4" asChild>
                      <Link to="/assets">Upload your first asset</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center gap-4 rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors cursor-pointer"
                      >
                        <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                          <Images className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {asset.name}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {asset.asset_type.replace("_", " ")}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(asset.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Feed */}
          <motion.div variants={item}>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Activity</CardTitle>
                <CardDescription>Recent team activity</CardDescription>
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activity.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No activity yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Activity will appear as your team works
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activity.map((item) => (
                      <div key={item.id} className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-primary">
                            {(item.profile?.full_name || item.profile?.email || "U")[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-medium">
                              {item.profile?.full_name || item.profile?.email?.split("@")[0] || "User"}
                            </span>{" "}
                            <span className="text-muted-foreground">
                              {formatActivityMessage(item.action, item.entity_type, item.metadata)}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">{getTimeAgo(item.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
