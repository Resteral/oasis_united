-- Completion Script for Oasis United Regional Network
-- This script populates more towns and businesses to demonstrate a full decentralized ecosystem.

-- 1. Register More Towns
insert into public.towns (name, state, opened_by)
values
  ('Freedom', 'NH', 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321'),
  ('Ossipee', 'NH', 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321'),
  ('Tamworth', 'NH', 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321'),
  ('Sandwich', 'NH', 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321')
on conflict (name, state) do nothing;

-- 2. Map existing businesses to their town IDs (for the ones we just added or already have)
do $$
declare
  effingham_id uuid;
  freedom_id uuid;
  ossipee_id uuid;
  tamworth_id uuid;
  sandwich_id uuid;
begin
  -- Fetch/Ensure IDs
  select id into effingham_id from public.towns where name = 'Effingham' limit 1;
  select id into freedom_id from public.towns where name = 'Freedom' limit 1;
  select id into ossipee_id from public.towns where name = 'Ossipee' limit 1;
  select id into tamworth_id from public.towns where name = 'Tamworth' limit 1;
  select id into sandwich_id from public.towns where name = 'Sandwich' limit 1;

  -- 3. Add more Businesses to various towns
  
  -- FREEDOM
  insert into public.businesses (slug, name, category, location, town_id, onboarded_by, description)
  values 
    ('freedom-gallery', 'Village Art Gallery', 'Art & Decor', 'Freedom Village', freedom_id, 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321', 'Local NH artisan crafts and fine art pieces.'),
    ('berry-bay-supplies', 'Berry Bay Marina & Store', 'Outdoor & Grocery', 'Freedom', freedom_id, 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321', 'Lakeside supplies, bait, and quick bites.')
  on conflict (slug) do nothing;

  -- OSSIPEE
  insert into public.businesses (slug, name, category, location, town_id, onboarded_by, description)
  values 
    ('whittier-creek-cafe', 'Whittier Creek Cafe', 'Bistro', 'West Ossipee', ossipee_id, 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321', 'Organic coffee and mountainview breakfast.'),
    ('ossipee-mount-hardware', 'Ossipee Mountain Hardware', 'Hardware', 'Center Ossipee', ossipee_id, 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321', 'Generational hardware and home repair.')
  on conflict (slug) do nothing;

  -- TAMWORTH
  insert into public.businesses (slug, name, category, location, town_id, onboarded_by, description)
  values 
    ('tamworth-distilling', 'Tamworth Distilling', 'Spirits', 'Tamworth Village', tamworth_id, 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321', 'World-class wilderness spirits and botanicals.'),
    ('the-barnstormers', 'Barnstormers Theatre Shop', 'Gifts', 'Tamworth', tamworth_id, 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321', 'Curated theatrical gifts and local memorabilia.')
  on conflict (slug) do nothing;

  -- SANDWICH
  insert into public.businesses (slug, name, category, location, town_id, onboarded_by, description)
  values 
    ('tappan-chair', 'Tappan Chair Shop', 'Furniture', 'Center Sandwich', sandwich_id, 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321', 'Traditional NH handcrafted seating since 1819.'),
    ('sandwich-creamery', 'Sandwich Creamery', 'Dairy', 'Sandwich', sandwich_id, 'e5f6a7b8-d4c3-4b2a-a198-e7d6c5b4a321', 'Famous hidden-away farm fresh ice cream.')
  on conflict (slug) do nothing;

  -- Update original Effingham stores with their town_id
  update public.businesses set town_id = effingham_id where location like 'Effingham%' and town_id is null;

end $$;
