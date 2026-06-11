-- Ensure connection_requests and unlocked_profiles are accessible via the Supabase API.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.connection_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.unlocked_profiles TO authenticated;
