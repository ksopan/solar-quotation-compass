-- Drop the existing policy
DROP POLICY IF EXISTS "Enable insert for anonymous and authenticated users" ON property_questionnaires;

-- Create a simple policy for anonymous users
CREATE POLICY "Allow anonymous questionnaire insertion"
ON property_questionnaires
FOR INSERT
WITH CHECK (
  customer_id IS NULL
);

-- Create a separate policy for authenticated users  
CREATE POLICY "Allow authenticated user questionnaire insertion"
ON property_questionnaires
FOR INSERT
TO authenticated
WITH CHECK (
  customer_id = auth.uid() OR customer_id IS NULL
);