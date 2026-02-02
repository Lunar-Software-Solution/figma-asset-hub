import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, setHours, setMinutes } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Loader2, Clock, Eye, Edit3, Hash, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Campaign } from "@/hooks/useCampaigns";
import { SocialPlatform } from "@/hooks/useCampaignPosts";
import { PlatformSelector } from "./PlatformSelector";
import { CharacterCounter } from "./CharacterCounter";
import { MediaUploader, MediaFile } from "./MediaUploader";
import { PlatformPreview } from "./PlatformPreview";
import { getCharacterLimit, getMediaLimit, PLATFORM_CONFIGS } from "./platformConfig";
import { ScrollArea } from "@/components/ui/scroll-area";

const postSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  campaign_id: z.string().min(1, "Campaign is required"),
  scheduled_date: z.date().optional(),
  scheduled_time: z.string().optional(),
  link_url: z.string().url().optional().or(z.literal("")),
  hashtags: z.string().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

interface PostComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaigns: Campaign[];
  initialDate?: Date;
  onSubmit: (data: {
    title?: string;
    content: string;
    campaign_id: string;
    platforms: SocialPlatform[];
    scheduled_date?: Date;
    scheduled_time?: string;
    link_url?: string;
    hashtags?: string[];
    media_urls?: string[];
  }) => Promise<void>;
}

const TIMES = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  const ampm = hour < 12 ? "AM" : "PM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return {
    value: `${hour.toString().padStart(2, "0")}:${minute}`,
    label: `${displayHour}:${minute} ${ampm}`,
  };
});

export function PostComposer({
  open,
  onOpenChange,
  campaigns,
  initialDate,
  onSubmit,
}: PostComposerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [activeTab, setActiveTab] = useState<"compose" | "preview">("compose");

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      campaign_id: "",
      scheduled_date: initialDate,
      scheduled_time: "09:00",
      link_url: "",
      hashtags: "",
    },
  });

  const content = form.watch("content");
  const linkUrl = form.watch("link_url");

  useEffect(() => {
    if (initialDate) {
      form.setValue("scheduled_date", initialDate);
    }
  }, [initialDate, form]);

  useEffect(() => {
    if (!open) {
      form.reset();
      setSelectedPlatforms([]);
      setMedia([]);
      setActiveTab("compose");
    }
  }, [open, form]);

  const handlePlatformToggle = (platform: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = async (data: PostFormValues) => {
    if (selectedPlatforms.length === 0) {
      form.setError("content", { message: "Select at least one platform" });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: data.title || undefined,
        content: data.content,
        campaign_id: data.campaign_id,
        platforms: selectedPlatforms,
        scheduled_date: data.scheduled_date,
        scheduled_time: data.scheduled_time,
        link_url: data.link_url || undefined,
        hashtags: data.hashtags
          ? data.hashtags.split(",").map((h) => h.trim().replace(/^#/, ""))
          : undefined,
        media_urls: media.map((m) => m.url),
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const charLimit = getCharacterLimit(selectedPlatforms);
  const mediaLimit = getMediaLimit(selectedPlatforms);
  const isOverLimit = content.length > charLimit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "compose" | "preview")}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="mx-6 mt-2 w-fit shrink-0">
            <TabsTrigger value="compose" className="gap-2">
              <Edit3 className="h-4 w-4" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex-1 flex flex-col min-h-0"
            >
              <TabsContent value="compose" className="flex-1 min-h-0 m-0">
                <ScrollArea className="h-full">
                  <div className="p-6 space-y-6">
                    {/* Platform Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Platforms</label>
                      <PlatformSelector
                        selectedPlatforms={selectedPlatforms}
                        onToggle={handlePlatformToggle}
                      />
                      {selectedPlatforms.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          Select platforms to post to
                        </p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {/* Campaign */}
                        <FormField
                          control={form.control}
                          name="campaign_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Campaign</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select campaign" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {campaigns.map((campaign) => (
                                    <SelectItem key={campaign.id} value={campaign.id}>
                                      {campaign.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Title */}
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title (internal)</FormLabel>
                              <FormControl>
                                <Input placeholder="Post title for reference" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Content */}
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center justify-between">
                                <FormLabel>Content</FormLabel>
                                <CharacterCounter
                                  content={content}
                                  platforms={selectedPlatforms}
                                />
                              </div>
                              <FormControl>
                                <Textarea
                                  placeholder="What do you want to share?"
                                  className={cn(
                                    "resize-none min-h-[150px]",
                                    isOverLimit && "border-destructive focus-visible:ring-destructive"
                                  )}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Link URL */}
                        <FormField
                          control={form.control}
                          name="link_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <LinkIcon className="h-4 w-4" />
                                Link URL
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="https://example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Hashtags */}
                        <FormField
                          control={form.control}
                          name="hashtags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Hash className="h-4 w-4" />
                                Hashtags
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="marketing, social, content"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4">
                        {/* Schedule */}
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="scheduled_date"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Schedule Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "MMM d, yyyy")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      initialFocus
                                      className={cn("p-3 pointer-events-auto")}
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="scheduled_time"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Time</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <Clock className="h-4 w-4 mr-2 opacity-50" />
                                      <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="max-h-[200px]">
                                    {TIMES.map((time) => (
                                      <SelectItem key={time.value} value={time.value}>
                                        {time.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Media */}
                        <MediaUploader
                          media={media}
                          onMediaChange={setMedia}
                          maxFiles={mediaLimit}
                        />
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="preview" className="flex-1 min-h-0 m-0">
                <ScrollArea className="h-full">
                  <div className="p-6">
                    {selectedPlatforms.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        Select platforms to see previews
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {selectedPlatforms.map((platform) => (
                          <PlatformPreview
                            key={platform}
                            platform={platform}
                            content={content}
                            media={media}
                            linkUrl={linkUrl}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              {/* Footer */}
              <div className="border-t px-6 py-4 flex justify-between items-center shrink-0">
                <div className="text-sm text-muted-foreground">
                  {selectedPlatforms.length} platform(s) selected
                  {media.length > 0 && ` • ${media.length} media file(s)`}
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || selectedPlatforms.length === 0}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Post
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
