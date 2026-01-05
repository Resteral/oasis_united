-- SAFE MIGRATION SCRIPT
-- Run this in Supabase SQL Editor to update your database.
-- It will NOT delete data or error if tables already exist.

-- 1. Add 'integrations' column to businesses if missing
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'businesses' and column_name = 'integrations') then
        alter table public.businesses add column integrations jsonb default '{}'::jsonb;
    end if;
end $$;

-- 2. Add 'updated_at' column to businesses if missing (FIXES SETTINGS ERROR)
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'businesses' and column_name = 'updated_at') then
        alter table public.businesses add column updated_at timestamp with time zone default timezone('utc'::text, now());
    end if;
end $$;

-- 3. Add 'channel' and 'customer_contact' to orders if missing
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'channel') then
        alter table public.orders add column channel text check (channel in ('web', 'sms', 'instagram', 'offline')) default 'web';
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'customer_contact') then
        alter table public.orders add column customer_contact text;
    end if;
end $$;

-- 4. Create Messages table if it doesn't exist
create table if not exists public.messages (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id),
    customer_contact text not null, -- Phone or Handle
    channel text not null,
    direction text check (direction in ('inbound', 'outbound')),
    content text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Enable RLS on Messages (Safe to run multiple times)
alter table public.messages enable row level security;

-- 6. Add RLS policy for Messages (Drop first to avoid duplication error)
drop policy if exists "Owners can view messages." on public.messages;
create policy "Owners can view messages." on public.messages for select using (
    exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);

-- 7. Add Full Text Search Extension
create extension if not exists pg_trgm;
create index if not exists products_name_trgm_idx on public.products using gin (name gin_trgm_ops);
create index if not exists businesses_category_idx on public.businesses (category);
