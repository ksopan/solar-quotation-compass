-- Create property_questionnaires table
CREATE TABLE IF NOT EXISTS public.property_questionnaires (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_type TEXT NOT NULL DEFAULT 'home',
  ownership_status TEXT NOT NULL DEFAULT 'own',
  monthly_electric_bill NUMERIC NOT NULL DEFAULT 170,
  interested_in_batteries BOOLEAN NOT NULL DEFAULT false,
  battery_reason TEXT,
  purchase_timeline TEXT NOT NULL DEFAULT 'within_year',
  willing_to_remove_trees BOOLEAN NOT NULL DEFAULT false,
  roof_age_status TEXT NOT NULL DEFAULT 'no',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_questionnaires ENABLE ROW LEVEL SECURITY;

-- RLS Policies for property_questionnaires
CREATE POLICY "Users can view their own questionnaires"
  ON public.property_questionnaires
  FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can create their own questionnaires"
  ON public.property_questionnaires
  FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update their own questionnaires"
  ON public.property_questionnaires
  FOR UPDATE
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can delete their own questionnaires"
  ON public.property_questionnaires
  FOR DELETE
  USING (auth.uid() = customer_id);

-- Vendors can view all questionnaires
CREATE POLICY "Vendors can view all questionnaires"
  ON public.property_questionnaires
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendor_profiles
      WHERE vendor_profiles.id = auth.uid()
    )
  );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for automatic updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.property_questionnaires
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();