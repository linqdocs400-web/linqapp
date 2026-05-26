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
