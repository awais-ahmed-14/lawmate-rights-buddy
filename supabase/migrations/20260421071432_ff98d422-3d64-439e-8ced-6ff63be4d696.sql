-- 1. Clear existing data
DELETE FROM public.case_records;
DELETE FROM public.case_types;

-- 2. Add proof_files column (array of public URLs)
ALTER TABLE public.case_records
  ADD COLUMN IF NOT EXISTS proof_files text[] DEFAULT '{}'::text[];

-- 3. Seed the 14 fixed case types
INSERT INTO public.case_types (name, display_name) VALUES
  ('theft_robbery', 'Theft / Robbery'),
  ('cybercrime', 'Cybercrime (Fraud, Hacking, Identity Theft)'),
  ('harassment', 'Harassment (Online, Workplace, Sexual)'),
  ('domestic_family', 'Domestic / Family Disputes (Divorce, Custody, Violence)'),
  ('financial_disputes', 'Financial Disputes (Loans, Cheating, Insurance)'),
  ('property_land', 'Property / Land Disputes'),
  ('employment', 'Employment Issues'),
  ('consumer', 'Consumer Complaints'),
  ('accident_injury', 'Accident / Injury Claims'),
  ('criminal_threats', 'Criminal Threats (Blackmail, Extortion, Defamation)'),
  ('police_legal', 'Police / Legal Authority Issues'),
  ('medical_negligence', 'Medical Negligence'),
  ('business_disputes', 'Business Disputes'),
  ('others', 'Others');

-- 4. Create storage bucket for complaint proof uploads (public for easy display in lawyer dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-proofs', 'complaint-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage policies: anyone can upload + read proofs
DROP POLICY IF EXISTS "Anyone can upload complaint proofs" ON storage.objects;
CREATE POLICY "Anyone can upload complaint proofs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'complaint-proofs');

DROP POLICY IF EXISTS "Anyone can view complaint proofs" ON storage.objects;
CREATE POLICY "Anyone can view complaint proofs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'complaint-proofs');