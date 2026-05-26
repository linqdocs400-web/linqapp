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
