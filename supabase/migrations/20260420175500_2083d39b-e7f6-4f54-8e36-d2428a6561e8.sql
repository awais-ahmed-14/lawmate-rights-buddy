ALTER TABLE public.case_records
  ADD COLUMN IF NOT EXISTS created_day date GENERATED ALWAYS AS ((created_at AT TIME ZONE 'UTC')::date) STORED;

CREATE UNIQUE INDEX IF NOT EXISTS case_records_user_type_day_uniq
ON public.case_records (user_email, case_type_id, created_day)
WHERE user_email IS NOT NULL;