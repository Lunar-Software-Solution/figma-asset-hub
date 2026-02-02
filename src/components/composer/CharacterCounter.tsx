import { cn } from "@/lib/utils";
import { SocialPlatform } from "@/hooks/useCampaignPosts";
import { PLATFORM_CONFIGS } from "./platformConfig";

interface CharacterCounterProps {
  content: string;
  platforms: SocialPlatform[];
}

export function CharacterCounter({ content, platforms }: CharacterCounterProps) {
  const charCount = content.length;

  if (platforms.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">
        {charCount} characters
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((platformId) => {
        const platform = PLATFORM_CONFIGS[platformId];
        const remaining = platform.maxCharacters - charCount;
        const percentage = (charCount / platform.maxCharacters) * 100;
        
        const isWarning = percentage >= 80 && percentage < 100;
        const isOver = percentage >= 100;

        return (
          <div
            key={platformId}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded text-xs",
              isOver
                ? "bg-destructive/20 text-destructive"
                : isWarning
                ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold",
                platform.bgColor
              )}
            >
              {platform.icon}
            </span>
            <span className="font-medium">
              {remaining >= 0 ? remaining : remaining}
            </span>
          </div>
        );
      })}
    </div>
  );
}
