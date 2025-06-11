/*
  # Fix Profile Policies

  1. Changes
    - Drop conflicting insert policies
    - Create new permissive insert policy
    - Ensure proper update/delete policies

  2. Security
    - Maintain RLS
    - Allow authenticated users to create profiles
    - Allow users to manage their own profiles
*/

-- First, drop only the insert policies to avoid conflicts
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile during registration" ON profiles;
DROP POLICY IF EXISTS "Allow users to create their profile once" ON profiles;
DROP POLICY IF EXISTS "Enable profile creation" ON profiles;

-- Create a simple, permissive policy for profile creation
CREATE POLICY "Enable profile creation for authenticated users"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to update their own profiles
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profiles
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
CREATE POLICY "Users can delete own profile"
ON profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);