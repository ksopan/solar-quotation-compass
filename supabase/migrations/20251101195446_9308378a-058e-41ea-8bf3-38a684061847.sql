-- Drop existing conflicting INSERT policies on property_questionnaires
DROP POLICY IF EXISTS "Allow anonymous questionnaire creation" ON property_questionnaires;
DROP POLICY IF EXISTS "Anyone can create questionnaires" ON property_questionnaires;

-- Create a single, clear policy for insertions
CREATE POLICY "Enable insert for anonymous and authenticated users"
ON property_questionnaires
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Allow if no customer_id (anonymous submission)
  customer_id IS NULL
  OR
  -- Allow if customer_id matches the authenticated user
  (auth.uid() IS NOT NULL AND customer_id = auth.uid())
);