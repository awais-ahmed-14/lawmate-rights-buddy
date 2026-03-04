
-- Fix security definer view by recreating with security_invoker
DROP VIEW IF EXISTS public.case_analytics;
CREATE VIEW public.case_analytics WITH (security_invoker = on) AS
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
