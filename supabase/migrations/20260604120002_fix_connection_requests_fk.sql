-- Fix foreign keys for connection_requests to point to public.profiles instead of auth.users
-- This allows PostgREST to automatically join profiles tables when queried

ALTER TABLE connection_requests
  DROP CONSTRAINT IF EXISTS connection_requests_sender_id_fkey,
  ADD CONSTRAINT connection_requests_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE connection_requests
  DROP CONSTRAINT IF EXISTS connection_requests_receiver_id_fkey,
  ADD CONSTRAINT connection_requests_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE unlocked_profiles
  DROP CONSTRAINT IF EXISTS unlocked_profiles_user_id_fkey,
  ADD CONSTRAINT unlocked_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Note: unlocked_profiles.profile_id already references profiles(id)
