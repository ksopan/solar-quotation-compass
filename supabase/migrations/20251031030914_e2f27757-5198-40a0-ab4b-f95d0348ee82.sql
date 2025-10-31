-- Add INSERT policies for profile tables (needed for the trigger function to work)
CREATE POLICY "System can insert customer profiles"
ON public.customer_profiles
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can insert vendor profiles"
ON public.vendor_profiles
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can insert admin profiles"
ON public.admin_profiles
FOR INSERT
WITH CHECK (true);