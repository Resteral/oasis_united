-- FIXED SCHEMA SCRIPT (Safe to run multiple times)
-- This script ensures your database has all necessary tables and columns without erroring if they already exist.

-- 1. EXTENSIONS (Optional, gen_random_uuid() is built-in for PG13+)
create extension if not exists pg_trgm;

-- 2. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  role text check (role in ('business', 'consumer')) default 'consumer',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

-- Policies
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);


-- 3. BUSINESSES TABLE
create table if not exists public.businesses (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) not null,
  slug text unique not null,
  name text not null,
  description text,
  category text,
  location text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Safely add columns if they don't exist
do $$
begin
    -- Integrations
    if not exists (select 1 from information_schema.columns where table_name = 'businesses' and column_name = 'integrations') then
        alter table public.businesses add column integrations jsonb default '{}'::jsonb;
    end if;
    -- Theme
    if not exists (select 1 from information_schema.columns where table_name = 'businesses' and column_name = 'theme') then
        alter table public.businesses add column theme jsonb default '{"primaryColor": "#000000", "backgroundColor": "#ffffff"}'::jsonb;
    end if;
    -- Delivery Settings
    if not exists (select 1 from information_schema.columns where table_name = 'businesses' and column_name = 'delivery_settings') then
        alter table public.businesses add column delivery_settings jsonb default '{"radius": 5, "selfDelivery": false, "providers": []}'::jsonb;
    end if;
end $$;

alter table public.businesses enable row level security;

-- Policies
drop policy if exists "Businesses are viewable by everyone." on public.businesses;
create policy "Businesses are viewable by everyone." on public.businesses for select using (true);

drop policy if exists "Owners can insert their business." on public.businesses;
create policy "Owners can insert their business." on public.businesses for insert with check (auth.uid() = owner_id);

drop policy if exists "Owners can update their business." on public.businesses;
create policy "Owners can update their business." on public.businesses for update using (auth.uid() = owner_id);

create index if not exists businesses_category_idx on public.businesses (category);


-- 4. PRODUCTS TABLE
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) not null,
  name text not null,
  description text,
  price numeric not null,
  stock integer default 0,
  category text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;

-- Policies
drop policy if exists "Products are viewable by everyone." on public.products;
create policy "Products are viewable by everyone." on public.products for select using (true);

drop policy if exists "Owners can insert products." on public.products;
create policy "Owners can insert products." on public.products for insert with check (
  exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);

drop policy if exists "Owners can update products." on public.products;
create policy "Owners can update products." on public.products for update using (
  exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);

drop policy if exists "Owners can delete products." on public.products;
create policy "Owners can delete products." on public.products for delete using (
  exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);

create index if not exists products_name_trgm_idx on public.products using gin (name gin_trgm_ops);


-- 5. ORDERS TABLE
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) not null,
  consumer_id uuid references public.profiles(id),
  customer_name text,
  status text default 'pending',
  total numeric not null,
  items jsonb,
  type text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'customer_contact') then
        alter table public.orders add column customer_contact text;
    end if;
    if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'channel') then
        alter table public.orders add column channel text check (channel in ('web', 'sms', 'instagram', 'offline')) default 'web';
    end if;
end $$;

alter table public.orders enable row level security;

-- Policies
drop policy if exists "Business owners can view orders for their business." on public.orders;
create policy "Business owners can view orders for their business." on public.orders for select using (
  exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);

drop policy if exists "Consumers can view their own orders." on public.orders;
create policy "Consumers can view their own orders." on public.orders for select using (
  auth.uid() = consumer_id
);

drop policy if exists "Anyone can create an order." on public.orders;
create policy "Anyone can create an order." on public.orders for insert with check (true);


-- 6. MESSAGES TABLE
create table if not exists public.messages (
    id uuid default gen_random_uuid() primary key,
    business_id uuid references public.businesses(id),
    customer_contact text not null,
    channel text not null,
    direction text check (direction in ('inbound', 'outbound')),
    content text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'messages' and column_name = 'is_read') then
        alter table public.messages add column is_read boolean default false;
    end if;
end $$;

alter table public.messages enable row level security;

drop policy if exists "Owners can view messages." on public.messages;
create policy "Owners can view messages." on public.messages for select using (
    exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);


-- 7. POSTS TABLE
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.businesses(id) not null,
  type text check (type in ('post', 'event')) default 'post',
  title text,
  content text,
  image_url text,
  event_date timestamp with time zone,
  views integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.posts enable row level security;

drop policy if exists "Posts are viewable by everyone." on public.posts;
create policy "Posts are viewable by everyone." on public.posts for select using (true);

drop policy if exists "Owners can insert posts." on public.posts;
create policy "Owners can insert posts." on public.posts for insert with check (
  exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);

drop policy if exists "Owners can update posts." on public.posts;
create policy "Owners can update posts." on public.posts for update using (
  exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);

drop policy if exists "Owners can delete posts." on public.posts;
create policy "Owners can delete posts." on public.posts for delete using (
  exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);
