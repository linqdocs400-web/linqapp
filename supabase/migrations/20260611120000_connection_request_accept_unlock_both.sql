-- When a connection request is accepted, unlock both users' profiles for each other.
CREATE OR REPLACE FUNCTION public.handle_connection_request_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS DISTINCT FROM 'accepted') THEN
    INSERT INTO public.unlocked_profiles (user_id, profile_id, request_id)
    VALUES (NEW.sender_id, NEW.receiver_id, NEW.id)
    ON CONFLICT (user_id, profile_id) DO NOTHING;

    INSERT INTO public.unlocked_profiles (user_id, profile_id, request_id)
    VALUES (NEW.receiver_id, NEW.sender_id, NEW.id)
    ON CONFLICT (user_id, profile_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_connection_request_accepted ON public.connection_requests;

CREATE TRIGGER on_connection_request_accepted
  AFTER UPDATE ON public.connection_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_connection_request_accepted();
