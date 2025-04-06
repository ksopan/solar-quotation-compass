
-- Create a storage bucket for questionnaire attachments if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'questionnaire_attachments', 'questionnaire_attachments', TRUE
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'questionnaire_attachments');

-- Set up RLS policies for the bucket
BEGIN;
  -- Enable RLS on buckets
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

  -- Create policy to allow users to insert objects into their folder
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage' 
      AND policyname = 'Users can upload questionnaire attachments'
    ) THEN
      CREATE POLICY "Users can upload questionnaire attachments"
      ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = 'questionnaire_attachments' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
    END IF;
  END
  $$;

  -- Create policy to allow users to select their own attachments
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage' 
      AND policyname = 'Users can view their own questionnaire attachments'
    ) THEN
      CREATE POLICY "Users can view their own questionnaire attachments"
      ON storage.objects
      FOR SELECT
      USING (
        bucket_id = 'questionnaire_attachments' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
    END IF;
  END
  $$;

  -- Create policy to allow users to update their own attachments
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage' 
      AND policyname = 'Users can update their own questionnaire attachments'
    ) THEN
      CREATE POLICY "Users can update their own questionnaire attachments"
      ON storage.objects
      FOR UPDATE
      USING (
        bucket_id = 'questionnaire_attachments' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
    END IF;
  END
  $$;

  -- Create policy to allow users to delete their own attachments
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'objects' 
      AND schemaname = 'storage' 
      AND policyname = 'Users can delete their own questionnaire attachments'
    ) THEN
      CREATE POLICY "Users can delete their own questionnaire attachments"
      ON storage.objects
      FOR DELETE
      USING (
        bucket_id = 'questionnaire_attachments' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );
    END IF;
  END
  $$;
COMMIT;
