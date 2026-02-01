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

const stats = [
  { label: "Total Assets", value: "1,284", icon: Images, trend: "+12%" },
  { label: "Collections", value: "23", icon: FolderOpen, trend: "+3" },
  { label: "Team Members", value: "8", icon: Users, trend: "+2" },
  { label: "Downloads", value: "3.2k", icon: Download, trend: "+24%" },
];

const recentAssets = [
  { id: 1, name: "Hero Banner v2.png", type: "image", time: "2 hours ago" },
  { id: 2, name: "Icon Set - Navigation", type: "icon", time: "4 hours ago" },
  { id: 3, name: "Brand Guidelines.pdf", type: "design_file", time: "Yesterday" },
  { id: 4, name: "Logo Variations", type: "vector", time: "2 days ago" },
];

const quickActions = [
  { label: "Upload Assets", icon: Upload, variant: "default" as const },
  { label: "Create Collection", icon: FolderOpen, variant: "outline" as const },
  { label: "Connect Figma", icon: Star, variant: "outline" as const },
];

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
            <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground">
              Here's what's happening with your design assets today.
            </p>
          </div>
          <div className="flex gap-3">
            {quickActions.map((action) => (
              <Button key={action.label} variant={action.variant} size="sm" className="gap-2">
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={item} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
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
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
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
                          {asset.type.replace("_", " ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {asset.time}
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-4">
                  {[
                    { user: "Sarah", action: "uploaded", item: "Logo Final.svg", time: "1h ago" },
                    { user: "Mike", action: "commented on", item: "Banner Design", time: "2h ago" },
                    { user: "Emma", action: "approved", item: "Icon Pack v3", time: "3h ago" },
                    { user: "Alex", action: "created", item: "Q1 Marketing", time: "5h ago" },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-primary">
                          {activity.user[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>{" "}
                          <span className="text-muted-foreground">{activity.action}</span>{" "}
                          <span className="font-medium">{activity.item}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
