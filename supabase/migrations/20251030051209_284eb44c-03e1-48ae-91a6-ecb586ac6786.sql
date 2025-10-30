-- Add property_questionnaire_id to quotation_proposals to link proposals to questionnaires
ALTER TABLE quotation_proposals 
ADD COLUMN property_questionnaire_id uuid REFERENCES property_questionnaires(id);

-- Make quotation_request_id nullable since we now support both workflows
ALTER TABLE quotation_proposals 
ALTER COLUMN quotation_request_id DROP NOT NULL;

-- Add constraint to ensure at least one reference exists
ALTER TABLE quotation_proposals
ADD CONSTRAINT check_has_reference CHECK (
  (quotation_request_id IS NOT NULL) OR (property_questionnaire_id IS NOT NULL)
);

-- Update RLS policy for customers to view proposals for their questionnaires
CREATE POLICY "Customers can view proposals for their questionnaires"
ON quotation_proposals
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM property_questionnaires
    WHERE property_questionnaires.id = quotation_proposals.property_questionnaire_id
    AND property_questionnaires.customer_id = auth.uid()
  )
);

-- Create table for proposal attachments
CREATE TABLE quotation_proposal_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid NOT NULL REFERENCES quotation_proposals(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on proposal attachments
ALTER TABLE quotation_proposal_attachments ENABLE ROW LEVEL SECURITY;

-- RLS policies for proposal attachments
CREATE POLICY "Vendors can manage their proposal attachments"
ON quotation_proposal_attachments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM quotation_proposals
    WHERE quotation_proposals.id = quotation_proposal_attachments.proposal_id
    AND quotation_proposals.vendor_id = auth.uid()
  )
);

CREATE POLICY "Customers can view attachments for proposals they received"
ON quotation_proposal_attachments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM quotation_proposals
    JOIN property_questionnaires ON property_questionnaires.id = quotation_proposals.property_questionnaire_id
    WHERE quotation_proposals.id = quotation_proposal_attachments.proposal_id
    AND property_questionnaires.customer_id = auth.uid()
  )
);

-- Create storage bucket for proposal documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('proposal_documents', 'proposal_documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for proposal documents
CREATE POLICY "Vendors can upload proposal documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'proposal_documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Vendors can view their proposal documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'proposal_documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Vendors can delete their proposal documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'proposal_documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Customers can view proposal documents sent to them"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'proposal_documents'
  AND EXISTS (
    SELECT 1 FROM quotation_proposals
    JOIN property_questionnaires ON property_questionnaires.id = quotation_proposals.property_questionnaire_id
    WHERE quotation_proposals.vendor_id::text = (storage.foldername(name))[1]
    AND property_questionnaires.customer_id = auth.uid()
  )
);