-- 1. APPOINTMENTS TABLE
create table public.appointments (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) not null,
  customer_id uuid references public.profiles(id), -- Nullable for guest bookings
  service_name text not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  customer_name text, -- For guest bookings or quick reference
  customer_email text,
  customer_phone text,
  customer_notes text, -- Any special requests
  status text check (status in ('pending', 'confirmed', 'cancelled', 'completed')) default 'pending',
  custom_fields jsonb default '{}'::jsonb, -- Store answers to custom questions (e.g. { "shoe_size": "10" })
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS for Appointments
alter table public.appointments enable row level security;

-- Business Owners receive full access to their appointments
create policy "Owners can view their business appointments." on public.appointments for select using (
  exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);
create policy "Owners can insert appointments." on public.appointments for insert with check (
  exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);
create policy "Owners can update their business appointments." on public.appointments for update using (
  exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);
create policy "Owners can delete their business appointments." on public.appointments for delete using (
  exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);

-- Customers can view their own appointments
create policy "Customers can view their own appointments." on public.appointments for select using (
  auth.uid() = customer_id
);

-- 2. CRM SETTINGS (Modify Businesses Table)
-- We are adding a 'crm_settings' column. 
-- If this was a production DB we'd alter table, but for this project structure we can just add the column via migration.
alter table public.businesses add column if not exists crm_settings jsonb default '{}'::jsonb;
-- Example structure:
-- {
--   "enabled": true,
--   "appointment_slots": { "duration_minutes": 30, "buffer_minutes": 10 },
--   "custom_fields": [
--     { "key": "allergies", "label": "Do you have any allergies?", "type": "text" }
--   ]
-- }
