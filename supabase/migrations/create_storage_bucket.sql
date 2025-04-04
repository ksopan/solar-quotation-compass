
-- Create a storage bucket for quotation files if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('quotation-files', 'Quotation Documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload files to this bucket
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'quotation-files');

-- Create policy to allow users to select their own files
CREATE POLICY "Allow users to select their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'quotation-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow users to update their own files
CREATE POLICY "Allow users to update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'quotation-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policy to allow users to delete their own files
CREATE POLICY "Allow users to delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'quotation-files' AND auth.uid()::text = (storage.foldername(name))[1]);
