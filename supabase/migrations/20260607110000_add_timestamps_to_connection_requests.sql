-- Add accepted_at and rejected_at timestamps to connection_requests
-- These will track when requests are accepted or rejected

ALTER TABLE connection_requests
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE connection_requests
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;
