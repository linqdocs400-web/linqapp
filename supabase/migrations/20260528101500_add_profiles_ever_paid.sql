alter table public.profiles
add column if not exists ever_paid boolean not null default false;

