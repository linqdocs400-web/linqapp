create table public.profiles (
  id uuid not null,
  name text null,
  email text null,
  phone text null,
  gender text null,
  bio text null,
  connect_method text null,
  connect_id text null,
  emergency_name text null,
  emergency_phone text null,
  plan text null default 'free'::text,
  plan_expiry timestamp with time zone null,
  ever_paid boolean not null default false,
  active_days date[] null default '{}'::date[],
  created_at timestamp with time zone null default now(),
  unlocked_ids text[] null default '{}'::text[],
  updated_at timestamp with time zone null default now(),
  primary_hotspot_id uuid null,
  constraint profiles_pkey primary key (id),
  constraint profiles_email_key unique (email),
  constraint profiles_id_fkey foreign key (id) references auth.users (id),
  constraint profiles_primary_hotspot_id_fkey foreign key (primary_hotspot_id) references public.hotspots (id) deferrable
) tablespace pg_default;

create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at ();

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policy: Users can view all profiles
create policy "Users can view all profiles"
on public.profiles for select
using (true);

-- Create policy: Users can insert their own profile
create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

-- Create policy: Users can update their own profile
create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Create policy: Users can delete their own profile
create policy "Users can delete their own profile"
on public.profiles for delete
using (auth.uid() = id);
