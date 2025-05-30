-- Create function to get family members
CREATE OR REPLACE FUNCTION get_family_members(family_id UUID)
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM profiles WHERE profiles.family_id = family_id;
$$; 