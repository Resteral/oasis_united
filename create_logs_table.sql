CREATE TABLE IF NOT EXISTS public.debug_logs (
    id uuid default gen_random_uuid() primary key,
    source text not null,
    level text default 'info',
    message text,
    data jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.debug_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert/select (default is usually restrictive, but service role bypasses)
-- Allow authenticated users (dashboard) to read logs to debug
CREATE POLICY "Enable read access for all users" ON public.debug_logs FOR SELECT USING (true);
