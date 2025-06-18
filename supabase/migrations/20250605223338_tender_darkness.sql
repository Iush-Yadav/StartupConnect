-- Remove automatic email confirmation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Remove default value for email_confirmed_at
ALTER TABLE auth.users
ALTER COLUMN email_confirmed_at
DROP DEFAULT;

-- Update existing unconfirmed users to require confirmation
UPDATE auth.users
SET email_confirmed_at = NULL
WHERE email_confirmed_at IS NOT NULL; 