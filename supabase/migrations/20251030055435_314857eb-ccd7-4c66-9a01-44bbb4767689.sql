-- Allow customers to view vendor profiles for vendors who have submitted proposals to them
CREATE POLICY "Customers can view vendors who submitted proposals"
ON vendor_profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM quotation_proposals qp
    JOIN property_questionnaires pq ON pq.id = qp.property_questionnaire_id
    WHERE qp.vendor_id = vendor_profiles.id
    AND pq.customer_id = auth.uid()
  )
);