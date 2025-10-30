-- Create enum types for status tracking (if not exists)
DO $$ BEGIN
  CREATE TYPE questionnaire_status AS ENUM ('draft', 'submitted', 'under_review', 'proposals_received', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE proposal_status AS ENUM ('draft', 'submitted', 'accepted', 'rejected', 'withdrawn');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add status and deadline columns to property_questionnaires (if not exists)
DO $$ BEGIN
  ALTER TABLE property_questionnaires ADD COLUMN status questionnaire_status DEFAULT 'draft';
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE property_questionnaires ADD COLUMN proposal_deadline TIMESTAMP WITH TIME ZONE;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE property_questionnaires ADD COLUMN acceptance_deadline TIMESTAMP WITH TIME ZONE;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE property_questionnaires ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE property_questionnaires ADD COLUMN version INTEGER DEFAULT 1;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- Handle quotation_proposals status column conversion
-- First, add temporary column
DO $$ 
BEGIN
  ALTER TABLE quotation_proposals ADD COLUMN status_new proposal_status;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- Copy and convert data using text comparison
UPDATE quotation_proposals
SET status_new = (
  CASE 
    WHEN status::text = 'pending' THEN 'submitted'::proposal_status
    WHEN status::text = 'accepted' THEN 'accepted'::proposal_status
    WHEN status::text = 'rejected' THEN 'rejected'::proposal_status
    ELSE 'draft'::proposal_status
  END
)
WHERE status_new IS NULL;

-- Drop old column and rename new one
DO $$ 
BEGIN
  ALTER TABLE quotation_proposals DROP COLUMN status;
  ALTER TABLE quotation_proposals RENAME COLUMN status_new TO status;
EXCEPTION
  WHEN OTHERS THEN null;
END $$;

-- Set default and not null
ALTER TABLE quotation_proposals ALTER COLUMN status SET DEFAULT 'draft';
ALTER TABLE quotation_proposals ALTER COLUMN status SET NOT NULL;

-- Add timestamp columns to quotation_proposals
DO $$ BEGIN
  ALTER TABLE quotation_proposals ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE quotation_proposals ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE quotation_proposals ADD COLUMN rejected_at TIMESTAMP WITH TIME ZONE;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- Function to automatically update questionnaire status when proposals are submitted
CREATE OR REPLACE FUNCTION update_questionnaire_status_on_proposal()
RETURNS TRIGGER AS $$
BEGIN
  -- When a proposal is submitted, update questionnaire status
  IF NEW.status = 'submitted' AND (OLD.status IS NULL OR OLD.status = 'draft') THEN
    UPDATE property_questionnaires
    SET status = CASE 
      WHEN status = 'submitted' THEN 'proposals_received'::questionnaire_status
      WHEN status = 'under_review' THEN 'proposals_received'::questionnaire_status
      ELSE status
    END
    WHERE id = NEW.property_questionnaire_id OR id = NEW.quotation_request_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for proposal status changes
DROP TRIGGER IF EXISTS on_proposal_status_change ON quotation_proposals;
CREATE TRIGGER on_proposal_status_change
  AFTER INSERT OR UPDATE OF status ON quotation_proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_questionnaire_status_on_proposal();

-- Function to prevent editing locked questionnaires
CREATE OR REPLACE FUNCTION can_edit_questionnaire(questionnaire_id UUID)
RETURNS BOOLEAN AS $$
  SELECT status IN ('draft', 'submitted') 
  FROM property_questionnaires 
  WHERE id = questionnaire_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to prevent editing submitted proposals
CREATE OR REPLACE FUNCTION can_edit_proposal(proposal_id UUID)
RETURNS BOOLEAN AS $$
  SELECT status = 'draft'
  FROM quotation_proposals 
  WHERE id = proposal_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Update RLS policies for property_questionnaires to prevent editing when locked
DROP POLICY IF EXISTS "Users can update their own questionnaires" ON property_questionnaires;
CREATE POLICY "Users can update their own questionnaires"
ON property_questionnaires
FOR UPDATE
USING (
  auth.uid() = customer_id 
  AND status = 'draft'
)
WITH CHECK (
  auth.uid() = customer_id 
  AND status = 'draft'
);

-- Update RLS policies for quotation_proposals to prevent editing when submitted
DROP POLICY IF EXISTS "Vendors can update their own proposals" ON quotation_proposals;
CREATE POLICY "Vendors can update their own proposals"
ON quotation_proposals
FOR UPDATE
USING (
  auth.uid() = vendor_id 
  AND status = 'draft'
)
WITH CHECK (
  auth.uid() = vendor_id 
  AND status = 'draft'
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questionnaires_status ON property_questionnaires(status);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON quotation_proposals(status);
CREATE INDEX IF NOT EXISTS idx_questionnaires_customer_status ON property_questionnaires(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_proposals_vendor_status ON quotation_proposals(vendor_id, status);