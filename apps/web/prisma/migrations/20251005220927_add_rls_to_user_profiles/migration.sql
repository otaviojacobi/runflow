-- Enable Row Level Security on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Policy: Service role can do everything (for API routes)
CREATE POLICY "Service role has full access"
  ON user_profiles
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Policy: Allow insert during registration (service role only)
CREATE POLICY "Service role can insert profiles"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');