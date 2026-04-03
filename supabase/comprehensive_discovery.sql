-- 1. BASE SCHEMA FOR OASIS UNITED DISCOVERY
-- Enable UUID support
create extension if not exists "uuid-ossp";

-- PROFILES TABLE (Public profiles for Users, Business Owners, & Deliverers)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  role text check (role in ('business', 'consumer', 'deliverer')) default 'consumer',
  town text, -- The user's primary town (e.g., Effingham, Freedom)
  subscription_tier text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure town column exists if table was already created
alter table public.profiles add column if not exists town text;

-- BUSINESSES TABLE (Storefront details: Hardware, Restaurants, etc.)
create table if not exists public.businesses (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id), -- Nullable for placeholder shops
  onboarded_by uuid references public.profiles(id), -- The deliverer/citizen who "sold" the platform
  slug text unique not null,
  name text not null,
  description text,
  category text, -- Retail, Restaurant, Hardware, etc.
  location text, -- Physical address or specific town area
  image_url text,
  integrations jsonb default '{}'::jsonb, -- { twilio: '+1...', instagram: '@...' }
  theme jsonb default '{}'::jsonb,
  delivery_settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Ensure onboarded_by column exists if table was already created
alter table public.businesses add column if not exists onboarded_by uuid references public.profiles(id);

-- PRODUCTS TABLE (Prices for Groceries, Menu items, Hardware supplies)
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade not null,
  name text not null,
  description text,
  price numeric not null,
  stock integer default 0,
  category text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- GLOBAL SHOUTOUTS TABLE (Real-time community updates & promos)
create table if not exists public.shoutouts (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade,
  type text check (type in ('promo', 'alert', 'update')) default 'update',
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- DELIVERER PROFILES (Specialized data for the Delivery Fleet)
create table if not exists public.deliverer_profiles (
  id uuid references public.profiles(id) primary key,
  vehicle_type text check (vehicle_type in ('car', 'bike', 'truck', 'walk')) default 'car',
  is_active boolean default false,
  status text check (status in ('available', 'busy', 'offline')) default 'offline',
  last_known_location point,
  service_town text -- Deliverers can serve specific towns
);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.products enable row level security;
alter table public.shoutouts enable row level security;
alter table public.deliverer_profiles enable row level security;

-- Public Read Policies
drop policy if exists "Everyone can view profiles" on public.profiles;
drop policy if exists "Everyone can view businesses" on public.businesses;
drop policy if exists "Everyone can view products" on public.products;
drop policy if exists "Everyone can view shoutouts" on public.shoutouts;
drop policy if exists "Everyone can view deliverers" on public.deliverer_profiles;

create policy "Everyone can view profiles" on public.profiles for select using (true);
create policy "Everyone can view businesses" on public.businesses for select using (true);
create policy "Everyone can view products" on public.products for select using (true);
create policy "Everyone can view shoutouts" on public.shoutouts for select using (true);
create policy "Everyone can view deliverers" on public.deliverer_profiles for select using (true);

-- 5. NEIGHBORHOOD SEED DATA (Effingham Area Discovery)
-- 5a. Create a primary deliverer/agent
-- Note: In a real app, these would come from auth.users. 
-- We assume these UUIDs represent previously created Auth users for this demo.
insert into public.profiles (id, full_name, role, town)
values 
  ('e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321', 'Local Dave', 'deliverer', 'Effingham')
on conflict (id) do update set role = excluded.role;

insert into public.deliverer_profiles (id, vehicle_type, status, is_active, service_town)
values 
  ('e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321', 'truck', 'available', true, 'Effingham')
on conflict (id) do nothing;

-- 5b. Businesses (Attributed to the deliverer who onboarded them)
insert into public.businesses (id, slug, name, category, location, description, onboarded_by)
values 
  ('a1b2c3d4-e5f6-4a5b-b6c7-d8e9f0a1b2c3', 'pnb-eats', 'PNB Eats', 'Restaurant', 'Effingham', 'Fresh pizza & specialty subs.', 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321'),
  ('b2c3d4e5-f6a7-4b6c-c7d8-e9f0a1b2c3d4', 'boyles-general', 'Boyle''s General Store', 'Grocery', 'Effingham Falls', 'Local staples & artisanal goods.', 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321'),
  ('c3d4e5f6-a7b8-4c7d-d8e9-f0a1b2c3d4e5', 'walts-carpentry', 'Walt''s Carpentry & Hardware', 'Hardware', 'Effingham', 'Custom woodworking & hardware.', 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321'),
  ('d4e5f6a7-b8c9-4d8e-e9f0-a1b2c3d4e5f6', 'wayside-farm', 'Wayside Farm Stand', 'Farm & Grocery', 'Effingham', 'Seasonal fresh produce & dairy.', 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321')
on conflict (slug) do update set onboarded_by = excluded.onboarded_by;

-- 5c. Products
insert into public.products (business_id, name, price, category)
values
  ('a1b2c3d4-e5f6-4a5b-b6c7-d8e9f0a1b2c3', 'Large Pepperoni Pizza', 18.50, 'Eats'),
  ('a1b2c3d4-e5f6-4a5b-b6c7-d8e9f0a1b2c3', 'Breakfast Sub', 12.99, 'Eats'),
  ('b2c3d4e5-f6a7-4b6c-c7d8-e9f0a1b2c3d4', 'Local Honey (16oz)', 9.00, 'Grocery'),
  ('b2c3d4e5-f6a7-4b6c-c7d8-e9f0a1b2c3d4', 'Milk (Gal)', 4.89, 'Grocery'),
  ('c3d4e5f6-a7b8-4c7d-d8e9-f0a1b2c3d4e5', 'Custom Hardware Kit', 45.99, 'Hardware'),
  ('d4e5f6a7-b8c9-4d8e-e9f0-a1b2c3d4e5f6', 'Local Eggs (Doz)', 6.00, 'Fresh')
on conflict do nothing;

-- 5d. Community shoutouts
insert into public.shoutouts (business_id, type, content)
values
  ('b2c3d4e5-f6a7-4b6c-c7d8-e9f0a1b2c3d4', 'update', 'Fresh local artisan cheese arriving today at 2 PM!'),
  ('d4e5f6a7-b8c9-4d8e-e9f0-a1b2c3d4e5f6', 'promo', 'BOGO on all heirloom tomatoes this weekend only.')
on conflict do nothing;
