-- Migration script to add google_api_access column to existing users table
-- Run this if you have an existing database without the new column

-- Add the google_api_access column with a default value of false
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_api_access BOOLEAN DEFAULT FALSE;

-- Update existing users to have access (optional - remove this line if you want all users to start with false)
-- UPDATE users SET google_api_access = false;

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'google_api_access';
