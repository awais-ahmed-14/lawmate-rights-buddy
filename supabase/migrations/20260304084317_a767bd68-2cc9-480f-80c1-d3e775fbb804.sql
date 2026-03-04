
-- Create storage bucket for evidence locker
INSERT INTO storage.buckets (id, name, public) VALUES ('evidence', 'evidence', false);

-- Allow authenticated users to upload evidence
CREATE POLICY "Users can upload evidence"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'evidence');

-- Allow anyone to upload (since no auth in this app)
CREATE POLICY "Anyone can upload evidence"
ON storage.objects
FOR SELECT
USING (bucket_id = 'evidence');
