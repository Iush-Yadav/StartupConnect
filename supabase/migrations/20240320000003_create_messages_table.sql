-- Create messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create RLS policies for messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow users to retrieve messages they are part of
CREATE POLICY "Allow authenticated users to view their messages" ON messages
  FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Allow authenticated users to send messages
CREATE POLICY "Allow authenticated users to send messages" ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Allow authenticated users to delete their own sent messages
CREATE POLICY "Allow authenticated users to delete their own sent messages" ON messages
  FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid()); 