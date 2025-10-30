-- Drop the existing restrictive update policy
DROP POLICY IF EXISTS "Vendors can update their own proposals" ON quotation_proposals;

-- Create a new policy that allows vendors to update their own proposals
-- This allows changing status from draft to submitted
CREATE POLICY "Vendors can update their own proposals"
ON quotation_proposals
FOR UPDATE
USING (auth.uid() = vendor_id)
WITH CHECK (auth.uid() = vendor_id);