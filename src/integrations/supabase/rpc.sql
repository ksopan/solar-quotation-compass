
-- Function to help debug RLS policies for questionnaires
-- This should be run in Supabase SQL Editor
/*
CREATE OR REPLACE FUNCTION public.get_debug_questionnaires()
RETURNS SETOF property_questionnaires
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM property_questionnaires WHERE is_completed = true LIMIT 10;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_debug_questionnaires() TO authenticated;
*/
