-- Fix questionnaire statuses and ensure vendors can see submitted questionnaires
BEGIN;

-- Fix questionnaires that are linked to users but in wrong status
-- These should be draft so users can edit them
UPDATE property_questionnaires
SET 
  status = 'draft',
  is_completed = false,
  updated_at = NOW()
WHERE 
  customer_id IS NOT NULL 
  AND status IN ('pending_verification', 'active')
  AND is_completed = false;

-- Ensure truly completed questionnaires are marked as submitted
UPDATE property_questionnaires
SET 
  status = 'submitted',
  submitted_at = COALESCE(submitted_at, updated_at),
  updated_at = NOW()
WHERE 
  is_completed = true 
  AND status = 'draft'
  AND customer_id IS NOT NULL;

-- Add index for faster vendor queries
CREATE INDEX IF NOT EXISTS idx_questionnaires_vendor_view 
ON property_questionnaires(status, is_completed) 
WHERE status IN ('submitted', 'under_review', 'proposals_received');

-- Add index for customer draft queries
CREATE INDEX IF NOT EXISTS idx_questionnaires_customer_draft 
ON property_questionnaires(customer_id, status) 
WHERE status = 'draft';

COMMIT;