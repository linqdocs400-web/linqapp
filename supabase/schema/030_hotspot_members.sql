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

-- Enable RLS
alter table public.hotspot_members enable row level security;

-- Create policy: Users can view hotspot memberships
create policy "Users can view hotspot memberships"
on public.hotspot_members for select
using (true);

-- Create policy: Users can insert their own hotspot memberships
create policy "Users can insert their own hotspot memberships"
on public.hotspot_members for insert
with check (auth.uid() = user_id);

-- Create policy: Users can update their own hotspot memberships
create policy "Users can update their own hotspot memberships"
on public.hotspot_members for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Create policy: Users can delete their own hotspot memberships
create policy "Users can delete their own hotspot memberships"
on public.hotspot_members for delete
using (auth.uid() = user_id);
