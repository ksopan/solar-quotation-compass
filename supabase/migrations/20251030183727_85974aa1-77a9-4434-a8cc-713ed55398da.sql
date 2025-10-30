-- Add verification token column to property_questionnaires
ALTER TABLE property_questionnaires 
ADD COLUMN IF NOT EXISTS verification_token uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone;

-- Update RLS policies to allow unauthenticated users to create questionnaires
DROP POLICY IF EXISTS "Users can create their own questionnaires" ON property_questionnaires;

-- Allow anyone to insert a questionnaire (customer_id can be null initially)
CREATE POLICY "Anyone can create questionnaires"
ON property_questionnaires
FOR INSERT
WITH CHECK (true);

-- Allow unauthenticated users to update their questionnaire during verification
CREATE POLICY "Anyone can verify questionnaires with valid token"
ON property_questionnaires
FOR UPDATE
USING (verification_token IS NOT NULL)
WITH CHECK (verification_token IS NOT NULL);

-- Update the existing select policy to also allow viewing by verification token
DROP POLICY IF EXISTS "Users can view their own questionnaires" ON property_questionnaires;

CREATE POLICY "Users can view their own questionnaires or by token"
ON property_questionnaires
FOR SELECT
USING (
  auth.uid() = customer_id OR 
  verification_token IS NOT NULL
);

-- Vendors should only see active or submitted questionnaires
DROP POLICY IF EXISTS "Vendors can view all questionnaires" ON property_questionnaires;

CREATE POLICY "Vendors can view active questionnaires"
ON property_questionnaires
FOR SELECT
USING (
  EXISTS (SELECT 1 FROM vendor_profiles WHERE vendor_profiles.id = auth.uid())
  AND status IN ('active', 'submitted', 'under_review', 'proposals_received')
);