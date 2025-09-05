-- Fix RLS policies for public widget viewing
-- This ensures that anonymous users can view public widgets

-- Drop existing select policy for widgets if exists
DROP POLICY IF EXISTS "Public widgets are viewable by everyone" ON widgets;

-- Create new policy that allows anyone (including anonymous users) to view public widgets
CREATE POLICY "Public widgets are viewable by everyone" 
ON widgets FOR SELECT 
USING (is_public = true);

-- Make sure RLS is enabled
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;

-- Also ensure profiles can be read when joining
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Test query to verify widgets are accessible
-- Run this after applying the policies
SELECT COUNT(*) as total_public_widgets 
FROM widgets 
WHERE is_public = true;