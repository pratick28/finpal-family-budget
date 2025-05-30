-- Drop existing family_id column if it exists
ALTER TABLE profiles DROP COLUMN IF EXISTS family_id;

-- Add family columns to profiles table
ALTER TABLE profiles 
ADD COLUMN family_id UUID,
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'member')),
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active'));

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable insert for service role" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile and family members" ON profiles;
DROP POLICY IF EXISTS "Users can view family members" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Allow profile creation (needed for signup)
CREATE POLICY "Allow profile creation"
    ON profiles FOR INSERT
    WITH CHECK (true);

-- Update existing profiles to be owners
UPDATE profiles 
SET family_id = id 
WHERE family_id IS NULL; 