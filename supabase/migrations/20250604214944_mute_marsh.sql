/*
  # Fix profiles table RLS policies

  1. Changes
    - Add INSERT policy for profiles table to allow new user registration
    - Policy ensures users can only create their own profile during registration
    - Policy checks that the profile ID matches the authenticated user's ID

  2. Security
    - Maintains existing RLS policies
    - Adds specific INSERT policy for registration flow
    - Ensures data integrity by validating user ID match
*/

-- Enable RLS if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Add INSERT policy for new user registration
CREATE POLICY "Users can create their own profile during registration"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);