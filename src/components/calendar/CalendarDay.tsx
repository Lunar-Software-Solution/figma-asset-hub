import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { PostWithSchedules, PLATFORM_CONFIG } from "@/hooks/useCampaignPosts";
import { CalendarPostItem } from "./CalendarPostItem";

interface CalendarDayProps {
  date: Date;
  posts: PostWithSchedules[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekView: boolean;
  onPostClick?: (post: PostWithSchedules) => void;
  onDateClick?: (date: Date) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export function CalendarDay({
  date,
  posts,
  isCurrentMonth,
  isToday,
  isWeekView,
  onPostClick,
  onDateClick,
  onDragOver,
  onDrop,
}: CalendarDayProps) {
  const maxVisiblePosts = isWeekView ? 10 : 3;
  const visiblePosts = posts.slice(0, maxVisiblePosts);
  const hiddenCount = posts.length - maxVisiblePosts;

  return (
    <div
      className={cn(
        "border-r border-b p-1 min-h-[100px] transition-colors",
        isWeekView && "min-h-[400px]",
        !isCurrentMonth && "bg-muted/30",
        "hover:bg-muted/20"
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={() => onDateClick?.(date)}
    >
      {/* Date Number */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            "inline-flex items-center justify-center w-7 h-7 text-sm rounded-full",
            isToday && "bg-primary text-primary-foreground font-semibold",
            !isCurrentMonth && "text-muted-foreground"
          )}
        >
          {format(date, "d")}
        </span>
      </div>

      {/* Posts */}
      <div className="space-y-1">
        {visiblePosts.map((post) => (
          <CalendarPostItem
            key={post.id}
            post={post}
            date={date}
            onClick={() => onPostClick?.(post)}
          />
        ))}

        {hiddenCount > 0 && (
          <button
            className="w-full text-xs text-muted-foreground hover:text-foreground py-0.5 text-left"
            onClick={(e) => {
              e.stopPropagation();
              // Could open a modal showing all posts for this day
            }}
          >
            +{hiddenCount} more
          </button>
        )}
      </div>
    </div>
  );
}
