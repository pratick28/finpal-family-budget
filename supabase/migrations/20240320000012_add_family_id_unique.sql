-- Add unique constraint to family_id in profiles
ALTER TABLE profiles
ADD CONSTRAINT profiles_family_id_key UNIQUE (family_id);

-- Now we can add the foreign key reference
ALTER TABLE categories
ADD CONSTRAINT categories_family_id_fkey 
FOREIGN KEY (family_id) 
REFERENCES profiles(family_id) 
ON DELETE CASCADE; 