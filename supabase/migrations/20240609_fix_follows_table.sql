/*
  # Fix Follows Table Schema and Relationships

  1. Changes
    - Drop and recreate follows table with correct column names
    - Fix foreign key relationships to reference profiles table
    - Add proper indexes for performance
    - Update RLS policies

  2. Security
    - Enable RLS on follows table
    - Add policies for authenticated users
    - Ensure proper access control
*/

-- Drop existing follows table if it exists
DROP TABLE IF EXISTS follows CASCADE;

-- Create follows table with correct schema
CREATE TABLE follows (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (follower_id, following_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS follows_follower_id_idx ON follows (follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON follows (following_id);
CREATE INDEX IF NOT EXISTS follows_created_at_idx ON follows (created_at DESC);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- RLS: Allow users to see their own follows
CREATE POLICY "Users can see their own follows"
  ON follows FOR SELECT
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- RLS: Allow users to follow others
CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- RLS: Allow users to unfollow
CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id); 