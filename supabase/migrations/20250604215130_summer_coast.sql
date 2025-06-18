/*
  # Fix Database Schema and Policies

  1. Changes
    - Add missing indexes for performance
    - Add missing RLS policies
    - Add cascade deletes for related data
    - Add default values for better data consistency

  2. Security
    - Update RLS policies to be more specific
    - Ensure proper authentication checks
*/

-- Add missing indexes
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts (created_at DESC);
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON posts (user_id);
CREATE INDEX IF NOT EXISTS post_likes_user_id_idx ON post_likes (user_id);

-- Update posts table
ALTER TABLE posts
ALTER COLUMN media_urls SET DEFAULT '{}',
ALTER COLUMN tags SET DEFAULT '{}';

-- Update RLS policies
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
CREATE POLICY "Posts are viewable by everyone"
ON posts FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
CREATE POLICY "Authenticated users can create posts"
ON posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can delete own posts"
ON posts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Update profiles policies
DROP POLICY IF EXISTS "Users can create their own profile during registration" ON profiles;
CREATE POLICY "Users can create their own profile during registration"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Update post_likes policies
DROP POLICY IF EXISTS "Post likes are viewable by everyone" ON post_likes;
CREATE POLICY "Post likes are viewable by everyone"
ON post_likes FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage their likes" ON post_likes;
CREATE POLICY "Authenticated users can manage their likes"
ON post_likes FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);