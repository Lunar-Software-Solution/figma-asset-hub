-- Add unique constraint on team_id for figma_connections upsert
ALTER TABLE public.figma_connections 
ADD CONSTRAINT figma_connections_team_id_key UNIQUE (team_id);