-- Drop the existing policy
DROP POLICY IF EXISTS "questionnaires_insert_policy" ON property_questionnaires;

-- Create separate, explicit policies for each role
-- Policy for anonymous (unauthenticated) users
CREATE POLICY "anon_can_insert_questionnaires"
ON property_questionnaires
FOR INSERT
TO anon
WITH CHECK (customer_id IS NULL);

-- Policy for authenticated users  
CREATE POLICY "authenticated_can_insert_questionnaires"
ON property_questionnaires
FOR INSERT
TO authenticated
WITH CHECK (
  customer_id IS NULL OR customer_id = auth.uid()
);