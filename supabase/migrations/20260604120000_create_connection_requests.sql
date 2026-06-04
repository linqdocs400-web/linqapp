-- Create connection_requests table
CREATE TABLE IF NOT EXISTS connection_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ride_id UUID REFERENCES ride_posts(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(sender_id, receiver_id, ride_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_connection_requests_receiver_status ON connection_requests(receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_connection_requests_sender_status ON connection_requests(sender_id, status);
CREATE INDEX IF NOT EXISTS idx_connection_requests_ride_id ON connection_requests(ride_id);

-- Enable RLS
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own sent requests
CREATE POLICY "Users can view their own sent requests"
  ON connection_requests FOR SELECT
  USING (auth.uid() = sender_id);

-- Users can view their own received requests
CREATE POLICY "Users can view their own received requests"
  ON connection_requests FOR SELECT
  USING (auth.uid() = receiver_id);

-- Users can create requests (as sender)
CREATE POLICY "Users can create requests"
  ON connection_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Users can update requests (as receiver to accept/reject)
CREATE POLICY "Users can update received requests"
  ON connection_requests FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Users can delete their own requests
CREATE POLICY "Users can delete their own requests"
  ON connection_requests FOR DELETE
  USING (auth.uid() = sender_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_connection_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_connection_requests_updated_at_trigger
  BEFORE UPDATE ON connection_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_connection_requests_updated_at();
