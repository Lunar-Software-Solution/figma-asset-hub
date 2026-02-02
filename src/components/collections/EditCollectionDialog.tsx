import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import type { Collection } from "@/hooks/useCollections";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  is_public: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface EditCollectionDialogProps {
  collection: Collection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { id: string; name: string; description?: string; is_public: boolean }) => Promise<void>;
}

export function EditCollectionDialog({
  collection,
  open,
  onOpenChange,
  onSubmit,
}: EditCollectionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      is_public: false,
    },
  });

  useEffect(() => {
    if (collection) {
      form.reset({
        name: collection.name,
        description: collection.description || "",
        is_public: collection.is_public,
      });
    }
  }, [collection, form]);

  const handleSubmit = async (data: FormData) => {
    if (!collection) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        id: collection.id,
        name: data.name,
        description: data.description || undefined,
        is_public: data.is_public,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
          <DialogDescription>
            Update the collection details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              placeholder="Collection name"
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              placeholder="Optional description..."
              rows={2}
              {...form.register("description")}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="edit-is_public">Public Collection</Label>
              <p className="text-sm text-muted-foreground">
                Anyone with the link can view
              </p>
            </div>
            <Switch
              id="edit-is_public"
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
