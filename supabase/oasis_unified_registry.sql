-- OASIS UNIFIED COMMERCE REGISTRY
-- Optimized for: High-Density Municipal Infrastructure & Logistics Sovereignty
-- Revision: 2.15.5 (Final Seeding Fix + Logistics Extension + Node Governance)

-- 1. BASE GEOSPATIAL ENGINE
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. MUNICIPAL & MERCHANT NODES
CREATE TABLE IF NOT EXISTS public.towns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    geo_center GEOGRAPHY(POINT),
    added_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(name, state)
);

CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    location TEXT,
    geo_point GEOGRAPHY(POINT),
    town_id UUID REFERENCES public.towns(id) ON DELETE CASCADE NOT NULL,
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    theme JSONB DEFAULT '{"primaryColor": "#4F46E5", "backgroundColor": "#0a0a0b"}'::jsonb,
    is_featured BOOLEAN DEFAULT false,
    rating NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PRODUCT & INVENTORY REGISTRY
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    category TEXT,
    description TEXT,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_shippable BOOLEAN DEFAULT false,
    shipping_cost NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(business_id, name)
);

-- 4. LOGISTICS & ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    consumer_id UUID REFERENCES auth.users(id) NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    deliverer_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'pending',
    total_price NUMERIC NOT NULL,
    address TEXT NOT NULL,
    geo_destination GEOGRAPHY(POINT),
    delivery_type TEXT DEFAULT 'pickup', -- pickup, delivery, dine-in
    tracking_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

-- 5b. ADVANCED LOGISTICS ENGINE & GOVERNANCE
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
    estimated_duration INTEGER DEFAULT 0,
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

CREATE TABLE IF NOT EXISTS public.wait_points (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    town_id UUID REFERENCES public.towns(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.active_waiting (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    deliverer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    wait_point_id UUID REFERENCES public.wait_points(id) ON DELETE CASCADE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5c. MUNICIPAL CUSTODIAN PROTOCOL (Node Governance)
CREATE TABLE IF NOT EXISTS public.town_custodians (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    town_id UUID REFERENCES public.towns(id) ON DELETE CASCADE NOT NULL,
    deliverer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    auth_level TEXT DEFAULT 'standard', -- standard, elite, sovereign
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(town_id, deliverer_id)
);

-- 6. SECURITY & DYNAMIC POLICIES (Bypassing Parse-Time Validation)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.towns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wait_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_waiting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.town_custodians ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- 1. Profiles
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
    EXECUTE 'CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true)';

    -- 2. Businesses
    DROP POLICY IF EXISTS "Public businesses view" ON public.businesses;
    EXECUTE 'CREATE POLICY "Public businesses view" ON public.businesses FOR SELECT USING (true)';
    
    DROP POLICY IF EXISTS "Owners manage own business" ON public.businesses;
    EXECUTE 'CREATE POLICY "Owners manage own business" ON public.businesses FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id)';
    
    DROP POLICY IF EXISTS "Custodians manage town businesses" ON public.businesses;
    EXECUTE 'CREATE POLICY "Custodians manage town businesses" ON public.businesses FOR ALL USING (EXISTS (SELECT 1 FROM public.town_custodians tc WHERE tc.town_id = businesses.town_id AND tc.deliverer_id = auth.uid()))';

    -- 3. Products
    DROP POLICY IF EXISTS "Public products view" ON public.products;
    EXECUTE 'CREATE POLICY "Public products view" ON public.products FOR SELECT USING (true)';
    
    DROP POLICY IF EXISTS "Owners manage own products" ON public.products;
    EXECUTE 'CREATE POLICY "Owners manage own products" ON public.products FOR ALL USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = products.business_id AND b.owner_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = products.business_id AND b.owner_id = auth.uid()))';
    
    DROP POLICY IF EXISTS "Custodians manage town products" ON public.products;
    EXECUTE 'CREATE POLICY "Custodians manage town products" ON public.products FOR ALL USING (EXISTS (SELECT 1 FROM public.businesses b JOIN public.town_custodians tc ON b.town_id = tc.town_id WHERE b.id = products.business_id AND tc.deliverer_id = auth.uid()))';

    -- 4. Orders
    DROP POLICY IF EXISTS "Consumers view own orders" ON public.orders;
    EXECUTE 'CREATE POLICY "Consumers view own orders" ON public.orders FOR SELECT USING (auth.uid() = consumer_id)';
    
    DROP POLICY IF EXISTS "Consumers can place orders" ON public.orders;
    EXECUTE 'CREATE POLICY "Consumers can place orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = consumer_id)';
    
    DROP POLICY IF EXISTS "Businesses view received orders" ON public.orders;
    EXECUTE 'CREATE POLICY "Businesses view received orders" ON public.orders FOR SELECT USING (EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = orders.business_id AND b.owner_id = auth.uid()))';
    
    -- 5. Logistics & Governance
    DROP POLICY IF EXISTS "Manage own routes" ON public.delivery_routes;
    EXECUTE 'CREATE POLICY "Manage own routes" ON public.delivery_routes FOR ALL USING (auth.uid() = deliverer_id) WITH CHECK (auth.uid() = deliverer_id)';
    
    DROP POLICY IF EXISTS "Manage own wait status" ON public.active_waiting;
    EXECUTE 'CREATE POLICY "Manage own wait status" ON public.active_waiting FOR ALL USING (auth.uid() = deliverer_id) WITH CHECK (auth.uid() = deliverer_id)';
    
    DROP POLICY IF EXISTS "Manage own custodianship" ON public.town_custodians;
    EXECUTE 'CREATE POLICY "Manage own custodianship" ON public.town_custodians FOR ALL USING (auth.uid() = deliverer_id) WITH CHECK (auth.uid() = deliverer_id)';
    
    DROP POLICY IF EXISTS "Town custodians are public" ON public.town_custodians;
    EXECUTE 'CREATE POLICY "Town custodians are public" ON public.town_custodians FOR SELECT USING (true)';
    
    DROP POLICY IF EXISTS "Wait points are public" ON public.wait_points;
    EXECUTE 'CREATE POLICY "Wait points are public" ON public.wait_points FOR SELECT USING (true)';
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
        COALESCE(new.added_by, auth.uid())
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
