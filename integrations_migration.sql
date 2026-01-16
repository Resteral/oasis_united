-- Add support for new channels in orders and appointments
-- Safe column addition

-- 1. Update channel check constraint on ORDERS
-- Postgres doesn't easily allow altering enum constraints, so we drop and recreate the constraint
alter table public.orders drop constraint if exists orders_channel_check;
alter table public.orders add constraint orders_channel_check 
  check (channel in ('web', 'sms', 'instagram', 'facebook', 'whatsapp', 'offline'));

-- 2. Update status check constraint on APPOINTMENTS if needed (optional context)
-- Existing: 'pending', 'confirmed', 'cancelled', 'completed' - seems fine for now.

-- 3. Add 'source' or 'integration_id' to APPOINTMENTS to track where it came from
alter table public.appointments add column if not exists channel text default 'web';
alter table public.appointments drop constraint if exists appointments_channel_check;
alter table public.appointments add constraint appointments_channel_check
  check (channel in ('web', 'sms', 'instagram', 'facebook', 'whatsapp', 'offline'));

-- 4. Store Integration Credentials safely
-- We'll use a new table 'integrations' instead of just a jsonb column on businesses, 
-- to allow for more complex auth tokens per channel.
create table if not exists public.integrations (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) not null,
  platform text not null, -- 'instagram', 'facebook', 'whatsapp', 'twilio'
  credentials jsonb default '{}'::jsonb, -- Store API keys/Tokens (Encrypted in real app)
  is_active boolean default true,
  settings jsonb default '{}'::jsonb, -- Platform specific settings (e.g. auto-reply)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(business_id, platform)
);

-- RLS for Integrations
alter table public.integrations enable row level security;

create policy "Owners can manage their integrations." on public.integrations for all using (
  exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);
