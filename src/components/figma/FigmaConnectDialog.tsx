import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, Loader2 } from "lucide-react";

interface FigmaConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (token: string) => Promise<void>;
  isConnecting: boolean;
}

export function FigmaConnectDialog({
  open,
  onOpenChange,
  onConnect,
  isConnecting,
}: FigmaConnectDialogProps) {
  const [token, setToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    await onConnect(token.trim());
    setToken("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect to Figma</DialogTitle>
          <DialogDescription>
            Enter your Figma Personal Access Token to connect your account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="token">Personal Access Token</Label>
              <Input
                id="token"
                type="password"
                placeholder="figd_..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={isConnecting}
              />
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>To get your token:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Go to Figma → Settings → Account</li>
                <li>Scroll to "Personal access tokens"</li>
                <li>Click "Generate new token"</li>
                <li>Copy and paste the token here</li>
              </ol>
              <a
                href="https://www.figma.com/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
              >
                Open Figma Settings
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isConnecting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!token.trim() || isConnecting}>
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
