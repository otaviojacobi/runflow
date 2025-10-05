-- Enable RLS on _prisma_migrations table
ALTER TABLE _prisma_migrations ENABLE ROW LEVEL SECURITY;

-- Only service role can access _prisma_migrations
CREATE POLICY "Only service role can access migrations"
  ON _prisma_migrations
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
