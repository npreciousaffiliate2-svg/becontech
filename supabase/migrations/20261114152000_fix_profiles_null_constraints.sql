-- Fix profiles table constraint to allow partial updates (e.g. avatar upload)
ALTER TABLE profiles ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN full_name SET DEFAULT '';
