-- Add theme customization and delivery settings to businesses
alter table public.businesses 
add column if not exists theme jsonb default '{"primaryColor": "#000000", "backgroundColor": "#ffffff"}'::jsonb,
add column if not exists delivery_settings jsonb default '{"radius": 5, "selfDelivery": false, "providers": []}'::jsonb;

-- Create Posts/Events table
create table if not exists public.posts (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) not null,
  type text check (type in ('post', 'event')) default 'post',
  title text,
  content text,
  image_url text,
  event_date timestamp with time zone, -- Only for events
  views integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Posts
alter table public.posts enable row level security;

-- Everyone can read posts
create policy "Posts are viewable by everyone." on public.posts for select using (true);

-- Only business owners can insert/update/delete their own posts
create policy "Owners can insert posts." on public.posts for insert with check (
  exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);

create policy "Owners can update posts." on public.posts for update using (
  exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);

create policy "Owners can delete posts." on public.posts for delete using (
  exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);
