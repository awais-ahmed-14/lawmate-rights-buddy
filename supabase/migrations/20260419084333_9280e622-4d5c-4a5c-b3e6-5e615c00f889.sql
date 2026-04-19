-- Add assigned lawyer column for direct routing
ALTER TABLE public.case_records
ADD COLUMN IF NOT EXISTS assigned_lawyer_id uuid REFERENCES public.lawyers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_case_records_assigned_lawyer ON public.case_records(assigned_lawyer_id);
CREATE INDEX IF NOT EXISTS idx_case_records_user_email ON public.case_records(user_email);
CREATE INDEX IF NOT EXISTS idx_case_records_created_at ON public.case_records(created_at);