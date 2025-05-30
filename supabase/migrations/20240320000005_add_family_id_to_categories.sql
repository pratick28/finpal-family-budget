-- Add family_id to categories
ALTER TABLE categories
ADD COLUMN family_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE;

-- Update existing categories to use the owner's family_id
UPDATE categories c
SET family_id = p.family_id
FROM profiles p
WHERE c.user_id = p.id; 