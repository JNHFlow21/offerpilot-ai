alter table public.user_profiles
drop constraint if exists user_profiles_id_fkey;

alter table public.user_profiles
alter column id set default gen_random_uuid();
