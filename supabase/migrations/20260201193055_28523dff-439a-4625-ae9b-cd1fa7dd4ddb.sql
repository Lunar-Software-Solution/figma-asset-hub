-- Create brands table with parent/child for sub-brands
CREATE TABLE public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#6366f1',
    secondary_color TEXT,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add brand_id to assets table
ALTER TABLE public.assets ADD COLUMN brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL;

-- Add brand_id to collections table
ALTER TABLE public.collections ADD COLUMN brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL;

-- Add brand_id to folders table
ALTER TABLE public.folders ADD COLUMN brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL;

-- Enable RLS on brands
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- RLS policies for brands
CREATE POLICY "Team members can view brands" ON public.brands
FOR SELECT USING (public.is_team_member(auth.uid(), team_id));

CREATE POLICY "Editors can manage brands" ON public.brands
FOR ALL USING (public.can_edit_team(auth.uid(), team_id));

-- Indexes for performance
CREATE INDEX idx_brands_team_id ON public.brands(team_id);
CREATE INDEX idx_brands_parent_id ON public.brands(parent_id);
CREATE INDEX idx_assets_brand_id ON public.assets(brand_id);
CREATE INDEX idx_collections_brand_id ON public.collections(brand_id);
CREATE INDEX idx_folders_brand_id ON public.folders(brand_id);

-- Updated at trigger
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON public.brands
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();