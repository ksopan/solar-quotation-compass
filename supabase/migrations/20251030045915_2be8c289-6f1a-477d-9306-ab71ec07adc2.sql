-- Ensure the quotation_document_files bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('quotation_document_files', 'quotation_document_files', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Create policy for viewing files (SELECT)
CREATE POLICY "Users can view their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'quotation_document_files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy for uploading files (INSERT)
CREATE POLICY "Users can upload their own files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'quotation_document_files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy for updating files (UPDATE)
CREATE POLICY "Users can update their own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'quotation_document_files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy for deleting files (DELETE) - THIS WAS MISSING!
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'quotation_document_files' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);