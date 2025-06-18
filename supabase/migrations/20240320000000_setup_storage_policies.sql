-- Create function to set up storage policies
CREATE OR REPLACE FUNCTION setup_storage_policies()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
SECURITY DEFINER
AS $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to update their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to delete their own files" ON storage.objects;

  -- Create policy for public read access
  CREATE POLICY "Allow public read access"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'media');

  -- Create policy for authenticated uploads
  CREATE POLICY "Allow authenticated uploads"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

  -- Create policy for users to update their own files
  CREATE POLICY "Allow users to update their own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

  -- Create policy for users to delete their own files
  CREATE POLICY "Allow users to delete their own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'media' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
END;
$$; 