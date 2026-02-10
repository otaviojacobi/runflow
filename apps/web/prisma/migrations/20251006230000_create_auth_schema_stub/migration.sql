-- CreateSupabaseStubs
-- This migration creates stubs for Supabase-specific schemas, roles, and functions
-- that don't exist in Prisma's shadow database. Without these stubs, any migration
-- referencing auth.uid() or service_role (e.g., RLS policies) will fail during
-- `prisma migrate dev` because the shadow database doesn't have them.
--
-- On a real Supabase database, these already exist, so we use IF NOT EXISTS / OR REPLACE
-- to safely skip creation when running against the actual database.

-- Create the auth schema (used by Supabase Auth)
CREATE SCHEMA IF NOT EXISTS auth;

-- Create the auth.uid() function (returns the current user's UUID from JWT)
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT
    COALESCE(
      current_setting('request.jwt.claim.sub', true),
      (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
    )::uuid
$$;

-- Create the service_role (used by Supabase for elevated access)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN;
  END IF;
END
$$;

-- Create the _prisma_migrations table if it doesn't exist.
-- On the real database, Prisma creates this table before running migrations.
-- On Prisma's shadow database, this table does NOT exist because the shadow DB
-- only replays migration SQL files. Without this, any migration that references
-- _prisma_migrations (e.g., enabling RLS on it) will fail on the shadow DB.
CREATE TABLE IF NOT EXISTS _prisma_migrations (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  checksum VARCHAR(64) NOT NULL,
  finished_at TIMESTAMPTZ,
  migration_name VARCHAR(255) NOT NULL,
  logs TEXT,
  rolled_back_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  applied_steps_count INTEGER NOT NULL DEFAULT 0
);
