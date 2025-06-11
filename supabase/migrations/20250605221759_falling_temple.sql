/*
  # Update Posts Table RLS Policies

  1. Changes
    - Add RLS policy for post creation by authenticated users
    - Ensure policy uses auth.uid() for user verification
  
  2. Security
    - Enable RLS on posts table (if not already enabled)
    - Add policy for INSERT operations
    - Verify user authentication before allowing post creation
*/

-- Enable RLS on posts table (idempotent)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;

-- Create new INSERT policy
CREATE POLICY "Authenticated users can create posts"
ON posts
FOR INSERT
WITH CHECK (auth.uid() = user_id);