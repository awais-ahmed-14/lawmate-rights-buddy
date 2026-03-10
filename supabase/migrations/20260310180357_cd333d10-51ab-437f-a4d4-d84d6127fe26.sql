
-- Profiles table for authenticated users
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  phone text,
  full_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'phone', NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Lawyers table
CREATE TABLE public.lawyers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  district text NOT NULL,
  verification_file_url text,
  approved boolean DEFAULT false,
  password1 text NOT NULL,
  password2 text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.lawyers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved lawyers" ON public.lawyers FOR SELECT USING (approved = true);
CREATE POLICY "Anyone can register as lawyer" ON public.lawyers FOR INSERT WITH CHECK (true);
CREATE POLICY "Super admin can update lawyers" ON public.lawyers FOR UPDATE USING (true);

-- Add user_phone to case_records
ALTER TABLE public.case_records ADD COLUMN IF NOT EXISTS user_phone text;

-- Storage bucket for lawyer verification docs
INSERT INTO storage.buckets (id, name, public) VALUES ('lawyer-docs', 'lawyer-docs', false);
CREATE POLICY "Anyone can upload lawyer docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'lawyer-docs');
CREATE POLICY "Anyone can view lawyer docs" ON storage.objects FOR SELECT USING (bucket_id = 'lawyer-docs');
