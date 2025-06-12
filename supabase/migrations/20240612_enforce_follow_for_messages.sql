-- Drop the existing permissive INSERT policy
DROP POLICY IF EXISTS "Allow authenticated users to send messages" ON public.messages;

-- Create a new policy that only allows sending messages if the sender follows the receiver
CREATE POLICY "Users can send messages to followed users" ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.follows
      WHERE follower_id = sender_id AND following_id = receiver_id
    )
  ); 
