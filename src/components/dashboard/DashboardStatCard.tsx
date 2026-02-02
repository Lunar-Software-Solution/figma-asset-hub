import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";

interface DashboardStatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  to: string;
  subtitle?: string;
  loading?: boolean;
}

export function DashboardStatCard({
  label,
  value,
  icon: Icon,
  to,
  subtitle,
  loading,
}: DashboardStatCardProps) {
  return (
    <Link to={to}>
      <Card className="hover-lift cursor-pointer transition-all hover:border-primary/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {typeof value === "number" ? value.toLocaleString() : value}
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
