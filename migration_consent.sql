-- Add sms_consent column to profiles if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'sms_consent') then
        alter table public.profiles add column sms_consent boolean default false;
    end if;
end $$;
