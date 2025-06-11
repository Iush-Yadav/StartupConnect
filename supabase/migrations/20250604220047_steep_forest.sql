/*
  # Fix profiles table RLS policy

  1. Changes
    - Add RLS policy to allow new users to create their profile during registration
    - Keep existing policies intact
    - Ensure users can only create their own profile

  2. Security
    - Maintains RLS enabled on profiles table
    - Adds policy for authenticated users to create their profile
    - Policy ensures users can only create profile with their own ID
*/

-- First ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add policy for profile creation during registration
CREATE POLICY "Users can create their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);