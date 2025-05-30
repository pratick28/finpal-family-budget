-- Drop existing policies
DROP POLICY IF EXISTS "Members can delete transactions of accounts they belong to" ON transactions;
DROP POLICY IF EXISTS "Members can insert transactions to accounts they belong to" ON transactions;
DROP POLICY IF EXISTS "Members can update transactions of accounts they belong to" ON transactions;
DROP POLICY IF EXISTS "Members can view transactions of accounts they belong to" ON transactions;

-- Create new policies based on family_id
CREATE POLICY "Family members can delete transactions"
    ON transactions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.family_id = (
                SELECT family_id FROM profiles
                WHERE id = transactions.user_id
            )
        )
    );

CREATE POLICY "Family members can insert transactions"
    ON transactions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.family_id = (
                SELECT family_id FROM profiles
                WHERE id = transactions.user_id
            )
        )
    );

CREATE POLICY "Family members can update transactions"
    ON transactions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.family_id = (
                SELECT family_id FROM profiles
                WHERE id = transactions.user_id
            )
        )
    );

CREATE POLICY "Family members can view transactions"
    ON transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.family_id = (
                SELECT family_id FROM profiles
                WHERE id = transactions.user_id
            )
        )
    ); 