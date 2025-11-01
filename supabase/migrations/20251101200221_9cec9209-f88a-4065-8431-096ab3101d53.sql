-- Drop ALL existing INSERT policies on property_questionnaires
DROP POLICY IF EXISTS "Allow anonymous questionnaire insertion" ON property_questionnaires;
DROP POLICY IF EXISTS "Allow authenticated user questionnaire insertion" ON property_questionnaires;
DROP POLICY IF EXISTS "Enable insert for anonymous and authenticated users" ON property_questionnaires;
DROP POLICY IF EXISTS "Anyone can create questionnaires" ON property_questionnaires;
DROP POLICY IF EXISTS "Allow anonymous questionnaire creation" ON property_questionnaires;

-- Create a single comprehensive policy for both anonymous and authenticated users
CREATE POLICY "questionnaires_insert_policy"
ON property_questionnaires
FOR INSERT
TO public, anon, authenticated
WITH CHECK (
  -- Allow if customer_id is NULL (anonymous submissions before registration)
  customer_id IS NULL
  OR
  -- Allow if customer_id matches the authenticated user
  (auth.uid() IS NOT NULL AND customer_id = auth.uid())
);