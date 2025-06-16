/*
  # Add Startup Details to Posts Table

  1. Changes
    - Add startup_details JSONB column to posts table
    - Update existing RLS policies
    - Add index for better query performance

  2. Security
    - Maintain existing RLS policies
    - No changes to access control
*/

-- Add startup_details column to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS startup_details JSONB DEFAULT '{}'::jsonb;

-- Create index for startup_details
CREATE INDEX IF NOT EXISTS posts_startup_details_idx ON posts USING gin(startup_details);