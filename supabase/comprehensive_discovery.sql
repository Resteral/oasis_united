-- OASIS UNITED MUNICIPAL DISCOVERY REGISTRY
-- VERSION: 1.0.40 Stable
-- LAST SYNCHRONIZATION: 2026-04-04 19:51:00

-- Enable UUID support
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Public profiles for Users, Business Owners, & Deliverers)
create table if not exists public.profiles (
  id uuid primary key, 
  full_name text,
  avatar_url text,
  role text check (role in ('business', 'consumer', 'deliverer', 'admin', 'staff')) default 'consumer',
  town text,
  subscription_tier text default 'free',
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. TOWNS TABLE (Centrally registered towns or towns added by deliverers)
create table if not exists public.towns (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  state text default 'NH',
  added_by uuid references public.profiles(id), 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(name, state)
);

-- 3. BUSINESSES TABLE (Regional Trade Nodes)
create table if not exists public.businesses (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id),
  onboarded_by uuid references public.profiles(id),
  slug text unique not null,
  name text not null,
  description text,
  category text, 
  location text, 
  town_id uuid references public.towns(id),
  image_url text,
  lat numeric,
  lng numeric,
  is_big_store boolean default false,
  external_sync_source text check (external_sync_source in ('doordash', 'uber', 'manual')) default 'manual',
  external_sync_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure Unique Constraints for ON CONFLICT logic (Absolute Stability Phase)
do $$ 
begin
    -- Businesses slug constraint
    if not exists (select 1 from pg_constraint where conname = 'businesses_slug_key') then
        alter table public.businesses add constraint businesses_slug_key unique (slug);
    end if;
end $$;

-- 4. PRODUCTS TABLE (Global Inventory Registry)
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  name text not null,
  description text,
  price numeric not null,
  stock integer default 0,
  category text,
  image_url text,
  is_shippable boolean default false,
  shipping_cost numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(business_id, name) -- Restored for fresh installs
);

-- Ensure Unique Constraints for existing tables (Absolute Stability Phase)
do $$ 
begin
    -- Products unique constraint
    if not exists (select 1 from pg_constraint where conname = 'products_business_id_name_key') then
        alter table public.products add constraint products_business_id_name_key unique (business_id, name);
    end if;
end $$;

-- 5. ORDERS TABLE (Core Commerce Engine)
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) not null,
  consumer_id uuid references public.profiles(id),
  customer_name text,
  customer_contact text,
  status text check (status in ('pending', 'processing', 'transit', 'delivered', 'cancelled')) default 'pending', 
  total numeric not null,
  items jsonb, -- Snapshot: [{id, name, price, quantity}]
  type text check (type in ('pickup', 'shipping', 'delivery', 'in-house')) default 'pickup',
  address text,
  table_id uuid, -- Reference to seating
  deliverer_id uuid references public.profiles(id),
  tracking_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SEEDING (Municipal & Big Store Trade Matrix)
insert into public.towns (name) values ('Effingham'), ('Livingston'), ('Ossipee Lake'), ('Freedom')
on conflict (name) do nothing;

do $$
declare
  freedom_id uuid;
begin
  select id into freedom_id from public.towns where name = 'Freedom';

  -- Regional Local Node
  insert into public.businesses (slug, name, category, location, town_id)
  values ('the-spot-freedom', 'The Spot Freedom', 'Restaurant', 'Downtown Freedom', freedom_id)
  on conflict (slug) do nothing;

  -- Big Store Node
  insert into public.businesses (slug, name, category, location, is_big_store)
  values ('walmart-regional', 'Walmart Supercenter', 'Big Store', 'Regional Hub', true)
  on conflict (slug) do nothing;

  -- Product Registry Ingest
  declare
    spot_id uuid;
    wm_id uuid;
  begin
    select id into spot_id from public.businesses where slug = 'the-spot-freedom';
    select id into wm_id from public.businesses where slug = 'walmart-regional';

    if spot_id is not null then
      insert into public.products (business_id, name, price, category, is_shippable, shipping_cost)
      values (spot_id, 'Artisan Pizza', 12.00, 'Food', false, 0)
      on conflict (business_id, name) do nothing;
    end if;

    if wm_id is not null then
      insert into public.products (business_id, name, price, category, is_shippable, shipping_cost)
      values 
        (wm_id, 'Regional 4K TV', 299.00, 'Electronics', true, 25.00),
        (wm_id, 'Durable Camp Tent', 45.00, 'Outdoor', true, 12.00)
      on conflict (business_id, name) do nothing;
    end if;
  end;
end $$;
