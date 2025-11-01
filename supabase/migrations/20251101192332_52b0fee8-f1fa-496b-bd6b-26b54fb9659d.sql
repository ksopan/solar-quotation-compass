-- Fix RLS policy to allow anonymous questionnaire creation
-- This is needed for the pre-registration flow where users fill out
-- the questionnaire before creating an account

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Anyone can create questionnaires" ON property_questionnaires;

-- Create a new policy that explicitly allows anonymous insertions
CREATE POLICY "Allow anonymous questionnaire creation"
ON property_questionnaires
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Allow if customer_id is NULL (anonymous/pre-registration)
  -- or if customer_id matches the authenticated user
  customer_id IS NULL OR customer_id = auth.uid()
);