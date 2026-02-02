import { useState } from "react";
import { format, setHours, setMinutes } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ContentCalendar } from "@/components/calendar/ContentCalendar";
import { PostComposer } from "@/components/composer";
import { useCampaigns } from "@/hooks/useCampaigns";
import { useCampaignPosts, PostWithSchedules, SocialPlatform } from "@/hooks/useCampaignPosts";
import { useToast } from "@/hooks/use-toast";

export default function Calendar() {
  const { campaigns } = useCampaigns();
  const { posts, isLoading, createPost, schedulePost, updateSchedule } = useCampaignPosts();
  const { toast } = useToast();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setCreateDialogOpen(true);
  };

  const handlePostClick = (post: PostWithSchedules) => {
    // Could open an edit dialog or navigate to post details
    console.log("Post clicked:", post);
  };

  const handlePostDrop = async (postId: string, scheduleId: string, newDate: Date) => {
    try {
      // Get the current schedule to preserve the time
      const post = posts.find((p) => p.id === postId);
      const schedule = post?.post_schedules.find((s) => s.id === scheduleId);
      
      if (!schedule) return;

      const currentTime = new Date(schedule.scheduled_for);
      const newDateTime = setMinutes(
        setHours(newDate, currentTime.getHours()),
        currentTime.getMinutes()
      );

      await updateSchedule(scheduleId, {
        scheduled_for: newDateTime.toISOString(),
      });

      toast({
        title: "Post rescheduled",
        description: `Post moved to ${format(newDateTime, "MMM d, yyyy 'at' h:mm a")}`,
      });
    } catch (error) {
      console.error("Failed to reschedule post:", error);
      toast({
        title: "Failed to reschedule",
        description: "Could not move the post. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreatePost = async (data: {
    title?: string;
    content: string;
    campaign_id: string;
    platforms: SocialPlatform[];
    scheduled_date?: Date;
    scheduled_time?: string;
    link_url?: string;
    hashtags?: string[];
    media_urls?: string[];
  }) => {
    // Create the post
    const newPost = await createPost({
      campaign_id: data.campaign_id,
      title: data.title,
      content: data.content,
      platforms: data.platforms,
      link_url: data.link_url || null,
      hashtags: data.hashtags || null,
      media_urls: data.media_urls || null,
    });

    // If a schedule date is provided, create schedules for each platform
    if (data.scheduled_date && data.scheduled_time) {
      const [hours, minutes] = data.scheduled_time.split(":").map(Number);
      const scheduledDateTime = setMinutes(
        setHours(data.scheduled_date, hours),
        minutes
      );

      // Create a schedule for each selected platform
      for (const platform of data.platforms) {
        await schedulePost(newPost.id, {
          platform,
          scheduled_for: scheduledDateTime.toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      }
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-7rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Content Calendar</h1>
            <p className="text-muted-foreground">
              Schedule and manage your social media posts
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>

        {/* Calendar */}
        <ContentCalendar
          posts={posts}
          isLoading={isLoading}
          onPostClick={handlePostClick}
          onDateClick={handleDateClick}
          onPostDrop={handlePostDrop}
        />

        {/* Post Composer */}
        <PostComposer
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          campaigns={campaigns}
          initialDate={selectedDate}
          onSubmit={handleCreatePost}
        />
      </div>
    </AppLayout>
  );
}
