-- Create role enum for team access
CREATE TYPE public.team_role AS ENUM ('viewer', 'editor', 'admin');

-- Create asset type enum
CREATE TYPE public.asset_type AS ENUM ('image', 'icon', 'vector', 'design_file', 'brand_asset', 'other');

-- Create asset status enum
CREATE TYPE public.asset_status AS ENUM ('draft', 'pending_review', 'approved', 'rejected');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team members table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role team_role NOT NULL DEFAULT 'viewer',
  invited_by UUID,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create folders table
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assets table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  asset_type asset_type NOT NULL DEFAULT 'other',
  status asset_status NOT NULL DEFAULT 'draft',
  metadata JSONB DEFAULT '{}',
  current_version INTEGER NOT NULL DEFAULT 1,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create asset versions table
CREATE TABLE public.asset_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(asset_id, version_number)
);

-- Create tags table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, name)
);

-- Create asset tags junction table
CREATE TABLE public.asset_tags (
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (asset_id, tag_id)
);

-- Create collections table
CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collection assets junction table
CREATE TABLE public.collection_assets (
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, asset_id)
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity log table
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create asset analytics table
CREATE TABLE public.asset_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  user_id UUID,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create share links table
CREATE TABLE public.share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT share_link_target CHECK (
    (asset_id IS NOT NULL AND collection_id IS NULL) OR
    (asset_id IS NULL AND collection_id IS NOT NULL)
  )
);

-- Create figma connections table
CREATE TABLE public.figma_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  figma_user_id TEXT NOT NULL,
  figma_email TEXT,
  connected_by UUID NOT NULL,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.figma_connections ENABLE ROW LEVEL SECURITY;

-- Helper function to check team membership
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id
  )
$$;

-- Helper function to check team role
CREATE OR REPLACE FUNCTION public.get_team_role(_user_id UUID, _team_id UUID)
RETURNS team_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.team_members
  WHERE user_id = _user_id AND team_id = _team_id
$$;

-- Helper function to check if user can edit (editor or admin)
CREATE OR REPLACE FUNCTION public.can_edit_team(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id AND role IN ('editor', 'admin')
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for teams
CREATE POLICY "Team members can view their teams" ON public.teams
  FOR SELECT USING (public.is_team_member(auth.uid(), id));

CREATE POLICY "Users can create teams" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team admins can update teams" ON public.teams
  FOR UPDATE USING (public.get_team_role(auth.uid(), id) = 'admin');

CREATE POLICY "Team admins can delete teams" ON public.teams
  FOR DELETE USING (public.get_team_role(auth.uid(), id) = 'admin');

-- RLS Policies for team_members
CREATE POLICY "Team members can view other members" ON public.team_members
  FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Team admins can manage members" ON public.team_members
  FOR ALL USING (public.get_team_role(auth.uid(), team_id) = 'admin');

-- RLS Policies for folders
CREATE POLICY "Team members can view folders" ON public.folders
  FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Editors can manage folders" ON public.folders
  FOR ALL USING (public.can_edit_team(auth.uid(), team_id));

-- RLS Policies for assets
CREATE POLICY "Team members can view assets" ON public.assets
  FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Editors can create assets" ON public.assets
  FOR INSERT WITH CHECK (public.can_edit_team(auth.uid(), team_id));

CREATE POLICY "Editors can update assets" ON public.assets
  FOR UPDATE USING (public.can_edit_team(auth.uid(), team_id));

CREATE POLICY "Editors can delete assets" ON public.assets
  FOR DELETE USING (public.can_edit_team(auth.uid(), team_id));

-- RLS Policies for asset_versions
CREATE POLICY "Team members can view versions" ON public.asset_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assets a
      WHERE a.id = asset_id AND public.is_team_member(auth.uid(), a.team_id)
    )
  );

CREATE POLICY "Editors can create versions" ON public.asset_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assets a
      WHERE a.id = asset_id AND public.can_edit_team(auth.uid(), a.team_id)
    )
  );

-- RLS Policies for tags
CREATE POLICY "Team members can view tags" ON public.tags
  FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Editors can manage tags" ON public.tags
  FOR ALL USING (public.can_edit_team(auth.uid(), team_id));

-- RLS Policies for asset_tags
CREATE POLICY "Team members can view asset tags" ON public.asset_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assets a
      WHERE a.id = asset_id AND public.is_team_member(auth.uid(), a.team_id)
    )
  );

CREATE POLICY "Editors can manage asset tags" ON public.asset_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.assets a
      WHERE a.id = asset_id AND public.can_edit_team(auth.uid(), a.team_id)
    )
  );

-- RLS Policies for collections
CREATE POLICY "Team members can view collections" ON public.collections
  FOR SELECT USING (public.is_team_member(auth.uid(), team_id) OR is_public = true);

CREATE POLICY "Editors can manage collections" ON public.collections
  FOR ALL USING (public.can_edit_team(auth.uid(), team_id));

-- RLS Policies for collection_assets
CREATE POLICY "Team members can view collection assets" ON public.collection_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id AND (public.is_team_member(auth.uid(), c.team_id) OR c.is_public = true)
    )
  );

CREATE POLICY "Editors can manage collection assets" ON public.collection_assets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id AND public.can_edit_team(auth.uid(), c.team_id)
    )
  );

-- RLS Policies for comments
CREATE POLICY "Team members can view comments" ON public.comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assets a
      WHERE a.id = asset_id AND public.is_team_member(auth.uid(), a.team_id)
    )
  );

CREATE POLICY "Team members can create comments" ON public.comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assets a
      WHERE a.id = asset_id AND public.is_team_member(auth.uid(), a.team_id)
    ) AND auth.uid() = user_id
  );

CREATE POLICY "Users can update own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for activity_log
CREATE POLICY "Team members can view activity" ON public.activity_log
  FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Team members can log activity" ON public.activity_log
  FOR INSERT WITH CHECK (public.is_team_member(auth.uid(), team_id) AND auth.uid() = user_id);

-- RLS Policies for asset_analytics
CREATE POLICY "Team members can view analytics" ON public.asset_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.assets a
      WHERE a.id = asset_id AND public.is_team_member(auth.uid(), a.team_id)
    )
  );

CREATE POLICY "Anyone can log analytics" ON public.asset_analytics
  FOR INSERT WITH CHECK (true);

-- RLS Policies for share_links
CREATE POLICY "Team members can view share links" ON public.share_links
  FOR SELECT USING (
    (asset_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.assets a
      WHERE a.id = asset_id AND public.is_team_member(auth.uid(), a.team_id)
    )) OR
    (collection_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id AND public.is_team_member(auth.uid(), c.team_id)
    ))
  );

CREATE POLICY "Editors can manage share links" ON public.share_links
  FOR ALL USING (
    (asset_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.assets a
      WHERE a.id = asset_id AND public.can_edit_team(auth.uid(), a.team_id)
    )) OR
    (collection_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id AND public.can_edit_team(auth.uid(), c.team_id)
    ))
  );

-- RLS Policies for figma_connections
CREATE POLICY "Team members can view figma connections" ON public.figma_connections
  FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Admins can manage figma connections" ON public.figma_connections
  FOR ALL USING (public.get_team_role(auth.uid(), team_id) = 'admin');

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON public.folders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_figma_connections_updated_at BEFORE UPDATE ON public.figma_connections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for assets
INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', true);

-- Storage policies for assets bucket
CREATE POLICY "Team members can upload assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'assets' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view public assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'assets');

CREATE POLICY "Asset owners can delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'assets' AND auth.role() = 'authenticated');

-- Create indexes for better query performance
CREATE INDEX idx_assets_team_id ON public.assets(team_id);
CREATE INDEX idx_assets_folder_id ON public.assets(folder_id);
CREATE INDEX idx_assets_created_at ON public.assets(created_at DESC);
CREATE INDEX idx_folders_team_id ON public.folders(team_id);
CREATE INDEX idx_folders_parent_id ON public.folders(parent_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_activity_log_team_id ON public.activity_log(team_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX idx_asset_analytics_asset_id ON public.asset_analytics(asset_id);
CREATE INDEX idx_comments_asset_id ON public.comments(asset_id);