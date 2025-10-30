-- Drop the problematic policy
DROP POLICY IF EXISTS "Customers can view vendors who submitted proposals" ON vendor_profiles;

-- Create a security definer function to check if customer can view vendor
CREATE OR REPLACE FUNCTION public.customer_can_view_vendor(vendor_id uuid, customer_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM quotation_proposals qp
    JOIN property_questionnaires pq ON pq.id = qp.property_questionnaire_id
    WHERE qp.vendor_id = vendor_id
    AND pq.customer_id = customer_id
  );
$$;

-- Create new policy using the security definer function
CREATE POLICY "Customers can view vendors who submitted proposals"
ON vendor_profiles
FOR SELECT
USING (
  auth.uid() = id OR
  public.customer_can_view_vendor(id, auth.uid())
);