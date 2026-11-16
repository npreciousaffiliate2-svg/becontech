-- Add replies JSONB column to support_tickets if not exists
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS replies JSONB DEFAULT '[]'::jsonb;
