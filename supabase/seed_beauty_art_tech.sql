-- Seed Data for Beauty, Art, and Tech categories
-- These businesses will populate the marketplace tabs

-- 1. Get a placeholder owner_id (using the first profile in the system if possible, or just a dummy)
-- For a real environment, we'd use a known UUID, but for the seed, we'll assume the system has at least one profile.

BEGIN;

-- Insert Beauty Business
INSERT INTO businesses (name, slug, category, description, location, is_featured, store_features, theme)
VALUES (
    'Summit Apothecary', 
    'summit-apothecary', 
    'Beauty', 
    'Handcrafted organic skincare and essential oils from the mountain peaks.', 
    'Effingham', 
    true, 
    '{"wifi": true, "last_updated": "2026-04-03"}',
    '{"primaryColor": "#6d28d9", "backgroundColor": "#fdf4ff"}'
) ON CONFLICT (slug) DO NOTHING;

-- Insert Art Business
INSERT INTO businesses (name, slug, category, description, location, is_featured, store_features, theme)
VALUES (
    'Pine Hollow Gallery', 
    'pine-hollow-gallery', 
    'Art', 
    'Local landscape oil paintings and custom ceramic pottery from the Lakes Region.', 
    'Freedom', 
    true, 
    '{"seating": {"type": "Booth", "capacity": 12}, "wifi": true}',
    '{"primaryColor": "#b45309", "backgroundColor": "#fffbeb"}'
) ON CONFLICT (slug) DO NOTHING;

-- Insert Tech Business
INSERT INTO businesses (name, slug, category, description, location, is_featured, store_features, theme)
VALUES (
    'Oasis Tech Lab', 
    'oasis-tech-lab', 
    'Tech', 
    'Your regional hub for custom devices, solar solutions, and precision repairs.', 
    'Ossipee', 
    true, 
    '{"wifi": true, "last_updated": "2026-04-03"}',
    '{"primaryColor": "#2563eb", "backgroundColor": "#f8fafc"}'
) ON CONFLICT (slug) DO NOTHING;

-- Insert Products for Beauty
INSERT INTO products (business_id, name, description, price, is_featured, category)
SELECT id, 'Cedar Peak Beard Oil', 'Organic mountain cedar scent.', 18.50, true, 'Beauty' FROM businesses WHERE slug = 'summit-apothecary'
ON CONFLICT DO NOTHING;

INSERT INTO products (business_id, name, description, price, is_featured, category)
SELECT id, 'Alpine Glow Moisturizer', 'Day serum for high-altitude skin care.', 24.00, true, 'Beauty' FROM businesses WHERE slug = 'summit-apothecary'
ON CONFLICT DO NOTHING;

-- Insert Products for Art
INSERT INTO products (business_id, name, description, price, is_featured, category)
SELECT id, 'Ossipee Sunset Oil Paint', 'Original 12x18 oil on canvas.', 125.00, true, 'Art' FROM businesses WHERE slug = 'pine-hollow-gallery'
ON CONFLICT DO NOTHING;

INSERT INTO products (business_id, name, description, price, is_featured, category)
SELECT id, 'Hand-thrown Forest Mug', 'Ceramic mug with local moss glaze.', 32.00, true, 'Art' FROM businesses WHERE slug = 'pine-hollow-gallery'
ON CONFLICT DO NOTHING;

-- Insert Products for Tech
INSERT INTO products (business_id, name, description, price, is_featured, category)
SELECT id, 'Oasis Solar Charger v2', 'Rugged portable power for offnd-grid discovery.', 65.00, true, 'Tech' FROM businesses WHERE slug = 'oasis-tech-lab'
ON CONFLICT DO NOTHING;

INSERT INTO products (business_id, name, description, price, is_featured, category)
SELECT id, 'Precision Tablet Refurb', 'Refurbished 10-inch Oasis Slate.', 185.00, true, 'Tech' FROM businesses WHERE slug = 'oasis-tech-lab'
ON CONFLICT DO NOTHING;

COMMIT;
