-- Fix existing questionnaires that are linked but have wrong status
-- These should be draft so users can edit them
UPDATE property_questionnaires
SET 
  status = 'draft',
  is_completed = false,
  updated_at = NOW()
WHERE 
  customer_id IS NOT NULL 
  AND status IN ('pending_verification', 'active', 'submitted')
  AND is_completed = false;

-- Ensure truly completed questionnaires are marked as submitted
UPDATE property_questionnaires
SET 
  status = 'submitted',
  submitted_at = COALESCE(submitted_at, updated_at),
  updated_at = NOW()
WHERE 
  is_completed = true 
  AND status = 'draft';

-- Add helpful index for faster fetching
CREATE INDEX IF NOT EXISTS idx_questionnaires_customer_draft 
ON property_questionnaires(customer_id, status) 
WHERE status = 'draft';