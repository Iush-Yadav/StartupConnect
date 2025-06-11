/*
  # Add profiles insert policy

  1. Security Changes
    - Add RLS policy to allow users to create their own profile during registration
    - This policy specifically allows INSERT operations when the profile ID matches the authenticated user's ID
    - This is critical for the registration flow to work properly

  Note: The existing policies for SELECT and UPDATE remain unchanged
*/

CREATE POLICY "Users can create their own profile during registration"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);