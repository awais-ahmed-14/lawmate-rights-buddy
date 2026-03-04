
-- Case types table for tracking different legal case categories
CREATE TABLE public.case_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Individual case records
CREATE TABLE public.case_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_type_id UUID NOT NULL REFERENCES public.case_types(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'solved', 'in_progress')),
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.case_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_records ENABLE ROW LEVEL SECURITY;

-- Public read access for analytics display
CREATE POLICY "Anyone can view case types" ON public.case_types FOR SELECT USING (true);
CREATE POLICY "Anyone can view case records" ON public.case_records FOR SELECT USING (true);

-- Allow edge functions (service role) to insert/update
CREATE POLICY "Service role can insert case types" ON public.case_types FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can insert case records" ON public.case_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update case records" ON public.case_records FOR UPDATE USING (true);

-- Seed with initial case types
INSERT INTO public.case_types (name, display_name) VALUES
  ('police_harassment', 'Police Harassment'),
  ('domestic_violence', 'Domestic Violence'),
  ('workplace_discrimination', 'Workplace Discrimination'),
  ('landlord_eviction', 'Landlord/Eviction'),
  ('women_safety', 'Women Safety'),
  ('child_labor', 'Child Labor');

-- Create analytics view for easy querying
CREATE OR REPLACE VIEW public.case_analytics AS
SELECT 
  ct.id as case_type_id,
  ct.name,
  ct.display_name,
  COUNT(cr.id) as total_cases,
  COUNT(cr.id) FILTER (WHERE cr.status = 'solved') as solved_cases,
  CASE 
    WHEN COUNT(cr.id) > 0 
    THEN ROUND((COUNT(cr.id) FILTER (WHERE cr.status = 'solved')::numeric / COUNT(cr.id)::numeric) * 100)
    ELSE 0 
  END as success_rate
FROM public.case_types ct
LEFT JOIN public.case_records cr ON ct.id = cr.case_type_id
GROUP BY ct.id, ct.name, ct.display_name;
