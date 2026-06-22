-- Migration: Add Fleet Registrations
-- Purpose: Allow people to register for marketing time slots or hourly pay.

CREATE TABLE IF NOT EXISTS public.fleet_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    type TEXT CHECK (type IN ('marketing_slot', 'hourly_pay')),
    details JSONB DEFAULT '{}'::jsonb, -- Store specific details for each type
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.fleet_registrations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own registrations." ON public.fleet_registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own registrations." ON public.fleet_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations." ON public.fleet_registrations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
