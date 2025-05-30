-- Temporarily disable RLS for the migration
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Add user_id to categories
ALTER TABLE categories
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing categories to use the owner's user_id
UPDATE categories c
SET user_id = p.id
FROM profiles p
WHERE c.family_id = p.family_id;

-- Now make it NOT NULL after we've populated the values
ALTER TABLE categories
ALTER COLUMN user_id SET NOT NULL;

-- Add unique constraint for user_id and name
ALTER TABLE categories ADD CONSTRAINT categories_user_id_name_key UNIQUE (user_id, name);

-- Re-enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their family's categories" ON categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;

-- Create new policies
CREATE POLICY "Users can view their family's categories"
ON categories FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.family_id = categories.family_id
  )
);

CREATE POLICY "Users can insert their own categories"
ON categories FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.family_id = categories.family_id
  )
);

CREATE POLICY "Users can update their own categories"
ON categories FOR UPDATE
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.family_id = categories.family_id
  )
);

CREATE POLICY "Users can delete their own categories"
ON categories FOR DELETE
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.family_id = categories.family_id
  )
); 