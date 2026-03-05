
-- Add user_message and user_email columns to case_records for in-app messaging
ALTER TABLE public.case_records 
  ADD COLUMN IF NOT EXISTS user_message text,
  ADD COLUMN IF NOT EXISTS user_email text,
  ADD COLUMN IF NOT EXISTS admin_reply text;

-- Allow service role to update admin_reply
-- RLS already allows updates with "true" using expression
