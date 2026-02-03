-- Create status enum
CREATE TYPE public.initiative_status AS ENUM (
  'planning',
  'in_progress', 
  'on_hold',
  'completed',
  'cancelled'
);

-- Create priority enum
CREATE TYPE public.initiative_priority AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- Create strategic_initiatives table
CREATE TABLE public.strategic_initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status initiative_status NOT NULL DEFAULT 'planning',
  priority initiative_priority NOT NULL DEFAULT 'medium',
  
  -- Planning fields
  strategic_goals JSONB DEFAULT '[]'::jsonb,
  action_plan TEXT,
  timeline_start DATE,
  timeline_end DATE,
  resources_needed TEXT,
  risks TEXT,
  stakeholders JSONB DEFAULT '[]'::jsonb,
  success_metrics JSONB DEFAULT '[]'::jsonb,
  
  -- Hierarchy
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Metadata
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add initiative_id to campaigns table
ALTER TABLE public.campaigns 
ADD COLUMN initiative_id UUID REFERENCES strategic_initiatives(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.strategic_initiatives ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Team members can view initiatives"
  ON public.strategic_initiatives FOR SELECT
  USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "Editors can create initiatives"
  ON public.strategic_initiatives FOR INSERT
  WITH CHECK (can_edit_team(auth.uid(), team_id));

CREATE POLICY "Editors can update initiatives"
  ON public.strategic_initiatives FOR UPDATE
  USING (can_edit_team(auth.uid(), team_id));

CREATE POLICY "Editors can delete initiatives"
  ON public.strategic_initiatives FOR DELETE
  USING (can_edit_team(auth.uid(), team_id));

-- Indexes for performance
CREATE INDEX idx_initiatives_team_id ON public.strategic_initiatives(team_id);
CREATE INDEX idx_initiatives_business_id ON public.strategic_initiatives(business_id);
CREATE INDEX idx_campaigns_initiative_id ON public.campaigns(initiative_id);

-- Trigger for updated_at
CREATE TRIGGER update_strategic_initiatives_updated_at
  BEFORE UPDATE ON public.strategic_initiatives
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();