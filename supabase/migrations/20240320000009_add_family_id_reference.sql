-- First add the family_id column
ALTER TABLE categories
ADD COLUMN family_id UUID;

-- Update existing categories to use the owner's family_id
UPDATE categories c
SET family_id = p.family_id
FROM profiles p
WHERE c.user_id = p.id;

-- Make family_id NOT NULL after populating values
ALTER TABLE categories
ALTER COLUMN family_id SET NOT NULL;

-- Now add the foreign key reference to family_id in profiles
ALTER TABLE categories
ADD CONSTRAINT categories_family_id_fkey 
FOREIGN KEY (family_id) 
REFERENCES profiles(family_id) 
ON DELETE CASCADE; 