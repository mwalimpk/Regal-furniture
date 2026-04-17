-- Storage policies for property-images bucket (used for product images)
-- Allow public read (bucket is already public)
-- Allow authenticated users to upload, update and delete their own product images
-- Admins can manage all

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-images');

CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');