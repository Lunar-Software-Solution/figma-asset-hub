-- Add business_id and campaign_id to collections
ALTER TABLE public.collections 
ADD COLUMN business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
ADD COLUMN campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE;

-- Add check constraint: collection can have at most one owner
ALTER TABLE public.collections 
ADD CONSTRAINT collection_single_owner CHECK (
  (CASE WHEN campaign_id IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN brand_id IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN business_id IS NOT NULL THEN 1 ELSE 0 END) <= 1
);

-- Add indexes for query performance
CREATE INDEX idx_collections_business_id ON public.collections(business_id);
CREATE INDEX idx_collections_campaign_id ON public.collections(campaign_id);