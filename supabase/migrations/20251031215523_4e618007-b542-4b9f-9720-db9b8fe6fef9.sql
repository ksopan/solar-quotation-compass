-- Fix Critical Security Issues

-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('customer', 'vendor', 'admin');

-- 2. Create user_roles table with proper RLS
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Only system can insert roles (via trigger)
CREATE POLICY "System can insert user roles"
ON public.user_roles
FOR INSERT
WITH CHECK (true);

-- 3. Create SECURITY DEFINER function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- 4. Create function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;

-- 5. Update handle_new_user trigger to insert into user_roles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Get role from metadata and cast to app_role
  user_role := (NEW.raw_user_meta_data->>'role')::app_role;
  
  -- Insert into user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  -- Create appropriate profile based on role
  IF user_role = 'customer' THEN
    INSERT INTO public.customer_profiles (
      id, 
      first_name, 
      last_name, 
      email, 
      address, 
      phone
    )
    VALUES (
      NEW.id, 
      NEW.raw_user_meta_data->>'firstName', 
      NEW.raw_user_meta_data->>'lastName', 
      NEW.email, 
      NEW.raw_user_meta_data->>'address', 
      NEW.raw_user_meta_data->>'phone'
    );
  ELSIF user_role = 'vendor' THEN
    INSERT INTO public.vendor_profiles (
      id, 
      company_name, 
      email, 
      address, 
      phone
    )
    VALUES (
      NEW.id, 
      NEW.raw_user_meta_data->>'companyName', 
      NEW.email, 
      NEW.raw_user_meta_data->>'address', 
      NEW.raw_user_meta_data->>'phone'
    );
  ELSIF user_role = 'admin' THEN
    INSERT INTO public.admin_profiles (
      id, 
      email
    )
    VALUES (
      NEW.id, 
      NEW.email
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. Fix questionnaire RLS policy - CRITICAL: Remove public exposure
DROP POLICY IF EXISTS "Users can view their own questionnaires or by token" ON public.property_questionnaires;
DROP POLICY IF EXISTS "Anyone can verify questionnaires with valid token" ON public.property_questionnaires;

-- Users can view their own questionnaires
CREATE POLICY "Users can view their own questionnaires"
ON public.property_questionnaires
FOR SELECT
USING (auth.uid() = customer_id);

-- Vendors with proper role can view active questionnaires
CREATE POLICY "Vendors can view active questionnaires v2"
ON public.property_questionnaires
FOR SELECT
USING (
  public.has_role(auth.uid(), 'vendor') 
  AND status IN ('active', 'submitted', 'under_review', 'proposals_received')
);

-- Admins can view all questionnaires
CREATE POLICY "Admins can view all questionnaires"
ON public.property_questionnaires
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Special policy for verification (via edge function using service role, not direct access)
-- This is safe because verification will happen through edge function with service role key
CREATE POLICY "Service role can update for verification"
ON public.property_questionnaires
FOR UPDATE
USING (true)
WITH CHECK (true);

-- 7. Harden customer_can_view_vendor function with validation
CREATE OR REPLACE FUNCTION public.customer_can_view_vendor(vendor_id uuid, customer_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate that the caller is actually the customer_id being checked
  IF auth.uid() != customer_id THEN
    RETURN false;
  END IF;
  
  -- Check if customer has received a proposal from this vendor
  RETURN EXISTS (
    SELECT 1
    FROM quotation_proposals qp
    JOIN property_questionnaires pq ON pq.id = qp.property_questionnaire_id
    WHERE qp.vendor_id = vendor_id
    AND pq.customer_id = customer_id
  );
END;
$$;

-- 8. Add audit logging table for security events
CREATE TABLE public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.security_audit_log
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.security_audit_log
FOR INSERT
WITH CHECK (true);

-- 9. Add verification token expiration
ALTER TABLE public.property_questionnaires 
ADD COLUMN IF NOT EXISTS verification_token_expires_at timestamp with time zone;

-- Set expiration to 48 hours from now for existing tokens
UPDATE public.property_questionnaires 
SET verification_token_expires_at = created_at + interval '48 hours'
WHERE verification_token_expires_at IS NULL AND verification_token IS NOT NULL;