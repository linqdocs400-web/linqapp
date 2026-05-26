-- Add institution_hotspot_id foreign key to profiles table
alter table public.profiles
add column institution_hotspot_id uuid null;

-- Add foreign key constraint
alter table public.profiles
add constraint profiles_institution_hotspot_id_fkey
foreign key (institution_hotspot_id)
references public.hotspots (id)
deferrable;

-- Add index for better query performance
create index if not exists idx_profiles_institution_hotspot_id
on public.profiles using btree (institution_hotspot_id)
tablespace pg_default;
