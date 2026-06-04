-- Create unlocked_profiles table
CREATE TABLE IF NOT EXISTS unlocked_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  request_id UUID REFERENCES connection_requests(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, profile_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_unlocked_profiles_user_id ON unlocked_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_profiles_profile_id ON unlocked_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_unlocked_profiles_request_id ON unlocked_profiles(request_id);

-- Enable RLS
ALTER TABLE unlocked_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own unlocked profiles
CREATE POLICY "Users can view their own unlocked profiles"
  ON unlocked_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert unlocked profiles (triggered by request acceptance)
CREATE POLICY "Users can insert unlocked profiles"
  ON unlocked_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own unlocked profiles
CREATE POLICY "Users can delete their own unlocked profiles"
  ON unlocked_profiles FOR DELETE
  USING (auth.uid() = user_id);
