-- Create businesses table
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#6366f1',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add business_id to brands table
ALTER TABLE public.brands 
ADD COLUMN business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;

-- Add business_id to business_canvases (optional, for business-level canvas)
ALTER TABLE public.business_canvases 
ADD COLUMN business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
ALTER COLUMN brand_id DROP NOT NULL;

-- Add check constraint: canvas must have either brand_id OR business_id
ALTER TABLE public.business_canvases 
ADD CONSTRAINT canvas_has_owner CHECK (
  (brand_id IS NOT NULL AND business_id IS NULL) OR 
  (brand_id IS NULL AND business_id IS NOT NULL)
);

-- Enable RLS on businesses
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- RLS policies for businesses
CREATE POLICY "Team members can view businesses"
ON public.businesses
FOR SELECT
USING (is_team_member(auth.uid(), team_id));

CREATE POLICY "Editors can manage businesses"
ON public.businesses
FOR ALL
USING (can_edit_team(auth.uid(), team_id));

-- Create trigger for updated_at
CREATE TRIGGER update_businesses_updated_at
BEFORE UPDATE ON public.businesses
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster lookups
CREATE INDEX idx_brands_business_id ON public.brands(business_id);
CREATE INDEX idx_businesses_team_id ON public.businesses(team_id);
CREATE INDEX idx_business_canvases_business_id ON public.business_canvases(business_id);