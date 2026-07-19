-- ================================================================
-- RUSHNG - Database Initialization
-- ================================================================

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create database (if not exists)
SELECT 'CREATE DATABASE rushng_prod'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'rushng_prod');

-- Create user (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'rushng') THEN
        CREATE USER rushng WITH PASSWORD 'rushng123';
    END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE rushng_prod TO rushng;
GRANT ALL ON SCHEMA public TO rushng;

-- Connect to database
\c rushng_prod;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO rushng;
ALTER SCHEMA public OWNER TO rushng;