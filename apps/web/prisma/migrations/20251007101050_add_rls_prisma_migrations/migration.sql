-- ========================================
-- Enable RLS for _prisma_migrations table
-- ========================================

-- Enable Row Level Security on the _prisma_migrations table
ALTER TABLE _prisma_migrations ENABLE ROW LEVEL SECURITY;

-- Create a policy that only allows the service role to access this table
-- This ensures that only internal database operations can read/write to the migrations table
CREATE POLICY "Service role only access"
ON _prisma_migrations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Alternatively, if you want to be more restrictive and only allow postgres/superuser access:
-- CREATE POLICY "Superuser only access"
-- ON _prisma_migrations
-- FOR ALL
-- TO postgres
-- USING (true)
-- WITH CHECK (true);

-- Note: The _prisma_migrations table should only be accessed by:
-- 1. The service_role for migration operations
-- 2. Database admin/superuser for maintenance
-- Regular authenticated users should never have access to this table