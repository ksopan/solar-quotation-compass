
-- Create a storage bucket for quotation files if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('quotation_document_files', 'Quotation Document Files', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated uploads
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'quotation_document_files');

-- Create policy to allow users to select their own files
CREATE POLICY "Allow users to select their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'quotation_document_files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow users to update their own files
CREATE POLICY "Allow users to update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'quotation_document_files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow users to delete their own files
CREATE POLICY "Allow users to delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'quotation_document_files' AND auth.uid()::text = (storage.foldername(name))[1]);
