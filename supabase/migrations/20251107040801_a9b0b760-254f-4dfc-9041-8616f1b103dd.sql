-- Add new fields to property_questionnaires table for enhanced questionnaire
ALTER TABLE property_questionnaires
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric,
ADD COLUMN IF NOT EXISTS roof_material text,
ADD COLUMN IF NOT EXISTS heating_type text,
ADD COLUMN IF NOT EXISTS electrification_interest text,
ADD COLUMN IF NOT EXISTS phone text;

-- Add index for geolocation queries
CREATE INDEX IF NOT EXISTS idx_questionnaires_location ON property_questionnaires(latitude, longitude);

-- Update verification token expiry to 24 hours (already exists but ensure it's set correctly)
-- The verification_token_expires_at field already exists, just ensure triggers set it to 24 hours