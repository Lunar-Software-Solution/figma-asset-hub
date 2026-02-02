import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Loader2, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MediaFile {
  id: string;
  url: string;
  type: "image" | "video";
  name: string;
  size: number;
}

interface MediaUploaderProps {
  media: MediaFile[];
  onMediaChange: (media: MediaFile[]) => void;
  maxFiles: number;
  acceptedTypes?: string[];
}

export function MediaUploader({
  media,
  onMediaChange,
  maxFiles,
  acceptedTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4"],
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxFiles - media.length;
    if (files.length > remainingSlots) {
      toast({
        title: "Too many files",
        description: `You can only add ${remainingSlots} more file(s)`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const uploadedMedia: MediaFile[] = [];

      for (const file of files) {
        if (!acceptedTypes.includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a supported file type`,
            variant: "destructive",
          });
          continue;
        }

        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds the 50MB limit`,
            variant: "destructive",
          });
          continue;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("assets")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive",
          });
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("assets")
          .getPublicUrl(filePath);

        uploadedMedia.push({
          id: crypto.randomUUID(),
          url: urlData.publicUrl,
          type: file.type.startsWith("video/") ? "video" : "image",
          name: file.name,
          size: file.size,
        });
      }

      if (uploadedMedia.length > 0) {
        onMediaChange([...media, ...uploadedMedia]);
        toast({
          title: "Upload complete",
          description: `${uploadedMedia.length} file(s) uploaded successfully`,
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = (id: string) => {
    onMediaChange(media.filter((m) => m.id !== id));
  };

  const canAddMore = media.length < maxFiles;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Media ({media.length}/{maxFiles})
        </span>
        {canAddMore && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4 mr-2" />
            )}
            Add Media
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {media.map((file) => (
            <div
              key={file.id}
              className="relative group aspect-video rounded-lg overflow-hidden bg-muted"
            >
              {file.type === "image" ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemove(file.id)}
                className={cn(
                  "absolute top-1 right-1 p-1 rounded-full",
                  "bg-black/50 text-white hover:bg-black/70",
                  "opacity-0 group-hover:opacity-100 transition-opacity"
                )}
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/50 text-white text-xs truncate">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {media.length === 0 && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={cn(
            "w-full border-2 border-dashed border-muted-foreground/25 rounded-lg p-6",
            "flex flex-col items-center justify-center gap-2",
            "text-muted-foreground hover:border-muted-foreground/50 hover:bg-muted/50",
            "transition-colors cursor-pointer"
          )}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <ImagePlus className="h-8 w-8" />
          )}
          <span className="text-sm">Click to upload media</span>
          <span className="text-xs">Images and videos up to 50MB</span>
        </button>
      )}
    </div>
  );
}
