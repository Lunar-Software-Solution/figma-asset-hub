import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Figma } from "lucide-react";

interface FigmaStatusCardProps {
  connected: boolean;
}

export function FigmaStatusCard({ connected }: FigmaStatusCardProps) {
  if (!connected) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
              <Figma className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Connect Figma</p>
              <p className="text-xs text-muted-foreground">
                Sync your design files directly
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link to="/figma">Connect</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-500/20 bg-green-500/5">
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Figma className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Figma Connected</p>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground">
              Your design files are synced
            </p>
          </div>
        </div>
        <Button size="sm" variant="ghost" asChild>
          <Link to="/figma">View Files</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
