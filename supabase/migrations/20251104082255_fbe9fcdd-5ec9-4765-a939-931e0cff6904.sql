-- Fix ambiguous column reference in customer_can_view_vendor function
DROP FUNCTION IF EXISTS public.customer_can_view_vendor(uuid, uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.customer_can_view_vendor(p_vendor_id uuid, p_customer_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate that the caller is actually the customer_id being checked
  IF auth.uid() != p_customer_id THEN
    RETURN false;
  END IF;
  
  -- Check if customer has received a proposal from this vendor
  RETURN EXISTS (
    SELECT 1
    FROM quotation_proposals qp
    JOIN property_questionnaires pq ON pq.id = qp.property_questionnaire_id
    WHERE qp.vendor_id = p_vendor_id
    AND pq.customer_id = p_customer_id
  );
END;
$function$;