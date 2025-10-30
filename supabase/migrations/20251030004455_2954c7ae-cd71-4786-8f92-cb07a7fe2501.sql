-- Create profile tables for different user types
CREATE TABLE public.customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.vendor_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create quotation requests table
CREATE TABLE public.quotation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  roof_area NUMERIC NOT NULL,
  roof_type TEXT NOT NULL,
  energy_usage NUMERIC,
  budget NUMERIC,
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create quotation proposals table
CREATE TABLE public.quotation_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_request_id UUID NOT NULL REFERENCES public.quotation_requests(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_price NUMERIC NOT NULL,
  proposal_details TEXT NOT NULL,
  installation_timeframe TEXT NOT NULL,
  warranty_period TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create quotation document files table
CREATE TABLE public.quotation_document_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES public.quotation_requests(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create trigger function to auto-create profiles on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'customer' THEN
    INSERT INTO public.customer_profiles (
      id, 
      first_name, 
      last_name, 
      email, 
      address, 
      phone
    )
    VALUES (
      NEW.id, 
      NEW.raw_user_meta_data->>'firstName', 
      NEW.raw_user_meta_data->>'lastName', 
      NEW.email, 
      NEW.raw_user_meta_data->>'address', 
      NEW.raw_user_meta_data->>'phone'
    );
  ELSIF NEW.raw_user_meta_data->>'role' = 'vendor' THEN
    INSERT INTO public.vendor_profiles (
      id, 
      company_name, 
      email, 
      address, 
      phone
    )
    VALUES (
      NEW.id, 
      NEW.raw_user_meta_data->>'companyName', 
      NEW.email, 
      NEW.raw_user_meta_data->>'address', 
      NEW.raw_user_meta_data->>'phone'
    );
  ELSIF NEW.raw_user_meta_data->>'role' = 'admin' THEN
    INSERT INTO public.admin_profiles (
      id, 
      email
    )
    VALUES (
      NEW.id, 
      NEW.email
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to call handle_new_user on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_document_files ENABLE ROW LEVEL SECURITY;

-- Customer profiles policies
CREATE POLICY "Users can view their own customer profile"
  ON public.customer_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own customer profile"
  ON public.customer_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Vendor profiles policies
CREATE POLICY "Users can view their own vendor profile"
  ON public.vendor_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own vendor profile"
  ON public.vendor_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Admin profiles policies
CREATE POLICY "Users can view their own admin profile"
  ON public.admin_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own admin profile"
  ON public.admin_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Quotation requests policies
CREATE POLICY "Customers can view their own quotation requests"
  ON public.quotation_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Customers can create quotation requests"
  ON public.quotation_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update their own quotation requests"
  ON public.quotation_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Customers can delete their own quotation requests"
  ON public.quotation_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Vendors can view all quotation requests"
  ON public.quotation_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.vendor_profiles
      WHERE id = auth.uid()
    )
  );

-- Quotation proposals policies
CREATE POLICY "Vendors can view their own proposals"
  ON public.quotation_proposals FOR SELECT
  TO authenticated
  USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can create proposals"
  ON public.quotation_proposals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their own proposals"
  ON public.quotation_proposals FOR UPDATE
  TO authenticated
  USING (auth.uid() = vendor_id);

CREATE POLICY "Customers can view proposals for their requests"
  ON public.quotation_proposals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quotation_requests
      WHERE id = quotation_request_id
      AND customer_id = auth.uid()
    )
  );

-- Quotation document files policies
CREATE POLICY "Users can view their own files"
  ON public.quotation_document_files FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quotation_requests
      WHERE id = quotation_id
      AND customer_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload their own files"
  ON public.quotation_document_files FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quotation_requests
      WHERE id = quotation_id
      AND customer_id = auth.uid()
    )
  );

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('quotation_documents', 'Quotation Documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  ('questionnaire_attachments', 'Questionnaire Attachments', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  ('quotation_document_files', 'Quotation Document Files', true, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for quotation_documents
CREATE POLICY "Allow authenticated users to upload files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'quotation_documents');

CREATE POLICY "Allow users to access their own files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'quotation_documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Allow users to delete their own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'quotation_documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for questionnaire_attachments
CREATE POLICY "Allow users to upload questionnaire files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'questionnaire_attachments');

CREATE POLICY "Allow users to view questionnaire files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'questionnaire_attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for quotation_document_files (public bucket)
CREATE POLICY "Allow authenticated uploads to quotation_document_files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'quotation_document_files');

CREATE POLICY "Allow public read for quotation_document_files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'quotation_document_files');