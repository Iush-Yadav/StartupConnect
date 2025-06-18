-- Add comment to follows table to help PostgREST infer relationship
ALTER TABLE follows
  ADD CONSTRAINT follows_following_id_fkey
  FOREIGN KEY (following_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

COMMENT ON CONSTRAINT follows_following_id_fkey ON follows IS E'@relation(name: 'followed_by_me')';

-- Drop and re-create follows table to apply the comment and ensure consistency
-- ONLY RUN THIS IF THE TABLE IS NEW OR YOU ARE OKAY WITH DATA LOSS
-- If you have existing data, consider ALTER TABLE ADD COLUMN and THEN ADD COMMENT

-- For simplicity and assuming initial setup, we'll drop and re-create.
-- If you have data in 'follows', you'd need to migrate it first.

-- DROP TABLE IF EXISTS follows CASCADE;

-- CREATE TABLE follows (
--   id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
--   follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
--   following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
--   created_at timestamp with time zone DEFAULT now() NOT NULL,
--   UNIQUE (follower_id, following_id)
-- );

-- ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow authenticated users to read follows" ON follows
--   FOR SELECT
--   TO authenticated
--   USING (true);

-- CREATE POLICY "Allow authenticated users to insert follows" ON follows
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (auth.uid() = follower_id);

-- CREATE POLICY "Allow authenticated users to delete their own follows" ON follows
--   FOR DELETE
--   TO authenticated
--   USING (auth.uid() = follower_id); 