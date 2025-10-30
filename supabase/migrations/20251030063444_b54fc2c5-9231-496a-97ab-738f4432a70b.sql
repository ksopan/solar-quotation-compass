-- Create enum types for status tracking
CREATE TYPE questionnaire_status AS ENUM ('draft', 'submitted', 'under_review', 'proposals_received', 'completed', 'cancelled');
CREATE TYPE proposal_status AS ENUM ('draft', 'submitted', 'accepted', 'rejected', 'withdrawn');

-- Add status and deadline columns to property_questionnaires
ALTER TABLE property_questionnaires
ADD COLUMN status questionnaire_status DEFAULT 'draft',
ADD COLUMN proposal_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN acceptance_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN version INTEGER DEFAULT 1;

-- Add status columns to quotation_proposals
ALTER TABLE quotation_proposals
ALTER COLUMN status DROP DEFAULT,
ALTER COLUMN status TYPE proposal_status USING 
  CASE status
    WHEN 'pending' THEN 'submitted'::proposal_status
    WHEN 'accepted' THEN 'accepted'::proposal_status
    WHEN 'rejected' THEN 'rejected'::proposal_status
    ELSE 'draft'::proposal_status
  END,
ALTER COLUMN status SET DEFAULT 'draft';

ALTER TABLE quotation_proposals
ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN rejected_at TIMESTAMP WITH TIME ZONE;

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