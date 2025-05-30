-- Add foreign key constraint to link transactions.user_id to profiles.id
ALTER TABLE transactions
ADD CONSTRAINT fk_transactions_user_id
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE; 