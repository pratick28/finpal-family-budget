-- Drop account-related tables and their dependencies
DROP TABLE IF EXISTS account_members CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;

-- Remove account_id from transactions
ALTER TABLE transactions DROP COLUMN IF EXISTS account_id;

-- Remove account_id from categories
ALTER TABLE categories DROP COLUMN IF EXISTS account_id;

-- Remove account_id from budgets
ALTER TABLE budgets DROP COLUMN IF EXISTS account_id; 