import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PostWithSchedules } from "@/hooks/useCampaignPosts";
import { CalendarDay } from "./CalendarDay";

export type CalendarViewMode = "month" | "week";

interface ContentCalendarProps {
  posts: PostWithSchedules[];
  isLoading: boolean;
  onPostClick?: (post: PostWithSchedules) => void;
  onDateClick?: (date: Date) => void;
  onPostDrop?: (postId: string, scheduleId: string, newDate: Date) => void;
}

export function ContentCalendar({
  posts,
  isLoading,
  onPostClick,
  onDateClick,
  onPostDrop,
}: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");

  const calendarDays = useMemo(() => {
    if (viewMode === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    } else {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
  }, [currentDate, viewMode]);

  const postsForDate = useMemo(() => {
    const map = new Map<string, PostWithSchedules[]>();
    
    posts.forEach((post) => {
      post.post_schedules.forEach((schedule) => {
        const dateKey = format(new Date(schedule.scheduled_for), "yyyy-MM-dd");
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(post);
      });
    });
    
    return map;
  }, [posts]);

  const navigatePrevious = () => {
    if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const postId = e.dataTransfer.getData("postId");
    const scheduleId = e.dataTransfer.getData("scheduleId");
    
    if (postId && scheduleId && onPostDrop) {
      onPostDrop(postId, scheduleId, date);
    }
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col h-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={navigatePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
          <h2 className="text-xl font-semibold ml-4">
            {viewMode === "month"
              ? format(currentDate, "MMMM yyyy")
              : `Week of ${format(startOfWeek(currentDate), "MMM d, yyyy")}`}
          </h2>
        </div>

        <Select value={viewMode} onValueChange={(v) => setViewMode(v as CalendarViewMode)}>
          <SelectTrigger className="w-[130px]">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="week">Week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 border rounded-lg overflow-hidden">
        {/* Week Day Headers */}
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="px-2 py-3 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div
          className={cn(
            "grid grid-cols-7",
            viewMode === "month" ? "auto-rows-fr" : "h-[calc(100%-45px)]"
          )}
        >
          {calendarDays.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayPosts = postsForDate.get(dateKey) || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);

            return (
              <CalendarDay
                key={dateKey}
                date={day}
                posts={dayPosts}
                isCurrentMonth={isCurrentMonth}
                isToday={isDayToday}
                isWeekView={viewMode === "week"}
                onPostClick={onPostClick}
                onDateClick={onDateClick}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
