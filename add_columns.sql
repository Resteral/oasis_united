ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS theme jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS delivery_settings jsonb DEFAULT '{}'::jsonb;
