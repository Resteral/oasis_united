-- TEAM & ACCOUNT PROTOCOL UPDATES

-- 1. Add Account Number to Profiles (Secure Citizen ID)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_number TEXT UNIQUE DEFAULT 'OU-' || substring(md5(random()::text) from 1 for 6);

-- 2. Add Team Management to Businesses
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT '[]'::jsonb;

-- 3. Update handle_new_user to ensure account numbers are unique and assigned
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, account_number)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'full_name',
    'OU-' || substring(md5(random()::text) from 1 for 6)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create a view for easy team lookup (Optional but helpful)
CREATE OR REPLACE VIEW public.citizen_directory AS
SELECT id, full_name, account_number, role, avatar_url
FROM public.profiles;

-- 5. Policy to allow businesses to see citizen directory for recruitment
CREATE POLICY "Businesses can look up citizens by account number" 
ON public.profiles FOR SELECT USING (true);
