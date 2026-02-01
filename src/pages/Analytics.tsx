import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  TrendingUp,
  Eye,
  Share2,
  HardDrive,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const downloadData = [
  { name: "Mon", downloads: 45 },
  { name: "Tue", downloads: 62 },
  { name: "Wed", downloads: 38 },
  { name: "Thu", downloads: 71 },
  { name: "Fri", downloads: 89 },
  { name: "Sat", downloads: 24 },
  { name: "Sun", downloads: 31 },
];

const viewsData = [
  { name: "Week 1", views: 420 },
  { name: "Week 2", views: 580 },
  { name: "Week 3", views: 490 },
  { name: "Week 4", views: 720 },
];

const assetTypeData = [
  { name: "Images", value: 45 },
  { name: "Icons", value: 25 },
  { name: "Vectors", value: 15 },
  { name: "Design Files", value: 15 },
];

const COLORS = ["hsl(234, 89%, 64%)", "hsl(258, 90%, 66%)", "hsl(142, 71%, 45%)", "hsl(25, 95%, 53%)"];

const topAssets = [
  { name: "Hero Banner.png", downloads: 234, views: 1.2 },
  { name: "Logo Package.zip", downloads: 189, views: 890 },
  { name: "Icon Set v3.svg", downloads: 156, views: 720 },
  { name: "Brand Colors.fig", downloads: 134, views: 650 },
  { name: "Social Media Kit", downloads: 98, views: 430 },
];

export default function Analytics() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">
              Track asset usage and team activity.
            </p>
          </div>
          <div className="flex gap-3">
            <Select defaultValue="7d">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Downloads", value: "3,284", icon: Download, trend: "+12%", color: "text-vault-blue" },
            { label: "Total Views", value: "12.4k", icon: Eye, trend: "+8%", color: "text-vault-purple" },
            { label: "Shares", value: "456", icon: Share2, trend: "+24%", color: "text-vault-green" },
            { label: "Storage Used", value: "24.5 GB", icon: HardDrive, trend: "64%", color: "text-vault-orange" },
          ].map((stat) => (
            <motion.div key={stat.label} whileHover={{ y: -2 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <span className="text-xs text-success flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Downloads Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Downloads</CardTitle>
              <CardDescription>Daily download activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={downloadData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="downloads" fill="hsl(234, 89%, 64%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Views Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Views</CardTitle>
              <CardDescription>Weekly view trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={viewsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="hsl(258, 90%, 66%)"
                      strokeWidth={2}
                      dot={{ fill: "hsl(258, 90%, 66%)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Asset Types Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Asset Distribution</CardTitle>
              <CardDescription>Assets by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {assetTypeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {assetTypeData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Assets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Assets</CardTitle>
              <CardDescription>Most popular assets by downloads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topAssets.map((asset, index) => (
                  <div key={asset.name} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-muted-foreground w-4">
                      {index + 1}
                    </span>
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{asset.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {asset.downloads} downloads • {asset.views}k views
                      </p>
                    </div>
                    <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(asset.downloads / topAssets[0].downloads) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
