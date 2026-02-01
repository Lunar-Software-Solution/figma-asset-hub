import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Figma,
  Link as LinkIcon,
  RefreshCw,
  Download,
  Upload,
  FolderOpen,
  Check,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

const mockFigmaFiles = [
  { id: 1, name: "Design System v2", lastModified: "2 hours ago", thumbnail: null },
  { id: 2, name: "Marketing Website", lastModified: "Yesterday", thumbnail: null },
  { id: 3, name: "Mobile App Screens", lastModified: "3 days ago", thumbnail: null },
  { id: 4, name: "Icon Library", lastModified: "1 week ago", thumbnail: null },
];

export default function FigmaHub() {
  const [isConnected, setIsConnected] = useState(false);

  if (!isConnected) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md"
          >
            <div className="mx-auto h-20 w-20 rounded-2xl bg-[#1E1E1E] flex items-center justify-center mb-6">
              <Figma className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Connect to Figma
            </h1>
            <p className="text-muted-foreground mb-6">
              Link your Figma account to import components, sync libraries, and push approved assets directly to your design files.
            </p>
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full gap-2"
                onClick={() => setIsConnected(true)}
              >
                <Figma className="h-4 w-4" />
                Connect Figma Account
              </Button>
              <p className="text-xs text-muted-foreground">
                We'll request read/write access to your Figma files
              </p>
            </div>

            {/* Features Preview */}
            <div className="mt-12 grid gap-4 text-left">
              {[
                { icon: Download, title: "Import from Figma", desc: "Pull components and frames directly" },
                { icon: Upload, title: "Push to Figma", desc: "Send approved assets to your library" },
                { icon: RefreshCw, title: "Auto Sync", desc: "Keep DAM and Figma in sync" },
              ].map((feature) => (
                <div key={feature.title} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Figma Hub</h1>
            <p className="text-muted-foreground">
              Manage your Figma integration and sync assets.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1 text-success border-success/30">
              <Check className="h-3 w-3" />
              Connected
            </Badge>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Sync Now
            </Button>
          </div>
        </div>

        {/* Connection Info */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#1E1E1E] flex items-center justify-center">
                  <Figma className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base">Figma Workspace</CardTitle>
                  <CardDescription>design-team@company.com</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-destructive">
                Disconnect
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="files" className="space-y-6">
          <TabsList>
            <TabsTrigger value="files">Figma Files</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="push">Push to Figma</TabsTrigger>
            <TabsTrigger value="library">Library Sync</TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mockFigmaFiles.map((file) => (
                <motion.div key={file.id} whileHover={{ y: -2 }}>
                  <Card className="cursor-pointer hover:border-primary/50 transition-all">
                    {/* Thumbnail */}
                    <div className="aspect-video bg-secondary flex items-center justify-center border-b">
                      <FolderOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.lastModified}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="import">
            <Card>
              <CardHeader>
                <CardTitle>Import from Figma</CardTitle>
                <CardDescription>
                  Select components or frames from your Figma files to import into DesignVault.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Download className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Select a Figma file to browse and import assets
                  </p>
                  <Button variant="outline">Browse Figma Files</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="push">
            <Card>
              <CardHeader>
                <CardTitle>Push to Figma</CardTitle>
                <CardDescription>
                  Send approved assets from DesignVault to your Figma design library.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Select assets to push to your Figma library
                  </p>
                  <Button variant="outline">Select Assets</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="library">
            <Card>
              <CardHeader>
                <CardTitle>Library Sync</CardTitle>
                <CardDescription>
                  Keep your DesignVault and Figma component library in sync automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <LinkIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Configure automatic sync between your libraries
                  </p>
                  <Button variant="outline">Configure Sync</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
