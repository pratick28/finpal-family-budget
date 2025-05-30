-- Add family_id to budget_categories
ALTER TABLE budget_categories
ADD COLUMN family_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE;

-- Update existing budget_categories to use the owner's family_id
UPDATE budget_categories bc
SET family_id = p.family_id
FROM profiles p
WHERE bc.user_id = p.id;

-- Remove account_id from budget_categories
ALTER TABLE budget_categories DROP COLUMN IF EXISTS account_id;

-- Update unique constraint
ALTER TABLE budget_categories DROP CONSTRAINT IF EXISTS budget_categories_account_id_category_id_month_key;
ALTER TABLE budget_categories ADD CONSTRAINT budget_categories_family_id_category_id_month_key UNIQUE (family_id, category_id, month); 