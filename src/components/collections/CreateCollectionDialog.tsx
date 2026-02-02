import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useBusiness } from "@/contexts/BusinessContext";
import { useBrand } from "@/contexts/BrandContext";
import { useCampaigns } from "@/hooks/useCampaigns";
import { Building2, Palette, Megaphone, Users } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  is_public: z.boolean().default(false),
  owner_type: z.enum(["team", "business", "brand", "campaign"]),
  business_id: z.string().optional().nullable(),
  brand_id: z.string().optional().nullable(),
  campaign_id: z.string().optional().nullable(),
});

type FormData = z.infer<typeof formSchema>;

interface CreateCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    is_public: boolean;
    business_id?: string | null;
    brand_id?: string | null;
    campaign_id?: string | null;
    team_id: string;
  }) => Promise<void>;
  teamId: string;
}

export function CreateCollectionDialog({
  open,
  onOpenChange,
  onSubmit,
  teamId,
}: CreateCollectionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { businesses } = useBusiness();
  const { brands } = useBrand();
  const { campaigns } = useCampaigns();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      is_public: false,
      owner_type: "team",
      business_id: null,
      brand_id: null,
      campaign_id: null,
    },
  });

  const ownerType = form.watch("owner_type");

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: data.name,
        description: data.description || undefined,
        is_public: data.is_public,
        business_id: data.owner_type === "business" ? data.business_id : null,
        brand_id: data.owner_type === "brand" ? data.brand_id : null,
        campaign_id: data.owner_type === "campaign" ? data.campaign_id : null,
        team_id: teamId,
      });
      form.reset();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Collection</DialogTitle>
          <DialogDescription>
            Create a new collection to organize your assets.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., Q1 Marketing Assets"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description..."
              rows={2}
              {...form.register("description")}
            />
          </div>

          <div className="space-y-3">
            <Label>Owner</Label>
            <RadioGroup
              value={ownerType}
              onValueChange={(value) =>
                form.setValue("owner_type", value as FormData["owner_type"])
              }
              className="grid grid-cols-2 gap-2"
            >
              <div className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="team" id="team" />
                <Label htmlFor="team" className="flex items-center gap-2 cursor-pointer">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Team
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="business" id="business" />
                <Label htmlFor="business" className="flex items-center gap-2 cursor-pointer">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Business
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="brand" id="brand" />
                <Label htmlFor="brand" className="flex items-center gap-2 cursor-pointer">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  Brand
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="campaign" id="campaign" />
                <Label htmlFor="campaign" className="flex items-center gap-2 cursor-pointer">
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                  Campaign
                </Label>
              </div>
            </RadioGroup>
          </div>

          {ownerType === "business" && (
            <div className="space-y-2">
              <Label>Select Business</Label>
              <Select
                value={form.watch("business_id") || ""}
                onValueChange={(value) => form.setValue("business_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a business..." />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((business) => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {ownerType === "brand" && (
            <div className="space-y-2">
              <Label>Select Brand</Label>
              <Select
                value={form.watch("brand_id") || ""}
                onValueChange={(value) => form.setValue("brand_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a brand..." />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {ownerType === "campaign" && (
            <div className="space-y-2">
              <Label>Select Campaign</Label>
              <Select
                value={form.watch("campaign_id") || ""}
                onValueChange={(value) => form.setValue("campaign_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a campaign..." />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="is_public">Public Collection</Label>
              <p className="text-sm text-muted-foreground">
                Anyone with the link can view
              </p>
            </div>
            <Switch
              id="is_public"
              checked={form.watch("is_public")}
              onCheckedChange={(checked) => form.setValue("is_public", checked)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Collection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
