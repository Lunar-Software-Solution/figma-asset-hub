import { useState } from "react";
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
import { useAnalytics, formatBytes } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["hsl(234, 89%, 64%)", "hsl(258, 90%, 66%)", "hsl(142, 71%, 45%)", "hsl(25, 95%, 53%)", "hsl(340, 82%, 52%)", "hsl(200, 95%, 48%)"];

type DateRange = "7d" | "30d" | "90d";

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange>("7d");
  const { data, isLoading } = useAnalytics(dateRange);

  const stats = [
    { label: "Total Downloads", value: data.totals.downloads.toLocaleString(), icon: Download, trend: "+12%", color: "text-blue-600" },
    { label: "Total Views", value: data.totals.views.toLocaleString(), icon: Eye, trend: "+8%", color: "text-purple-600" },
    { label: "Shares", value: data.totals.shares.toLocaleString(), icon: Share2, trend: "+24%", color: "text-green-600" },
    { label: "Storage Used", value: formatBytes(data.totals.storageBytes), icon: HardDrive, trend: "—", color: "text-orange-500" },
  ];

  const hasData = data.downloads.some(d => d.downloads > 0) || 
                  data.views.some(v => v.views > 0) || 
                  data.assetDistribution.length > 0;

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
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
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
          {stats.map((stat) => (
            <motion.div key={stat.label} whileHover={{ y: -2 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    {stat.trend !== "—" && (
                      <span className="text-xs text-success flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {stat.trend}
                      </span>
                    )}
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-8 w-20 mt-2" />
                  ) : (
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  )}
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
              <CardDescription>
                {dateRange === "7d" ? "Daily" : "Weekly"} download activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Skeleton className="h-48 w-full" />
                  </div>
                ) : !hasData ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <Download className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No download data yet</p>
                      <p className="text-xs text-muted-foreground">Analytics will appear as assets are downloaded</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.downloads}>
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
                )}
              </div>
            </CardContent>
          </Card>

          {/* Views Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Views</CardTitle>
              <CardDescription>
                {dateRange === "7d" ? "Daily" : "Weekly"} view trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Skeleton className="h-48 w-full" />
                  </div>
                ) : !hasData ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <Eye className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No view data yet</p>
                      <p className="text-xs text-muted-foreground">Analytics will appear as assets are viewed</p>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.views}>
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
                )}
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
                {isLoading ? (
                  <Skeleton className="h-40 w-40 rounded-full" />
                ) : data.assetDistribution.length === 0 ? (
                  <div className="text-center">
                    <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No assets yet</p>
                    <p className="text-xs text-muted-foreground">Upload assets to see distribution</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.assetDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.assetDistribution.map((_, index) => (
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
                )}
              </div>
              {data.assetDistribution.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {data.assetDistribution.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Assets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Assets</CardTitle>
              <CardDescription>Most popular assets by downloads</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : data.topAssets.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No asset activity yet</p>
                  <p className="text-xs text-muted-foreground">Top assets will appear as they are used</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {data.topAssets.map((asset, index) => (
                    <div key={asset.id} className="flex items-center gap-4">
                      <span className="text-sm font-medium text-muted-foreground w-4">
                        {index + 1}
                      </span>
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{asset.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {asset.downloads} downloads • {asset.views} views
                        </p>
                      </div>
                      {data.topAssets[0]?.downloads > 0 && (
                        <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${(asset.downloads / data.topAssets[0].downloads) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
