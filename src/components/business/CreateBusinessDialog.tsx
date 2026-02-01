import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { toast } from "@/hooks/use-toast";

interface CreateBusinessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateBusinessDialog({
  open,
  onOpenChange,
}: CreateBusinessDialogProps) {
  const { user } = useAuth();
  const { refreshBusinesses } = useBusiness();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    setIsLoading(true);
    try {
      // Get user's team
      const { data: teamMember } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id)
        .single();

      if (!teamMember) {
        throw new Error("No team found");
      }

      const { error } = await supabase.from("businesses").insert({
        name: name.trim(),
        description: description.trim() || null,
        primary_color: primaryColor,
        team_id: teamMember.team_id,
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: "Business created",
        description: `"${name}" has been created successfully.`,
      });

      await refreshBusinesses();
      onOpenChange(false);
      setName("");
      setDescription("");
      setPrimaryColor("#6366f1");
    } catch (error) {
      console.error("Error creating business:", error);
      toast({
        title: "Error",
        description: "Failed to create business. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Business</DialogTitle>
            <DialogDescription>
              Add a new business to organize your brands under.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Holding Corp"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this business..."
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color">Brand Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#6366f1"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Creating..." : "Create Business"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
