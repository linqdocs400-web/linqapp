-- Add RLS policies to profiles table
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

-- Add RLS policies to hotspot_members table
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
