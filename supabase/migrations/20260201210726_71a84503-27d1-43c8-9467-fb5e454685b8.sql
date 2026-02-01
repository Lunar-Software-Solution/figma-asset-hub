-- Create enum for block types
CREATE TYPE public.canvas_block_type AS ENUM (
  'key_partners',
  'key_activities',
  'key_resources',
  'value_propositions',
  'customer_relationships',
  'channels',
  'customer_segments',
  'cost_structure',
  'revenue_streams'
);

-- Create business_canvases table
CREATE TABLE public.business_canvases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(brand_id)
);

-- Create business_canvas_items table
CREATE TABLE public.business_canvas_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  canvas_id UUID NOT NULL REFERENCES public.business_canvases(id) ON DELETE CASCADE,
  block_type public.canvas_block_type NOT NULL,
  content TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'yellow',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_canvases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_canvas_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for business_canvases
CREATE POLICY "Team members can view canvases"
  ON public.business_canvases
  FOR SELECT
  USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "Editors can create canvases"
  ON public.business_canvases
  FOR INSERT
  WITH CHECK (can_edit_team(auth.uid(), team_id));

CREATE POLICY "Editors can update canvases"
  ON public.business_canvases
  FOR UPDATE
  USING (can_edit_team(auth.uid(), team_id));

CREATE POLICY "Editors can delete canvases"
  ON public.business_canvases
  FOR DELETE
  USING (can_edit_team(auth.uid(), team_id));

-- RLS policies for business_canvas_items
CREATE POLICY "Team members can view canvas items"
  ON public.business_canvas_items
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.business_canvases c
    WHERE c.id = business_canvas_items.canvas_id
    AND is_team_member(auth.uid(), c.team_id)
  ));

CREATE POLICY "Editors can create canvas items"
  ON public.business_canvas_items
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.business_canvases c
    WHERE c.id = business_canvas_items.canvas_id
    AND can_edit_team(auth.uid(), c.team_id)
  ));

CREATE POLICY "Editors can update canvas items"
  ON public.business_canvas_items
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.business_canvases c
    WHERE c.id = business_canvas_items.canvas_id
    AND can_edit_team(auth.uid(), c.team_id)
  ));

CREATE POLICY "Editors can delete canvas items"
  ON public.business_canvas_items
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.business_canvases c
    WHERE c.id = business_canvas_items.canvas_id
    AND can_edit_team(auth.uid(), c.team_id)
  ));

-- Add updated_at triggers
CREATE TRIGGER update_business_canvases_updated_at
  BEFORE UPDATE ON public.business_canvases
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_business_canvas_items_updated_at
  BEFORE UPDATE ON public.business_canvas_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();