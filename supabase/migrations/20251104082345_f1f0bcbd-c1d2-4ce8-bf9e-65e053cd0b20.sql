-- Recreate the RLS policy that was dropped with CASCADE
DROP POLICY IF EXISTS "Customers can view vendors who submitted proposals" ON public.vendor_profiles;

CREATE POLICY "Customers can view vendors who submitted proposals"
ON public.vendor_profiles
FOR SELECT
USING (
  (auth.uid() = id) 
  OR 
  customer_can_view_vendor(id, auth.uid())
);