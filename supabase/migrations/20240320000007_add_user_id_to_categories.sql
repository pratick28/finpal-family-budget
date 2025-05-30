-- First add the column as nullable
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