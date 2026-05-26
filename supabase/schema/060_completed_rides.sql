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

-- Original export had two btree indexes on initiator_id; one is sufficient.
create index if not exists idx_completed_rides_initiator_id on public.completed_rides using btree (initiator_id) tablespace pg_default;

create index if not exists idx_completed_rides_recipient_id on public.completed_rides using btree (recipient_id) tablespace pg_default;

create trigger trg_completed_rides_set_updated_at
before update on public.completed_rides
for each row
execute function public.set_updated_at ();
