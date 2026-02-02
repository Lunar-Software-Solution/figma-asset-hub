import { cn } from "@/lib/utils";
import { SocialPlatform } from "@/hooks/useCampaignPosts";
import { PLATFORM_CONFIGS } from "./platformConfig";
import { MediaFile } from "./MediaUploader";
import { ExternalLink, Heart, MessageCircle, Repeat2, Share } from "lucide-react";

interface PlatformPreviewProps {
  platform: SocialPlatform;
  content: string;
  media: MediaFile[];
  linkUrl?: string;
}

export function PlatformPreview({ platform, content, media, linkUrl }: PlatformPreviewProps) {
  const config = PLATFORM_CONFIGS[platform];
  const isOverLimit = content.length > config.maxCharacters;
  const truncatedContent = isOverLimit
    ? content.slice(0, config.maxCharacters) + "..."
    : content;

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      {/* Platform Header */}
      <div
        className={cn(
          "px-3 py-2 flex items-center gap-2",
          config.bgColor
        )}
      >
        <span className="font-bold">{config.icon}</span>
        <span className="text-sm font-medium">{config.label}</span>
        {isOverLimit && (
          <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded">
            Over limit
          </span>
        )}
      </div>

      {/* Preview Content */}
      <div className="p-4">
        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-full bg-muted" />
          <div>
            <div className="font-medium text-sm">Your Brand</div>
            <div className="text-xs text-muted-foreground">@yourbrand</div>
          </div>
        </div>

        {/* Content */}
        <div className={cn("text-sm whitespace-pre-wrap", isOverLimit && "text-destructive")}>
          {truncatedContent || (
            <span className="text-muted-foreground italic">
              Your post content will appear here...
            </span>
          )}
        </div>

        {/* Link Preview */}
        {linkUrl && config.supportsLinks && (
          <div className="mt-3 border rounded-lg p-3 flex items-center gap-2 bg-muted/50">
            <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate">{linkUrl}</span>
          </div>
        )}

        {!config.supportsLinks && linkUrl && (
          <div className="mt-3 text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
            <span>⚠️</span>
            <span>{config.linkInBio ? "Link will be in bio" : "Links not supported"}</span>
          </div>
        )}

        {/* Media Preview */}
        {media.length > 0 && (
          <div
            className={cn(
              "mt-3 grid gap-1 rounded-lg overflow-hidden",
              media.length === 1 && "grid-cols-1",
              media.length === 2 && "grid-cols-2",
              media.length >= 3 && "grid-cols-2"
            )}
          >
            {media.slice(0, config.maxMedia).map((file, index) => (
              <div
                key={file.id}
                className={cn(
                  "aspect-video bg-muted relative",
                  media.length === 3 && index === 0 && "row-span-2 aspect-square"
                )}
              >
                {file.type === "image" ? (
                  <img
                    src={file.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl">▶</span>
                  </div>
                )}
              </div>
            ))}
            {media.length > config.maxMedia && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">
                +{media.length - config.maxMedia}
              </div>
            )}
          </div>
        )}

        {/* Engagement Preview */}
        <div className="mt-4 flex items-center gap-6 text-muted-foreground">
          <button className="flex items-center gap-1 text-xs hover:text-primary transition-colors">
            <Heart className="h-4 w-4" />
            <span>Like</span>
          </button>
          <button className="flex items-center gap-1 text-xs hover:text-primary transition-colors">
            <MessageCircle className="h-4 w-4" />
            <span>Comment</span>
          </button>
          {(platform === "twitter" || platform === "bluesky") && (
            <button className="flex items-center gap-1 text-xs hover:text-primary transition-colors">
              <Repeat2 className="h-4 w-4" />
              <span>Repost</span>
            </button>
          )}
          <button className="flex items-center gap-1 text-xs hover:text-primary transition-colors">
            <Share className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
