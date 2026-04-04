-- 🌌 THE OASIS UNITED: UNIFIED COMMERCE REGISTRY
-- VERSION: 2.1.3 (PARSE-RESISTANT)
-- DESCRIPTION: High-density municipal trade engine with dynamic policy execution to bypass SQL parse errors.

-- 1. SYSTEM INITIALIZATION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA public;

-- 2. INFRASTRUCTURE SANITIZATION (Idempotent Column Upgrades)
-- PROFILES: Regional Identity Node
CREATE TABLE IF NOT EXISTS public.profiles (id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('business', 'consumer', 'deliverer', 'admin', 'staff', 'provider')) DEFAULT 'consumer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS town TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_settings JSONB DEFAULT '{"bg_color": "#0a0a0b", "text_color": "#ffffff", "primary_color": "#4F46E5"}'::JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- TOWNS: Municipal Geography
CREATE TABLE IF NOT EXISTS public.towns (id UUID DEFAULT uuid_generate_v4() PRIMARY KEY);
ALTER TABLE public.towns ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.towns ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'NH';
ALTER TABLE public.towns ADD COLUMN IF NOT EXISTS added_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.towns ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- BUSINESSES: Regional Trade Nodes
CREATE TABLE IF NOT EXISTS public.businesses (id UUID DEFAULT uuid_generate_v4() PRIMARY KEY);
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS town_id UUID REFERENCES public.towns(id);
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS theme JSONB DEFAULT '{"primaryColor": "#4F46E5", "backgroundColor": "#0a0a0b"}'::JSONB;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS lat NUMERIC;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS lng NUMERIC;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS is_big_store BOOLEAN DEFAULT false;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- PRODUCTS: Verified Inventory
CREATE TABLE IF NOT EXISTS public.products (id UUID DEFAULT uuid_generate_v4() PRIMARY KEY);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true; -- CRITICAL: Ensure this runs first
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_shippable BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- 3. UNIQUE CONSTRAINTS (Atomic Integrity)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'businesses_slug_key') THEN
        ALTER TABLE public.businesses ADD CONSTRAINT businesses_slug_key UNIQUE (slug);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_business_id_name_key') THEN
        ALTER TABLE public.products ADD CONSTRAINT products_business_id_name_key UNIQUE (business_id, name);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'towns_name_state_key') THEN
        ALTER TABLE public.towns ADD CONSTRAINT towns_name_state_key UNIQUE (name, state);
    END IF;
END $$;

-- 4. LOGISTICS ENGINE: ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) NOT NULL,
    consumer_id UUID REFERENCES public.profiles(id) NOT NULL,
    status TEXT DEFAULT 'pending',
    type TEXT DEFAULT 'pickup',
    total NUMERIC NOT NULL,
    items JSONB,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_contact TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_location GEOGRAPHY(POINT);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS table_id UUID;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS deliverer_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- 5. SOCIAL & MARKETING NODES
CREATE TABLE IF NOT EXISTS public.fleet_ads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    headline TEXT NOT NULL,
    image_url TEXT,
    display_duration INTEGER DEFAULT 15,
    is_active BOOLEAN DEFAULT true,
    campaign_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5b. ADVANCED LOGISTICS ENGINE
CREATE TABLE IF NOT EXISTS public.deliverer_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'offline',
    active_until TIMESTAMP WITH TIME ZONE,
    duty_lock BOOLEAN DEFAULT false,
    rating NUMERIC DEFAULT 5.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.delivery_routes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    deliverer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    estimated_duration INTEGER DEFAULT 0, -- in minutes
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.route_stops (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    route_id UUID REFERENCES public.delivery_routes(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.route_schedules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    route_id UUID REFERENCES public.delivery_routes(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER, -- 0-6 (Sunday-Saturday)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.route_ads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    route_id UUID REFERENCES public.delivery_routes(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    ad_content TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, active, expired
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. SECURITY & DYNAMIC POLICIES (Bypassing Parse-Time Validation)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_ads ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- DROP existing policies
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Businesses are public" ON public.businesses;
    DROP POLICY IF EXISTS "Owners can manage businesses" ON public.businesses;
    DROP POLICY IF EXISTS "Available products are public" ON public.products;
    DROP POLICY IF EXISTS "Sellers manage own products" ON public.products;
    DROP POLICY IF EXISTS "Consumers view own orders" ON public.orders;
    DROP POLICY IF EXISTS "Businesses view received orders" ON public.orders;
    DROP POLICY IF EXISTS "Fleet ads are public" ON public.fleet_ads;

    -- CREATE Policies using Dynamic SQL to avoid parsing errors on new columns
    EXECUTE 'CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id)';
    EXECUTE 'CREATE POLICY "Businesses are public" ON public.businesses FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Owners can manage businesses" ON public.businesses FOR ALL USING (auth.uid() = owner_id)';
    
    -- This specific policy often fails if is_available is added in the same script
    EXECUTE 'CREATE POLICY "Available products are public" ON public.products FOR SELECT USING (is_available = true)';
    
    EXECUTE 'CREATE POLICY "Sellers manage own products" ON public.products FOR ALL USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = products.business_id AND b.owner_id = auth.uid()))';
    EXECUTE 'CREATE POLICY "Consumers view own orders" ON public.orders FOR SELECT USING (auth.uid() = consumer_id)';
    EXECUTE 'CREATE POLICY "Businesses view received orders" ON public.orders FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = orders.business_id AND b.owner_id = auth.uid()))';
    EXECUTE 'CREATE POLICY "Fleet ads are public" ON public.fleet_ads FOR SELECT USING (true)';
    
    -- Logistics Policies
    EXECUTE 'CREATE POLICY "Deliverer profiles are public" ON public.deliverer_profiles FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Manage own deliverer profile" ON public.deliverer_profiles FOR ALL USING (auth.uid() = id)';
    
    EXECUTE 'CREATE POLICY "Routes are public" ON public.delivery_routes FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Manage own routes" ON public.delivery_routes FOR ALL USING (auth.uid() = deliverer_id)';
    
    EXECUTE 'CREATE POLICY "Route stops are public" ON public.route_stops FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Manage own route stops" ON public.route_stops FOR ALL USING (EXISTS (SELECT 1 FROM public.delivery_routes r WHERE r.id = route_stops.route_id AND r.deliverer_id = auth.uid()))';
    
    EXECUTE 'CREATE POLICY "Schedules are public" ON public.route_schedules FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Manage own schedules" ON public.route_schedules FOR ALL USING (EXISTS (SELECT 1 FROM public.delivery_routes r WHERE r.id = route_schedules.route_id AND r.deliverer_id = auth.uid()))';
    
    EXECUTE 'CREATE POLICY "Businesses manage own ads" ON public.route_ads FOR ALL USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = route_ads.business_id AND b.owner_id = auth.uid()))';
    EXECUTE 'CREATE POLICY "Route ads are public" ON public.route_ads FOR SELECT USING (true)';

    -- Staging & Waiting Policies
    EXECUTE 'CREATE TABLE IF NOT EXISTS public.wait_points (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        town_id UUID REFERENCES public.towns(id) ON DELETE CASCADE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL
    )';
    
    EXECUTE 'CREATE TABLE IF NOT EXISTS public.active_waiting (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        deliverer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
        wait_point_id UUID REFERENCES public.wait_points(id) ON DELETE CASCADE NOT NULL,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(''utc''::text, now()) NOT NULL
    )';

    EXECUTE 'ALTER TABLE public.wait_points ENABLE ROW LEVEL SECURITY';
    EXECUTE 'ALTER TABLE public.active_waiting ENABLE ROW LEVEL SECURITY';
    
    EXECUTE 'CREATE POLICY "Wait points are public" ON public.wait_points FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "Manage own wait status" ON public.active_waiting FOR ALL USING (auth.uid() = deliverer_id)';
    EXECUTE 'CREATE POLICY "Active waits are public" ON public.active_waiting FOR SELECT USING (true)';
END $$;

-- 7. SEEDING INITIAL MUNICIPAL INFRASTRUCTURE
CREATE TABLE IF NOT EXISTS public.products_template (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    category TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE FUNCTION public.seed_new_town_infrastructure()
RETURNS TRIGGER AS $$
DECLARE
    new_biz_id UUID;
BEGIN
    -- 1. Create a "General Store" Node for the new town
    INSERT INTO public.businesses (slug, name, category, town_id, owner_id)
    VALUES (
        new.name || '-general-store-' || floor(random() * 1000)::text,
        new.name || ' General Store',
        'Retail',
        new.id,
        new.added_by
    )
    RETURNING id INTO new_biz_id;

    -- 2. Populate with verified drops from the template
    -- FIXED: Added ON CONFLICT to prevent duplicate key violations during atomic seeding
    INSERT INTO public.products (business_id, name, price, category, description)
    SELECT new_biz_id, name, price, category, description 
    FROM public.products_template
    ON CONFLICT (business_id, name) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automate town seeding
DROP TRIGGER IF EXISTS on_town_creation ON public.towns;
CREATE TRIGGER on_town_creation
AFTER INSERT ON public.towns
FOR EACH ROW EXECUTE FUNCTION public.seed_new_town_infrastructure();

INSERT INTO public.towns (name, state) VALUES 
('Effingham', 'NH'), 
('Livingston', 'NH'), 
('Ossipee Lake', 'NH'), 
('Freedom', 'NH'),
('Wolfeboro', 'NH')
ON CONFLICT (name, state) DO NOTHING;
