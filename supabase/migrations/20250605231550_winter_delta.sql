/*
  # Add startup_details column to posts table
  
  1. Changes
    - Add `startup_details` column to posts table of type JSONB
    - Set default value to empty JSON object
    - Make column nullable
  
  2. Security
    - No changes to RLS policies needed as existing policies cover this column
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' 
    AND column_name = 'startup_details'
  ) THEN
    ALTER TABLE posts 
    ADD COLUMN startup_details JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;