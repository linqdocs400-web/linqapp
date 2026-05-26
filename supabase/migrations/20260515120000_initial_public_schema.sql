-- Baseline public schema (matches supabase/schema/*.sql order).
-- If your remote project already has these objects, do not re-apply blindly: use
-- `supabase db pull` to align migration history, or squash / repair per Supabase docs.

-- Shared trigger helper (referenced by your table triggers).

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.hotspots (
  id uuid not null default gen_random_uuid (),
  name text not null,
  type text not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint hotspots_pkey primary key (id),
  constraint hotspots_name_type_key unique (name, type)
) tablespace pg_default;

create index if not exists idx_hotspots_type on public.hotspots using btree (type) tablespace pg_default;

create trigger trg_hotspots_set_updated_at
before update on public.hotspots
for each row
execute function public.set_updated_at ();

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

create table public.hotspot_members (
  id uuid not null default gen_random_uuid (),
  hotspot_id uuid not null,
  user_id uuid not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  role text null default 'member'::text,
  constraint hotspot_members_pkey primary key (id),
  constraint hotspot_members_hotspot_id_user_id_key unique (hotspot_id, user_id),
  constraint hotspot_members_hotspot_id_fkey foreign key (hotspot_id) references public.hotspots (id) on delete cascade,
  constraint hotspot_members_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
) tablespace pg_default;

create index if not exists idx_hotspot_members_user_id on public.hotspot_members using btree (user_id) tablespace pg_default;

create index if not exists idx_hotspot_members_hotspot_id on public.hotspot_members using btree (hotspot_id) tablespace pg_default;

create unique index if not exists hotspot_members_user_id_hotspot_id_key on public.hotspot_members using btree (user_id, hotspot_id) tablespace pg_default;

create trigger trg_hotspot_members_set_updated_at
before update on public.hotspot_members
for each row
execute function public.set_updated_at ();

create table public.profile_unlocks (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  unlocked_profile_id uuid null,
  created_at timestamp with time zone null default now(),
  constraint profile_unlocks_pkey primary key (id),
  constraint profile_unlocks_user_id_unlocked_profile_id_key unique (user_id, unlocked_profile_id),
  constraint profile_unlocks_unlocked_profile_id_fkey foreign key (unlocked_profile_id) references public.profiles (id) on delete cascade,
  constraint profile_unlocks_user_id_fkey foreign key (user_id) references public.profiles (id) on delete cascade
) tablespace pg_default;

create table public.ride_posts (
  id uuid not null default gen_random_uuid (),
  owner_id uuid null,
  ride_type text null,
  drop_location text null,
  vehicle_type text null,
  seats integer null,
  days text[] null,
  return_journey boolean null,
  return_time time without time zone null,
  journey_date date null,
  journey_time time without time zone null,
  created_at timestamp with time zone null default now (),
  pickup_lat double precision null,
  pickup_lon double precision null,
  drop_lat double precision null,
  drop_lon double precision null,
  pickup_location text null,
  status text null default 'active'::text,
  updated_at timestamp with time zone null default now (),
  constraint ride_posts_pkey primary key (id),
  constraint ride_posts_owner_id_fkey foreign key (owner_id) references public.profiles (id) on delete cascade
) tablespace pg_default;

create index if not exists idx_ride_posts_status on public.ride_posts using btree (status) tablespace pg_default;

create index if not exists idx_ride_posts_created_at on public.ride_posts using btree (created_at) tablespace pg_default;

create index if not exists idx_ride_posts_owner_id on public.ride_posts using btree (owner_id) tablespace pg_default;

create index if not exists idx_ride_posts_status_created on public.ride_posts using btree (status, created_at desc) tablespace pg_default;

create trigger trg_ride_posts_set_updated_at
before update on public.ride_posts
for each row
execute function public.set_updated_at ();

create table public.reviews (
  id uuid not null default gen_random_uuid (),
  ride_id uuid null,
  reviewer_id uuid not null,
  reviewed_user_id uuid not null,
  rating integer not null,
  review text null,
  created_at timestamp with time zone null default now (),
  updated_at timestamp with time zone null default now (),
  constraint reviews_pkey primary key (id),
  constraint reviews_ride_id_fkey foreign key (ride_id) references public.ride_posts (id) on delete set null,
  constraint reviews_rating_check check ((rating >= 1) and (rating <= 5)),
  constraint reviews_reviewer_reviewed_check check ((reviewer_id <> reviewed_user_id))
) tablespace pg_default;

create unique index if not exists uniq_reviews_reviewer_reviewed_user on public.reviews using btree (reviewer_id, reviewed_user_id) tablespace pg_default;

create index if not exists idx_reviews_reviewed_user_id on public.reviews using btree (reviewed_user_id) tablespace pg_default;

create index if not exists idx_reviews_reviewer_id on public.reviews using btree (reviewer_id) tablespace pg_default;

create unique index if not exists reviews_reviewer_reviewed_ride_uidx on public.reviews using btree (reviewer_id, reviewed_user_id, ride_id) tablespace pg_default;

create trigger trg_reviews_set_updated_at
before update on public.reviews
for each row
execute function public.set_updated_at ();

create table public.completed_rides (
  id uuid not null default gen_random_uuid (),
  ride_id uuid null,
  initiator_id uuid not null,
  created_at timestamp with time zone null default now (),
  updated_at timestamp with time zone null default now (),
  recipient_id uuid null,
  constraint completed_rides_pkey primary key (id),
  constraint completed_rides_ride_id_key unique (ride_id),
  constraint completed_rides_recipient_id_fkey foreign key (recipient_id) references public.profiles (id) on delete set null
) tablespace pg_default;

create index if not exists idx_completed_rides_initiator_id on public.completed_rides using btree (initiator_id) tablespace pg_default;

create index if not exists idx_completed_rides_recipient_id on public.completed_rides using btree (recipient_id) tablespace pg_default;

create trigger trg_completed_rides_set_updated_at
before update on public.completed_rides
for each row
execute function public.set_updated_at ();
