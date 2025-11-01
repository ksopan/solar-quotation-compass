-- Allow anon users to read questionnaires they just created (pending_verification status)
-- Since anon users don't have auth.uid(), we allow reading pending_verification questionnaires
CREATE POLICY "anon_can_view_pending_questionnaires"
ON property_questionnaires
FOR SELECT
TO anon
USING (status = 'pending_verification' AND customer_id IS NULL);