-- 1. BASE SCHEMA FOR OASIS UNITED DISCOVERY
-- Enable UUID support
create extension if not exists "uuid-ossp";

-- PROFILES TABLE (Public profiles for Users & Business Owners)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  role text check (role in ('business', 'consumer')) default 'consumer',
  subscription_tier text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- BUSINESSES TABLE (Storefront details: Hardware, Restaurants, etc.)
create table if not exists public.businesses (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id), -- Nullable for placeholder shops
  slug text unique not null,
  name text not null,
  description text,
  category text, -- Retail, Restaurant, Hardware, etc.
  location text,
  image_url text,
  integrations jsonb default '{}'::jsonb, -- { twilio: '+1...', instagram: '@...' }
  theme jsonb default '{}'::jsonb,
  delivery_settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

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

-- 2. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.products enable row level security;
alter table public.shoutouts enable row level security;

-- Public Read Policies
drop policy if exists "Everyone can view profiles" on public.profiles;
drop policy if exists "Everyone can view businesses" on public.businesses;
drop policy if exists "Everyone can view products" on public.products;
drop policy if exists "Everyone can view shoutouts" on public.shoutouts;

create policy "Everyone can view profiles" on public.profiles for select using (true);
create policy "Everyone can view businesses" on public.businesses for select using (true);
create policy "Everyone can view products" on public.products for select using (true);
create policy "Everyone can view shoutouts" on public.shoutouts for select using (true);

-- 3. NEIGHBORHOOD SEED DATA (Effingham Area Discovery)
-- Using fixed UUIDs for seed relationships
insert into public.businesses (id, slug, name, category, location, description)
values 
  ('a1b2c3d4-e5f6-4a5b-b6c7-d8e9f0a1b2c3', 'pnb-eats', 'PNB Eats', 'Restaurant', 'Effingham', 'Fresh pizza & specialty subs.'),
  ('b2c3d4e5-f6a7-4b6c-c7d8-e9f0a1b2c3d4', 'boyles-general', 'Boyle''s General Store', 'Grocery', 'Effingham Falls', 'Local staples & artisanal goods.'),
  ('c3d4e5f6-a7b8-4c7d-d8e9-f0a1b2c3d4e5', 'walts-carpentry', 'Walt''s Carpentry & Hardware', 'Hardware', 'Effingham', 'Custom woodworking & hardware.'),
  ('d4e5f6a7-b8c9-4d8e-e9f0-a1b2c3d4e5f6', 'wayside-farm', 'Wayside Farm Stand', 'Farm & Grocery', 'Effingham', 'Seasonal fresh produce & dairy.')
on conflict (slug) do update set name = excluded.name;

-- Insert product price tracking linked to the seed businesses
insert into public.products (business_id, name, price, category)
values
  ('a1b2c3d4-e5f6-4a5b-b6c7-d8e9f0a1b2c3', 'Large Pepperoni Pizza', 18.50, 'Eats'),
  ('a1b2c3d4-e5f6-4a5b-b6c7-d8e9f0a1b2c3', 'Breakfast Sub', 12.99, 'Eats'),
  ('b2c3d4e5-f6a7-4b6c-c7d8-e9f0a1b2c3d4', 'Local Honey (16oz)', 9.00, 'Grocery'),
  ('b2c3d4e5-f6a7-4b6c-c7d8-e9f0a1b2c3d4', 'Milk (Gal)', 4.89, 'Grocery'),
  ('c3d4e5f6-a7b8-4c7d-d8e9-f0a1b2c3d4e5', 'Custom Hardware Kit', 45.99, 'Hardware'),
  ('d4e5f6a7-b8c9-4d8e-e9f0-a1b2c3d4e5f6', 'Local Eggs (Doz)', 6.00, 'Fresh')
on conflict do nothing;

-- Insert community shoutouts
insert into public.shoutouts (business_id, type, content)
values
  ('b2c3d4e5-f6a7-4b6c-c7d8-e9f0a1b2c3d4', 'update', 'Fresh local artisan cheese arriving today at 2 PM!'),
  ('d4e5f6a7-b8c9-4d8e-e9f0-a1b2c3d4e5f6', 'promo', 'BOGO on all heirloom tomatoes this weekend only.')
on conflict do nothing;
