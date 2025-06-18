/*
  # Add foreign key constraint between posts and profiles tables

  1. Changes
    - Add foreign key constraint linking posts.user_id to profiles.id
    - This enables proper joins between posts and profiles tables

  2. Security
    - No changes to RLS policies
    - Existing table permissions remain unchanged

  Note: This migration ensures referential integrity between posts and their authors
*/

DO $$ BEGIN
  -- Add foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'posts_user_id_fkey'
  ) THEN
    ALTER TABLE posts 
    ADD CONSTRAINT posts_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES profiles (id);
  END IF;
END $$;