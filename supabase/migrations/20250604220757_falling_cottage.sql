/*
  # Fix profiles table RLS policies

  1. Changes
    - Update RLS policies for the profiles table to allow profile creation during registration
    - Add policy to allow users to create their own profile with matching auth.uid()

  2. Security
    - Maintains RLS enabled on profiles table
    - Ensures users can only create their own profile
    - Preserves existing policies for SELECT, UPDATE, and DELETE
*/

-- Drop the existing INSERT policy if it exists
DROP POLICY IF EXISTS "Enable profile creation for authenticated users" ON profiles;

-- Create new INSERT policy that allows profile creation during registration
CREATE POLICY "Enable profile creation for users" ON profiles
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);