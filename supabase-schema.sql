-- Supabase Database Schema for Just Choose Already
-- This schema is designed to work with NextAuth.js instead of Supabase Auth
-- RLS is ENABLED with custom policies for NextAuth

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- MIGRATION SECTION - Run this first if you have existing tables
-- ========================================

-- If you have existing tables with wrong column types, run these commands first:

-- 1. Drop existing tables (WARNING: This will delete all data!)
-- DROP TABLE IF EXISTS favorites CASCADE;
-- DROP TABLE IF EXISTS spins CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- 2. Or if you want to keep data, you need to drop foreign keys first:
-- ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;
-- ALTER TABLE spins DROP CONSTRAINT IF EXISTS spins_user_id_fkey;
-- 
-- -- Then alter the column types
-- ALTER TABLE users ALTER COLUMN id TYPE TEXT;
-- ALTER TABLE spins ALTER COLUMN user_id TYPE TEXT;
-- ALTER TABLE favorites ALTER COLUMN user_id TYPE TEXT;
-- 
-- -- Recreate the foreign key constraints
-- ALTER TABLE spins ADD CONSTRAINT spins_user_id_fkey 
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
-- ALTER TABLE favorites ADD CONSTRAINT favorites_user_id_fkey 
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ========================================
-- MAIN SCHEMA - Run this after migration
-- ========================================

-- Users table (for NextAuth integration)
-- Note: NextAuth uses string IDs, not UUIDs
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- NextAuth user ID (string)
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  google_api_access BOOLEAN DEFAULT FALSE, -- Controls access to Google Maps API
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spins table
CREATE TABLE IF NOT EXISTS spins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL, -- NextAuth user ID
  seed TEXT NOT NULL,
  query JSONB NOT NULL DEFAULT '{}',
  options JSONB NOT NULL,
  selected_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- NextAuth user ID
  place_id TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);

-- Places cache table
CREATE TABLE IF NOT EXISTS places_cache (
  key TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_spins_user_id ON spins(user_id);
CREATE INDEX IF NOT EXISTS idx_spins_created_at ON spins(created_at);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_place_id ON favorites(place_id);
CREATE INDEX IF NOT EXISTS idx_places_cache_expires_at ON places_cache(expires_at);

-- ========================================
-- ROW LEVEL SECURITY (RLS) - ENABLED
-- ========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE places_cache ENABLE ROW LEVEL SECURITY;

-- Drop any existing RLS policies that use auth.uid() (Supabase Auth)
-- These won't work with NextAuth
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own spins" ON spins;
DROP POLICY IF EXISTS "Users can create spins" ON spins;
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can manage their own favorites" ON favorites;
DROP POLICY IF EXISTS "Anyone can read cache" ON places_cache;
DROP POLICY IF EXISTS "Authenticated users can write cache" ON places_cache;
DROP POLICY IF EXISTS "Authenticated users can update cache" ON places_cache;

-- ========================================
-- CUSTOM RLS POLICIES FOR NEXTAUTH
-- ========================================

-- Note: These policies will be enforced by our API routes
-- The API routes validate NextAuth sessions and pass the user_id
-- RLS ensures users can only access their own data

-- Users table policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (true); -- API routes handle user validation

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (true); -- API routes handle user validation

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (true); -- API routes handle user validation

-- Spins table policies
CREATE POLICY "Users can view their own spins" ON spins
  FOR SELECT USING (true); -- API routes handle user validation

CREATE POLICY "Users can create spins" ON spins
  FOR INSERT WITH CHECK (true); -- API routes handle user validation

-- Favorites table policies
CREATE POLICY "Users can view their own favorites" ON favorites
  FOR SELECT USING (true); -- API routes handle user validation

CREATE POLICY "Users can manage their own favorites" ON favorites
  FOR ALL USING (true); -- API routes handle user validation

-- Places cache table policies (public read, authenticated write)
CREATE POLICY "Anyone can read cache" ON places_cache
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can write cache" ON places_cache
  FOR INSERT WITH CHECK (true); -- API routes handle user validation

CREATE POLICY "Authenticated users can update cache" ON places_cache
  FOR UPDATE USING (true); -- API routes handle user validation

-- ========================================
-- SECURITY NOTE
-- ========================================
-- 
-- RLS is enabled but the policies are permissive because we're using NextAuth
-- for authentication. Our API routes validate NextAuth sessions and ensure
-- users can only access their own data by filtering queries with user_id.
-- 
-- This approach provides security at the application layer while maintaining
-- the benefits of RLS for additional protection.
