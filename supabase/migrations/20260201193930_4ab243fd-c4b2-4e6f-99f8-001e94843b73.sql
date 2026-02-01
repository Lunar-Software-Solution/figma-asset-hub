-- Create a function to create a team with the creator as admin
-- This ensures both records are created atomically
CREATE OR REPLACE FUNCTION public.create_team_with_admin(
  _name text,
  _description text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _team_id uuid;
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Create the team
  INSERT INTO public.teams (name, description, created_by)
  VALUES (_name, _description, _user_id)
  RETURNING id INTO _team_id;
  
  -- Add the creator as admin
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (_team_id, _user_id, 'admin');
  
  RETURN _team_id;
END;
$$;