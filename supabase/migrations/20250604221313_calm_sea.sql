/*
  # Fix Profile Access and RLS Policies

  1. Changes
    - Ensure RLS policy for profile creation securely links with auth.uid()
    - Allow authenticated users to read their own profile
    - Allow public read access for basic profile info
    - Ensure proper profile creation during registration

  2. Security
    - Maintain RLS
    - Allow secure profile creation during registration
    - Allow users to read their own profile
    - Allow public read access for basic info
*/

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Enable profile creation" ON profiles;
DROP POLICY IF EXISTS "Allow public read access" ON profiles;
DROP POLICY IF EXISTS "Allow user profile management" ON profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to delete own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profile creation - securely links to auth.uid()
CREATE POLICY "Enable profile creation"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow public read access for basic profile info
-- REMOVING THIS POLICY as it may conflict or not be strictly needed.
DROP POLICY IF EXISTS "Allow public read access" ON profiles;
-- CREATE POLICY "Allow public read access"
-- ON profiles
-- FOR SELECT
-- USING (true);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Allow users to delete own profile"
ON profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Create a function to create a profile for new users with all necessary fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    username,
    user_type,
    full_name,
    avatar_url,
    bio,
    location,
    industry,
    founded_year,
    team_size,
    investment_range,
    phone
    -- created_at automatically defaults to now()
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'user_type',
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''), -- Default to empty string if not provided
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''), -- Default to empty string
    COALESCE(NEW.raw_user_meta_data->>'bio', ''), -- Default to empty string
    COALESCE(NEW.raw_user_meta_data->>'location', ''), -- Default to empty string
    COALESCE(NEW.raw_user_meta_data->>'industry', ''), -- Default to empty string
    COALESCE((NEW.raw_user_meta_data->>'founded_year')::int, 0), -- Default to 0 for int
    COALESCE((NEW.raw_user_meta_data->>'team_size')::int, 0), -- Default to 0 for int
    COALESCE(NEW.raw_user_meta_data->>'investment_range', ''), -- Default to empty string
    COALESCE(NEW.raw_user_meta_data->>'phone', '') -- Default to empty string
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger that fires after a new user is inserted into auth.users
-- This ensures the trigger uses the updated function
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy for public read access for basic profile info
DROP POLICY IF EXISTS "Allow public read access" ON public.profiles;
CREATE POLICY "Allow public read access"
ON public.profiles
FOR SELECT
USING (true);

-- Policy for authenticated users to update their own profile
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
CREATE POLICY "Allow users to update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy for authenticated users to delete their own profile
DROP POLICY IF EXISTS "Allow users to delete own profile" ON public.profiles;
CREATE POLICY "Allow users to delete own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- Policy for profile creation (explicitly allowing inserts under RLS if done client-side, though the trigger handles it server-side)
DROP POLICY IF EXISTS "Enable profile creation" ON profiles;
CREATE POLICY "Enable profile creation"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);