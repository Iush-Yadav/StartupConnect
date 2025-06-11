-- Add email column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- Add unique constraint on email
ALTER TABLE profiles
ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Update existing profiles with email from auth.users
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
AND p.email IS NULL;

-- Make email column NOT NULL after populating existing records
ALTER TABLE profiles
ALTER COLUMN email SET NOT NULL; 