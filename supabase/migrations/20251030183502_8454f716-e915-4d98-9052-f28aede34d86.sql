-- Add new statuses to the questionnaire_status enum
ALTER TYPE questionnaire_status ADD VALUE IF NOT EXISTS 'pending_verification';
ALTER TYPE questionnaire_status ADD VALUE IF NOT EXISTS 'active';