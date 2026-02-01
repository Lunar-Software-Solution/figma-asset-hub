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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useBrand } from "@/contexts/BrandContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const BRAND_COLORS = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Purple", value: "#a855f7" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Green", value: "#22c55e" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Red", value: "#ef4444" },
];

interface CreateBrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentBrandId?: string;
}

export function CreateBrandDialog({
  open,
  onOpenChange,
  parentBrandId,
}: CreateBrandDialogProps) {
  const { user } = useAuth();
  const { brands, refreshBrands, setCurrentBrand } = useBrand();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [parentId, setParentId] = useState<string | undefined>(parentBrandId);

  const parentBrands = brands.filter((b) => !b.parent_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      // First, get the user's team (for now, create one if none exists)
      let teamId: string;

      const { data: existingTeams } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id)
        .limit(1);

      if (existingTeams && existingTeams.length > 0) {
        teamId = existingTeams[0].team_id;
      } else {
        // Create a default team for the user using the secure function
        const { data: newTeamId, error: teamError } = await supabase
          .rpc("create_team_with_admin", {
            _name: "My Team",
            _description: null,
          });

        if (teamError) throw teamError;
        teamId = newTeamId;
      }

      const { data, error } = await supabase
        .from("brands")
        .insert({
          name,
          description: description || null,
          primary_color: primaryColor,
          parent_id: parentId || null,
          team_id: teamId,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`${parentId ? "Sub-brand" : "Brand"} created successfully!`);
      await refreshBrands();
      setCurrentBrand(data);
      onOpenChange(false);
      resetForm();
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to create brand");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrimaryColor("#6366f1");
    setParentId(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {parentBrandId ? "Create Sub-brand" : "Create Brand"}
          </DialogTitle>
          <DialogDescription>
            {parentBrandId
              ? "Add a sub-brand under an existing brand."
              : "Create a new brand to organize your assets."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Brand Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Acme Corp"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this brand..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Brand Color</Label>
            <div className="flex flex-wrap gap-2">
              {BRAND_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setPrimaryColor(color.value)}
                  className={`h-8 w-8 rounded-full transition-all ${
                    primaryColor === color.value
                      ? "ring-2 ring-offset-2 ring-primary"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {!parentBrandId && parentBrands.length > 0 && (
            <div className="space-y-2">
              <Label>Parent Brand (optional)</Label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="None (top-level brand)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (top-level brand)</SelectItem>
                  {parentBrands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Brand
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
