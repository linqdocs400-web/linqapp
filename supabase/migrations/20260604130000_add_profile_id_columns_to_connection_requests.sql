-- Add profile_id columns to connection_requests for proper joins
-- These columns reference the profiles table instead of auth.users
-- This allows proper Supabase relationship joins in queries

ALTER TABLE connection_requests
ADD COLUMN IF NOT EXISTS sender_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE connection_requests
ADD COLUMN IF NOT EXISTS receiver_profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_connection_requests_sender_profile_id ON connection_requests(sender_profile_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_receiver_profile_id ON connection_requests(receiver_profile_id);
