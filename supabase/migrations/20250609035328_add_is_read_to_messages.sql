-- Add is_read column to messages table
ALTER TABLE messages
ADD COLUMN is_read BOOLEAN DEFAULT FALSE;

-- Create RLS policy for updating is_read column (only receiver can mark as read)
CREATE POLICY "Allow receiver to mark messages as read" ON messages
  FOR UPDATE
  TO authenticated
  USING (receiver_id = auth.uid() AND is_read = FALSE)
  WITH CHECK (receiver_id = auth.uid() AND is_read = TRUE);

-- Update existing RLS policy for message retrieval to include is_read
-- (no change needed here as existing policy already allows select for sender/receiver)
-- CREATE POLICY "Allow authenticated users to view their messages" ON messages
--   FOR SELECT
--   TO authenticated
--   USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- No change needed for insert or delete policies related to is_read
