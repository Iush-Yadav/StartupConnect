/*
  # Fix Profile RLS Policies

  1. Changes
    - Add policy for profile creation during registration
    - Ensure no duplicate policies are created
    - Maintain existing security policies

  2. Security
    - Only authenticated users can create their profile
    - Users can only create one profile
    - Public read access is maintained
*/

DO $$ 
BEGIN
  -- Only create the insert policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Allow users to create their profile once'
  ) THEN
    CREATE POLICY "Allow users to create their profile once"
      ON profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.uid() = id 
        AND NOT EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid()
        )
      );
  END IF;
END $$;