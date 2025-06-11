/*
  # Fix Profiles RLS Policies

  1. Changes
    - Drop existing insert policy that's not working correctly
    - Create new insert policy with proper auth check
    - Ensure policy allows new users to create their profile during registration
  
  2. Security
    - Maintains RLS enabled on profiles table
    - Ensures users can only create their own profile
    - Preserves existing select/update policies
*/

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create new insert policy with proper auth check
CREATE POLICY "Enable insert for authenticated users only" 
ON profiles FOR INSERT 
TO public
WITH CHECK (auth.uid() = id);