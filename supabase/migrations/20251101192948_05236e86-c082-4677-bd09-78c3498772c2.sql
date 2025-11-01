-- Update RLS policy to be more explicit for anonymous questionnaire creation
DROP POLICY IF EXISTS "Allow anonymous questionnaire creation" ON property_questionnaires;

-- Create a more explicit policy for anonymous users
CREATE POLICY "Allow anonymous questionnaire creation"
ON property_questionnaires
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- For anonymous users: allow if customer_id is NULL
  -- For authenticated users: allow if customer_id matches their user id OR is NULL
  (auth.uid() IS NULL AND customer_id IS NULL) OR 
  (auth.uid() IS NOT NULL AND (customer_id IS NULL OR customer_id = auth.uid()))
);