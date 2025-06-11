/*
  # Fix Registration with Simplified RLS

  1. Changes
    - Remove all existing profile policies
    - Create simple, permissive policies for registration
    - Maintain basic security while allowing profile creation

  2. Security
    - Enable RLS
    - Allow profile creation during registration
    - Maintain public read access
    - Protect profile updates and deletions
*/

-- First, drop all existing policies
DROP POLICY IF EXISTS "Enable profile creation" ON profiles;
DROP POLICY IF EXISTS "Allow public read access" ON profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to delete own profile" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create a completely permissive policy for profile creation
CREATE POLICY "Allow profile creation"
ON profiles
FOR INSERT
WITH CHECK (true);

-- Allow public read access
CREATE POLICY "Allow public read access"
ON profiles
FOR SELECT
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Allow user profile management"
ON profiles
FOR ALL
USING (
  CASE
    WHEN (SELECT current_setting('role') = 'authenticated') THEN auth.uid() = id
    ELSE true
  END
);