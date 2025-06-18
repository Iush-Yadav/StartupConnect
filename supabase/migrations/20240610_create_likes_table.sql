-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (post_id, user_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS likes_post_id_idx ON likes (post_id);
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON likes (user_id);
CREATE INDEX IF NOT EXISTS likes_created_at_idx ON likes (created_at DESC);

-- Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- RLS: Allow users to see likes on posts
CREATE POLICY "Users can see likes on posts"
  ON likes FOR SELECT
  USING (true);

-- RLS: Allow users to like posts
CREATE POLICY "Users can like posts"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS: Allow users to unlike their own likes
CREATE POLICY "Users can unlike their own likes"
  ON likes FOR DELETE
  USING (auth.uid() = user_id); 