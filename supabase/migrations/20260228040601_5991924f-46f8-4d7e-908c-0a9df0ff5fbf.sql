-- Bucket for marketing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketing', 'marketing', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload marketing images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'marketing' AND auth.role() = 'authenticated');

-- Public read access
CREATE POLICY "Marketing images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'marketing');

-- Users can delete their uploads
CREATE POLICY "Users can delete marketing images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'marketing' AND auth.role() = 'authenticated');
