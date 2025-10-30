-- Fix search_path for security functions
CREATE OR REPLACE FUNCTION update_questionnaire_status_on_proposal()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION can_edit_questionnaire(questionnaire_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status IN ('draft', 'submitted') 
  FROM property_questionnaires 
  WHERE id = questionnaire_id;
$$;

CREATE OR REPLACE FUNCTION can_edit_proposal(proposal_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status = 'draft'
  FROM quotation_proposals 
  WHERE id = proposal_id;
$$;