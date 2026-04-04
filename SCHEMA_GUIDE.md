# 🗺️ Oasis United: Regional Registry Extension Guide

To scale the Oasis United trade network, you can extend the regional registry with new municipal nodes (tables). To maintain the high-density architecture of the platform, follow the standardized **Oasis Trade Protocol**.

---

## 1. 🏗️ The Anatomy of an Oasis Node (Table)
Every new table in the registry should follow a standardized municipal blueprint for absolute synchronization.

### Recommended Schema Blueprint:
```sql
create table if not exists public.[table_name] (
  id uuid default uuid_generate_v4() primary key,
  -- Foreign Keys (UUID-first)
  business_id uuid references public.businesses(id), 
  -- High-Density Metadata
  metadata jsonb default '{}'::jsonb, 
  status text check (status in ('active', 'pending', 'archived')) default 'active',
  -- Regional Synchronization
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

---

## 2. 🛡️ The RLS Sanitization Protocol
Before creating a new policy, you MUST ensure the deployment is idempotent by adding a "Clean Slate" check in the **Sanitization Block**.

### Step A: Update the Sanitization Block (Line ~165)
Add a drop check to the atomic `do $$ ... end $$` block in `comprehensive_discovery.sql`:
```sql
-- Inside the sanitization block
drop policy if exists "Everyone can view [node]" on public.[node];
drop policy if exists "Owners manage [node]" on public.[node];
```

### Step B: Allocate High-Resolution Policies
Add the new policies below the existing ones:
```sql
alter table public.[table_name] enable row level security;

create policy "Everyone can view [node]" on public.[node] for select using (true);
create policy "Owners manage [node]" on public.[node] for all using (
    exists (select 1 from public.businesses where id = business_id and owner_id = auth.uid())
);
```

---

## 3. ⚡ Autonomous Provisioning (Triggers)
If your new table needs to be automatically provisioned when a new business or town is opened, wire it into the **Onboarding Hub**.

**Example:** Automatically adding a default "Welcome Message" to a new business.
```sql
create or replace function public.[trigger_function]()
returns trigger as $$
begin
    insert into public.[new_table] (business_id, content)
    values (new.id, 'Welcome to the Oasis Union!');
    return new;
end;
$$ language plpgsql;

create trigger on_[node]_creation
after insert on public.businesses
for each row execute function public.[trigger_function]();
```

---

## 🚀 Pro Tips for Municipal Scaling
-   **Slug Matching:** When linking tables to businesses, always use UUID `id` for logic, but feel free to store a `slug` for discovery-ready URLs.
-   **JSONB Flexibility:** Use JSONB for non-standardized node metadata (e.g., specific store hours, unique fleet preferences) to keep the base schema clean.
-   **Registry Idempotency:** Always use `create table if not exists` and `alter table ... add column if not exists` to ensure the platform can be updated without data loss.

---

### Need to add a specific table now?
Tell me the **Node Name** (e.g., Review Registry, Fleet Loyalty, Municipal Vouchers) and I'll generate the high-density SQL for you!
