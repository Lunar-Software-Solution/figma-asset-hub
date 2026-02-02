import { cn } from "@/lib/utils";
import { SocialPlatform } from "@/hooks/useCampaignPosts";
import { PLATFORM_CONFIGS } from "./platformConfig";
import { Check } from "lucide-react";

interface PlatformSelectorProps {
  selectedPlatforms: SocialPlatform[];
  onToggle: (platform: SocialPlatform) => void;
}

export function PlatformSelector({ selectedPlatforms, onToggle }: PlatformSelectorProps) {
  const platforms = Object.values(PLATFORM_CONFIGS);

  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((platform) => {
        const isSelected = selectedPlatforms.includes(platform.id);
        
        return (
          <button
            key={platform.id}
            type="button"
            onClick={() => onToggle(platform.id)}
            className={cn(
              "relative flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all",
              "text-sm font-medium",
              isSelected
                ? "border-primary bg-primary/10"
                : "border-border hover:border-muted-foreground/50 hover:bg-muted/50"
            )}
          >
            <span
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                platform.bgColor
              )}
            >
              {platform.icon}
            </span>
            <span>{platform.shortLabel}</span>
            {isSelected && (
              <Check className="h-4 w-4 text-primary absolute -top-1 -right-1 bg-background rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
