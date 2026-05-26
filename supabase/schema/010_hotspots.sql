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
