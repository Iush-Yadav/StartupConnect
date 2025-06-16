/*
  # Fix Registration with Simplified RLS Policies

  1. Changes
    - Drop all existing profile policies to start fresh
    - Create simple, permissive policies for profile creation
    - Maintain security while allowing registration

  2. Security
    - Enable RLS
    - Allow authenticated users to create their profile
    - Allow public read access
    - Allow users to manage their own profile
*/

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Enable profile creation for users" ON profiles;
DROP POLICY IF EXISTS "Enable profile creation for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create a simple policy for profile creation
CREATE POLICY "Enable profile creation"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow public read access
CREATE POLICY "Allow public read access"
ON profiles
FOR SELECT
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Allow users to delete own profile"
ON profiles
FOR DELETE
USING (auth.uid() = id);