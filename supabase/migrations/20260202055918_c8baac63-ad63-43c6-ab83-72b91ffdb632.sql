-- Create enums for campaign and post management
CREATE TYPE campaign_status AS ENUM ('draft', 'in_review', 'approved', 'active', 'paused', 'completed', 'archived');
CREATE TYPE post_status AS ENUM ('draft', 'pending_approval', 'approved', 'scheduled', 'publishing', 'published', 'failed');
CREATE TYPE social_platform AS ENUM ('facebook', 'instagram', 'twitter', 'linkedin', 'tiktok', 'pinterest', 'youtube', 'threads', 'bluesky');

-- Campaigns table - core campaign data
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status campaign_status NOT NULL DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12, 2),
  currency TEXT DEFAULT 'USD',
  goals JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  cover_image_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Campaign posts table - individual posts within campaigns
CREATE TABLE public.campaign_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  platforms social_platform[] NOT NULL DEFAULT '{}',
  platform_variants JSONB DEFAULT '{}'::jsonb,
  media_urls TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  mentions TEXT[] DEFAULT '{}',
  link_url TEXT,
  utm_params JSONB DEFAULT '{}'::jsonb,
  status post_status NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Post schedules table - scheduling information for posts
CREATE TABLE public.post_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.campaign_posts(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  published_at TIMESTAMP WITH TIME ZONE,
  publish_error TEXT,
  external_post_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, platform)
);

-- Add indexes for better query performance
CREATE INDEX idx_campaigns_team_id ON public.campaigns(team_id);
CREATE INDEX idx_campaigns_business_id ON public.campaigns(business_id);
CREATE INDEX idx_campaigns_brand_id ON public.campaigns(brand_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_dates ON public.campaigns(start_date, end_date);

CREATE INDEX idx_campaign_posts_campaign_id ON public.campaign_posts(campaign_id);
CREATE INDEX idx_campaign_posts_team_id ON public.campaign_posts(team_id);
CREATE INDEX idx_campaign_posts_status ON public.campaign_posts(status);
CREATE INDEX idx_campaign_posts_platforms ON public.campaign_posts USING GIN(platforms);

CREATE INDEX idx_post_schedules_post_id ON public.post_schedules(post_id);
CREATE INDEX idx_post_schedules_scheduled_for ON public.post_schedules(scheduled_for);
CREATE INDEX idx_post_schedules_platform ON public.post_schedules(platform);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns
CREATE POLICY "Team members can view campaigns"
  ON public.campaigns FOR SELECT
  USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "Editors can create campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (can_edit_team(auth.uid(), team_id));

CREATE POLICY "Editors can update campaigns"
  ON public.campaigns FOR UPDATE
  USING (can_edit_team(auth.uid(), team_id));

CREATE POLICY "Editors can delete campaigns"
  ON public.campaigns FOR DELETE
  USING (can_edit_team(auth.uid(), team_id));

-- RLS Policies for campaign_posts
CREATE POLICY "Team members can view campaign posts"
  ON public.campaign_posts FOR SELECT
  USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "Editors can create campaign posts"
  ON public.campaign_posts FOR INSERT
  WITH CHECK (can_edit_team(auth.uid(), team_id));

CREATE POLICY "Editors can update campaign posts"
  ON public.campaign_posts FOR UPDATE
  USING (can_edit_team(auth.uid(), team_id));

CREATE POLICY "Editors can delete campaign posts"
  ON public.campaign_posts FOR DELETE
  USING (can_edit_team(auth.uid(), team_id));

-- RLS Policies for post_schedules (uses join to campaign_posts for team check)
CREATE POLICY "Team members can view post schedules"
  ON public.post_schedules FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.campaign_posts cp
    WHERE cp.id = post_schedules.post_id
    AND is_team_member(auth.uid(), cp.team_id)
  ));

CREATE POLICY "Editors can create post schedules"
  ON public.post_schedules FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaign_posts cp
    WHERE cp.id = post_schedules.post_id
    AND can_edit_team(auth.uid(), cp.team_id)
  ));

CREATE POLICY "Editors can update post schedules"
  ON public.post_schedules FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.campaign_posts cp
    WHERE cp.id = post_schedules.post_id
    AND can_edit_team(auth.uid(), cp.team_id)
  ));

CREATE POLICY "Editors can delete post schedules"
  ON public.post_schedules FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.campaign_posts cp
    WHERE cp.id = post_schedules.post_id
    AND can_edit_team(auth.uid(), cp.team_id)
  ));

-- Triggers for updated_at
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_campaign_posts_updated_at
  BEFORE UPDATE ON public.campaign_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_post_schedules_updated_at
  BEFORE UPDATE ON public.post_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();