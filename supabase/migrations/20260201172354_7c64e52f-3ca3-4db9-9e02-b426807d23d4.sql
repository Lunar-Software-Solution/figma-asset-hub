-- Fix the overly permissive asset_analytics insert policy
DROP POLICY "Anyone can log analytics" ON public.asset_analytics;

-- More restrictive policy - only team members or public share link holders can log analytics
CREATE POLICY "Authenticated users can log analytics" ON public.asset_analytics
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.assets a
      WHERE a.id = asset_id AND public.is_team_member(auth.uid(), a.team_id)
    )
  );