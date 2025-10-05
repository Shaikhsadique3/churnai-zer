-- Create storage policies for csv-uploads bucket to restrict access to user's own files

-- Policy: Users can upload their own CSV files
CREATE POLICY "Users can upload their own CSV files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'csv-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can view their own CSV files
CREATE POLICY "Users can view their own CSV files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'csv-uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own CSV files
CREATE POLICY "Users can delete their own CSV files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'csv-uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Service role can manage all CSV uploads (for background processing)
CREATE POLICY "Service role can manage CSV uploads"
ON storage.objects FOR ALL
USING (
  bucket_id = 'csv-uploads'
  AND auth.role() = 'service_role'
);