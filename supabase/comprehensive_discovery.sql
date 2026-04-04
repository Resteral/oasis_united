-- 1. BASE SCHEMA FOR OASIS UNITED DISCOVERY
-- Enable UUID support
create extension if not exists "uuid-ossp";

-- PRE-FLIGHT: Clean legacy constraints for 'Discovery Mode'
alter table if exists public.profiles drop constraint if exists profiles_id_fkey;
alter table if exists public.deliverer_profiles drop constraint if exists deliverer_profiles_id_fkey;

-- PROFILES TABLE (Public profiles for Users, Business Owners, & Deliverers)
-- Note: 'references auth.users' is omitted here to allow for mock data seeding without manual user creation.
create table if not exists public.profiles (
  id uuid primary key, 
  full_name text,
  avatar_url text,
  role text check (role in ('business', 'consumer', 'deliverer', 'admin', 'staff')) default 'consumer',
  town text,
  subscription_tier text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TOWNS TABLE (Centrally registered towns or towns added by deliverers)
create table if not exists public.towns (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  state text,
  added_by uuid references public.profiles(id), -- The driver who "opened" this town
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(name, state)
);

-- Ensure town column exists if table was already created
alter table public.profiles add column if not exists town text;

-- Update the role check constraint to include 'deliverer' (and be defensive about existing data)
alter table public.profiles drop constraint if exists profiles_role_check;
update public.profiles set role = 'consumer' where role not in ('business', 'consumer', 'deliverer', 'admin', 'staff');
alter table public.profiles add constraint profiles_role_check check (role in ('business', 'consumer', 'deliverer', 'admin', 'staff'));

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
  town_id uuid references public.towns(id), -- Linking business to a specific town entity
  image_url text,
  integrations jsonb default '{}'::jsonb, -- { twilio: '+1...', instagram: '@...' }
  theme jsonb default '{}'::jsonb,
  delivery_settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Ensure onboarded_by and town_id columns exist if table was already created
alter table public.businesses add column if not exists onboarded_by uuid references public.profiles(id);
alter table public.businesses add column if not exists town_id uuid references public.towns(id);
alter table public.businesses add column if not exists store_features jsonb default '{}'::jsonb;

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
  service_town text -- Legacy text field
);

-- DELIVERY ROUTES (Customized paths or zones defined by drivers)
create table if not exists public.delivery_routes (
  id uuid default uuid_generate_v4() primary key,
  deliverer_id uuid references public.profiles(id) not null,
  town_id uuid references public.towns(id) not null,
  name text not null, -- e.g., "Effingham Main Loop"
  stops jsonb default '[]'::jsonb, -- Ordered list of location points or business IDs
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.products enable row level security;
alter table public.shoutouts enable row level security;
alter table public.deliverer_profiles enable row level security;
alter table public.towns enable row level security;
alter table public.delivery_routes enable row level security;

-- CLEANUP DEPLOYMENT (Protocol sanitization)
do $$ 
begin
    drop policy if exists "Everyone can view profiles" on public.profiles;
    drop policy if exists "Users manage own profile" on public.profiles;
    drop policy if exists "Everyone can view businesses" on public.businesses;
    drop policy if exists "Owners manage own business" on public.businesses;
    drop policy if exists "Everyone can view products" on public.products;
    drop policy if exists "Owners manage own products" on public.products;
    drop policy if exists "Admins manage all products" on public.products;
    drop policy if exists "Everyone can view shoutouts" on public.shoutouts;
    drop policy if exists "Everyone can view deliverers" on public.deliverer_profiles;
    drop policy if exists "Everyone can view towns" on public.towns;
    drop policy if exists "Everyone can view routes" on public.delivery_routes;
end $$;

-- ATOMIC POLICY DEPLOYMENT
create policy "Everyone can view profiles" on public.profiles for select using (true);
create policy "Users manage own profile" on public.profiles for all using (auth.uid() = id);

create policy "Everyone can view businesses" on public.businesses for select using (true);
create policy "Owners manage own business" on public.businesses for all using (auth.uid() = owner_id);

create policy "Everyone can view products" on public.products for select using (true);
create policy "Owners manage own products" on public.products for all using (
    exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);
create policy "Admins manage all products" on public.products for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Everyone can view shoutouts" on public.shoutouts for select using (true);
create policy "Everyone can view deliverers" on public.deliverer_profiles for select using (true);
create policy "Everyone can view towns" on public.towns for select using (true);
create policy "Everyone can view routes" on public.delivery_routes for select using (true);

-- 5. NEIGHBORHOOD SEED DATA (Regional Discovery Network)
-- 5a. Create a primary deliverer/agent
insert into public.profiles (id, full_name, role, town)
values 
  ('e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321', 'Local Dave', 'deliverer', 'Effingham')
on conflict (id) do update set role = excluded.role;

insert into public.deliverer_profiles (id, vehicle_type, status, is_active, service_town)
values 
  ('e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321', 'truck', 'available', true, 'Effingham')
on conflict (id) do nothing;

-- 5b. Towns Registration
insert into public.towns (name, state, added_by)
values
  ('Effingham', 'NH', 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321'),
  ('Freedom', 'NH', 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321'),
  ('Ossipee', 'NH', 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321'),
  ('Tamworth', 'NH', 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321'),
  ('Sandwich', 'NH', 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321')
on conflict (name, state) do nothing;

-- 5c. Use a DO block to link businesses to newly created town IDs accurately
do $$
declare
  effingham_id uuid;
  freedom_id uuid;
  ossipee_id uuid;
  tamworth_id uuid;
  sandwich_id uuid;
begin
  select id into effingham_id from public.towns where name = 'Effingham' limit 1;
  select id into freedom_id from public.towns where name = 'Freedom' limit 1;
  select id into ossipee_id from public.towns where name = 'Ossipee' limit 1;
  select id into tamworth_id from public.towns where name = 'Tamworth' limit 1;
  select id into sandwich_id from public.towns where name = 'Sandwich' limit 1;

  -- Original Effingham Businesses
  insert into public.businesses (slug, name, category, location, town_id, onboarded_by, description)
  values 
    ('pnb-eats', 'PNB Eats', 'Restaurant', 'Effingham', effingham_id, 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321', 'Fresh pizza & specialty subs.'),
    ('boyles-general', 'Boyle''s General Store', 'Grocery', 'Effingham Falls', effingham_id, 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321', 'Local staples & artisanal goods.'),
    ('walts-carpentry', 'Walt''s Carpentry', 'Carpenter', 'Effingham', effingham_id, 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321', 'Custom woodworking & residential hardware.'),
    ('wayside-farm', 'Wayside Farm Stand', 'Farm & Grocery', 'Effingham', effingham_id, 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321', 'Seasonal fresh produce & dairy.')
  on conflict (slug) do update set town_id = excluded.town_id, category = excluded.category, name = excluded.name;

  -- Mark Founding Partners
  update public.businesses 
  set store_features = store_features || '{"is_founding_partner": true, "trade": "Carpenter"}'::jsonb 
  where slug = 'walts-carpentry';

  -- Freedom Businesses
  insert into public.businesses (slug, name, category, location, town_id, onboarded_by, description)
  values 
    ('freedom-gallery', 'Village Art Gallery', 'Art & Decor', 'Freedom Village', freedom_id, 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321', 'Local NH artisan crafts and fine art pieces.'),
    ('berry-bay-supplies', 'Berry Bay Marina & Store', 'Outdoor & Grocery', 'Freedom', freedom_id, 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321', 'Lakeside supplies, bait, and quick bites.')
  on conflict (slug) do nothing;

  -- Ossipee Businesses (Discovered via regional scan)
  insert into public.businesses (slug, name, category, location, town_id, onboarded_by, description)
  values 
    ('yankee-smokehouse', 'Yankee Smokehouse', 'BBQ & Pizza', 'West Ossipee', ossipee_id, 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321', 'Famous world-class smoked ribs and New Hampshire hospitality.'),
    ('jakes-seafood', 'Jake''s Seafood & Grill', 'Seafood', 'Ossipee', ossipee_id, 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321', 'Fresh New England favorites and coastal flavors.')
  on conflict (slug) do update set town_id = excluded.town_id, category = excluded.category;

  -- Tamworth Businesses
  insert into public.businesses (slug, name, category, location, town_id, onboarded_by, description)
  values 
    ('tamworth-distilling', 'Tamworth Distilling', 'Spirits', 'Tamworth Village', tamworth_id, 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321', 'World-class wilderness spirits and botanicals.'),
    ('the-barnstormers', 'Barnstormers Theatre Shop', 'Gifts', 'Tamworth', tamworth_id, 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321', 'Curated theatrical gifts and local memorabilia.')
  on conflict (slug) do nothing;

end $$;

do $$
  declare
    pnb_id uuid;
    boyles_id uuid;
    walts_id uuid;
    yankee_id uuid;
    jakes_id uuid;
    hobbs_id uuid;
  begin
    select id into pnb_id from public.businesses where slug = 'pnb-eats';
    select id into boyles_id from public.businesses where slug = 'boyles-general';
    select id into walts_id from public.businesses where slug = 'walts-carpentry';
    select id into yankee_id from public.businesses where slug = 'yankee-smokehouse';
    select id into jakes_id from public.businesses where slug = 'jakes-seafood';
    select id into hobbs_id from public.businesses where slug = 'hobbs-tavern';

    insert into public.products (business_id, name, price, category)
    values
      (pnb_id, 'Large Pepperoni Pizza', 18.50, 'Eats'),
      (pnb_id, 'Breakfast Sub', 12.99, 'Eats'),
      (boyles_id, 'Local Honey (16oz)', 9.00, 'Grocery'),
      (boyles_id, 'Milk (Gal)', 4.89, 'Grocery'),
      (walts_id, 'Custom Hardware Kit', 45.99, 'Hardware'),
      (yankee_id, 'Smokehouse Baby Back Ribs', 27.99, 'BBQ'),
      (yankee_id, 'Beef Brisket Dinner', 28.99, 'BBQ'),
      (yankee_id, 'Pulled Pork Platter', 26.99, 'BBQ'),
      (yankee_id, 'Smokehouse Wings (App)', 17.99, 'Apps'),
      (yankee_id, 'Homemade Cornbread', 5.99, 'Sides'),
      (jakes_id, 'New England Lobster Roll', 24.99, 'Seafood'),
      (jakes_id, 'Fried Whole Belly Clams', 22.00, 'Seafood'),
      (hobbs_id, '12oz Prime Rib Dinner', 35.00, 'Entree'),
      (hobbs_id, 'Steak & Cheese Eggrolls', 14.00, 'Apps'),
      (hobbs_id, 'Bang Bang Shrimp', 18.00, 'Apps'),
      (hobbs_id, 'Hobbs Classic Burger', 18.00, 'Entree'),
      (hobbs_id, 'Large Specialty Pizza', 15.00, 'Pizza')
    on conflict do nothing;
  end $$;

-- 5e. AUTOMATED REGIONAL SEEDING (Trigger for New Towns)
-- This ensures that when a driver/citizen "opens" a new town, default discovery nodes are created.
create or replace function public.seed_new_town_infrastructure()
returns trigger as $$
begin
  -- Example: When a town is added, we could auto-create a 'General Store' or 'Tavern' node
  -- For now, we will log the expansion in the regional shoutouts
  insert into public.shoutouts (business_id, type, content)
  select id, 'alert', 'A NEW DISCOVERY NODE HAS BEEN OPENED IN ' || upper(new.name) || '! Welcome to the network.'
  from public.businesses 
  where role = 'admin' 
  limit 1;
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_town_creation on public.towns;
create trigger on_town_creation
after insert on public.towns
for each row execute function public.seed_new_town_infrastructure();

-- 202. INVENTORY LOGISTICS (Supply Chain Tracking)
create table if not exists public.inventory_logistics (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) not null,
  product_id uuid references public.products(id),
  tracking_id text unique,
  source_node text, -- Where the import is coming from (e.g., "Ossipee Hub")
  destination_node uuid references public.towns(id),
  status text check (status in ('pending', 'transit', 'delivered', 'intake')) default 'pending',
  quantity integer not null,
  eta timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.inventory_logistics enable row level security;
create policy "Owners view own logistics" on public.inventory_logistics for select using (
    exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);
create policy "Admins manage all logistics" on public.inventory_logistics for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 221. ORDERS TABLE (Core Commerce Engine)
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) not null,
  consumer_id uuid references public.profiles(id), -- Nullable if guest checkout
  customer_name text,
  customer_contact text, -- Phone number or social handle
  channel text check (channel in ('web', 'sms', 'instagram', 'offline')) default 'web',
  status text check (status in ('pending', 'completed', 'cancelled', 'in-house')) default 'pending', 
  total numeric not null,
  items jsonb, -- Snapshot of cart items: [{id, name, price, quantity}]
  type text check (type in ('pickup', 'shipping', 'delivery', 'in-house')) default 'pickup',
  address text,
  table_number text, -- LINK: Physical seating assignment
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 222. SEATING LAYOUTS (Architect Mode storage)
create table if not exists public.seating_layouts (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) not null unique,
  layout_json jsonb not null default '[]'::jsonb, -- Array of Table objects: {id, number, capacity, x, y, rotation}
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 223. MESSAGES TABLE (AI Context & History)
create table if not exists public.messages (
    id uuid default uuid_generate_v4() primary key,
    business_id uuid references public.businesses(id),
    customer_contact text not null, -- Phone or Handle
    channel text not null,
    direction text check (direction in ('inbound', 'outbound')),
    content text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 284. FLEET ADS TABLE (In-Car Marketing Interface)
create table if not exists public.fleet_ads (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) not null,
  product_id uuid references public.products(id), -- Optional: Link to a specific SKU
  headline text not null,
  image_url text, -- High-contrast 'Dashboard-Optimized' creative
  target_town_id uuid references public.towns(id), -- Geo-fencing for ads
  is_active boolean default true,
  display_duration integer default 15, -- How many seconds to show the ad in the rotation
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.fleet_ads enable row level security;
create policy "Public view fleet ads" on public.fleet_ads for select using (true);
create policy "Owners manage own fleet ads" on public.fleet_ads for all using (
    exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);

-- 285. RLS FOR COMMERCE & ARCHITECTURE
alter table public.orders enable row level security;
alter table public.seating_layouts enable row level security;
alter table public.messages enable row level security;

-- CLEANUP OLD POLICIES (Fix for ERROR 42710)
drop policy if exists "Owners view own orders" on public.orders;
drop policy if exists "Users view own orders" on public.orders;
drop policy if exists "Public insert orders" on public.orders;
drop policy if exists "Public view layouts" on public.seating_layouts;
drop policy if exists "Public view fleet ads" on public.fleet_ads;
drop policy if exists "Owners manage own fleet ads" on public.fleet_ads;
drop policy if exists "Owners insert layout" on public.seating_layouts;
drop policy if exists "Owners update layout" on public.seating_layouts;
drop policy if exists "Owners manage messages" on public.messages;

-- Orders: Owner select own, User select own, Anyone insert
create policy "Owners view own orders" on public.orders for select using (
    exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);
create policy "Users view own orders" on public.orders for select using (auth.uid() = consumer_id);
create policy "Public insert orders" on public.orders for insert with check (true);

-- Seating: Public view, Owner manage
create policy "Public view layouts" on public.seating_layouts for select using (true);
create policy "Owners insert layout" on public.seating_layouts for insert with check (
    exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);
create policy "Owners update layout" on public.seating_layouts for update using (
    exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);

-- Messages: Owner manage
create policy "Owners manage messages" on public.messages for select using (
    exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);

-- 225. SEED DATA FINISHING TOUCHES
do $$
declare
  pnb_id uuid;
  boyles_id uuid;
  walts_id uuid;
begin
  select id into pnb_id from public.businesses where slug = 'pnb-eats';
  select id into boyles_id from public.businesses where slug = 'boyles-general';
  select id into walts_id from public.businesses where slug = 'walts-carpentry';

  -- Update Business Integration & Partner Tier Details
  update public.businesses set integrations = '{"phone": "(603) 539-7700"}'::jsonb, store_features = store_features || '{"tier": "Founding Partner"}'::jsonb where slug = 'pnb-eats';
  update public.businesses set integrations = '{"phone": "(603) 539-2500"}'::jsonb, store_features = store_features || '{"tier": "Founding Partner"}'::jsonb where slug = 'boyles-general';
  update public.businesses set integrations = '{"phone": "(603) 231-1042"}'::jsonb, store_features = store_features || '{"tier": "Founding Partner"}'::jsonb where slug = 'walts-carpentry';
  
  -- Ossipee & Freedom Contacts
  update public.businesses set integrations = '{"phone": "(603) 539-7427"}'::jsonb where slug = 'yankee-smokehouse';
  update public.businesses set integrations = '{"phone": "(603) 539-3371"}'::jsonb where slug = 'jakes-seafood';
  update public.businesses set integrations = '{"phone": "(603) 539-2000"}'::jsonb where slug = 'hobbs-tavern';
  update public.businesses set integrations = '{"phone": "(603) 539-6014"}'::jsonb where slug = 'freedom-gallery';
  update public.businesses set integrations = '{"phone": "(603) 539-0110"}'::jsonb where slug = 'berry-bay-supplies';

  insert into public.fleet_ads (business_id, headline, display_duration, image_url)
  values
    (pnb_id, 'Artisan Pizza. Regional Soul.', 15, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop'),
    (boyles_id, 'Local Provisions. Generational Quality.', 20, 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop')
  on conflict do nothing;
end $$;

insert into public.shoutouts (business_id, type, content)
select id, 'update', 'Fresh local artisan cheese arriving today at 2 PM!' from public.businesses where slug = 'boyles-general'
on conflict do nothing;
