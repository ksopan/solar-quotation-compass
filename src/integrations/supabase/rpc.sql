
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

-- Function to insert sample questionnaire data for testing
CREATE OR REPLACE FUNCTION public.insert_sample_questionnaire(vendor_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO property_questionnaires (
    property_type,
    ownership_status, 
    monthly_electric_bill,
    roof_age_status,
    purchase_timeline,
    interested_in_batteries,
    battery_reason,
    willing_to_remove_trees,
    first_name,
    last_name,
    email,
    is_completed
  ) VALUES (
    'home',
    'own',
    245,
    'less_than_5',
    'within_year',
    true,
    'backup_power',
    false,
    'Test',
    'Customer',
    'test.customer@example.com',
    true
  ) RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.insert_sample_questionnaire(uuid) TO authenticated;
*/
