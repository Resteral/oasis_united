-- Create conversations table to group messages
create table if not exists public.conversations (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) not null,
  platform text not null check (platform in ('facebook', 'instagram', 'whatsapp')),
  external_id text not null, -- The PSID or User ID on the external platform
  customer_name text, -- Cache name for display
  last_message_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure unique conversation per user per platform per business
  unique(business_id, platform, external_id)
);

-- Enable RLS on conversations
alter table public.conversations enable row level security;

create policy "Owners can view their conversations." on public.conversations for select using (
  exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);

-- Re-create messages table to link to conversations (or update existing if preferable, but fresh start is cleaner for this feature)
-- We will modify the existing messages table if it exists, or create new one. 
-- Looking at schema.sql, messages table exists but is basic. We'll enhance it.

-- First, add columns to existing messages table if they don't exist, or create new if not present.
-- It's safer to drop/recreate if it's not heavily used, but we'll assume we should alter.
-- Actually, let's just make sure it has what we need.

alter table public.messages add column if not exists conversation_id uuid references public.conversations(id);
alter table public.messages add column if not exists external_id text; -- Message ID from platform

-- Update existing messaging table constraints if needed
-- (The existing table in schema.sql has 'business_id', 'customer_contact', 'channel', 'direction', 'content')
-- We should make 'conversation_id' preferred over just 'business_id' + 'customer_contact' linkage for threading.

-- Index for fast lookup of conversation history
create index if not exists idx_messages_conversation on public.messages(conversation_id);
