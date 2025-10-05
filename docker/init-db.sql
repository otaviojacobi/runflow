-- Create auth schema for GoTrue
CREATE SCHEMA IF NOT EXISTS auth;

-- Grant permissions
GRANT ALL ON SCHEMA auth TO postgres;
GRANT ALL ON SCHEMA public TO postgres;
