import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PostWithSchedules, PLATFORM_CONFIG, SocialPlatform } from "@/hooks/useCampaignPosts";

interface CalendarPostItemProps {
  post: PostWithSchedules;
  date: Date;
  onClick?: () => void;
}

export function CalendarPostItem({ post, date, onClick }: CalendarPostItemProps) {
  const schedule = post.post_schedules.find(
    (s) => format(new Date(s.scheduled_for), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
  );

  if (!schedule) return null;

  const platform = schedule.platform as SocialPlatform;
  const platformConfig = PLATFORM_CONFIG[platform];

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("postId", post.id);
    e.dataTransfer.setData("scheduleId", schedule.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        "group cursor-grab active:cursor-grabbing",
        "px-2 py-1 rounded text-xs",
        "bg-secondary hover:bg-secondary/80",
        "border-l-2 transition-colors",
        "truncate"
      )}
      style={{
        borderLeftColor: getPlatformColor(platform),
      }}
    >
      <div className="flex items-center gap-1">
        <span className="truncate font-medium">
          {post.title || post.content.slice(0, 30)}
        </span>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <span>{format(new Date(schedule.scheduled_for), "h:mm a")}</span>
        <span>•</span>
        <span>{platformConfig?.label || platform}</span>
      </div>
    </div>
  );
}

function getPlatformColor(platform: SocialPlatform): string {
  const colors: Record<SocialPlatform, string> = {
    facebook: "#1877F2",
    instagram: "#E4405F",
    twitter: "#000000",
    linkedin: "#0A66C2",
    tiktok: "#000000",
    pinterest: "#E60023",
    youtube: "#FF0000",
    threads: "#000000",
    bluesky: "#0085FF",
  };
  return colors[platform] || "#6366f1";
}
