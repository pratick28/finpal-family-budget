-- First, disable RLS temporarily to clean up
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.families DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view family members" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for registration" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own family" ON public.families;
DROP POLICY IF EXISTS "Family owners can update family" ON public.families;
DROP POLICY IF EXISTS "Enable insert for registration" ON public.families;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

-- Create new, simpler policies for profiles
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    family_id IN (
      SELECT family_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create new, simpler policies for families
CREATE POLICY "families_select_policy" ON public.families
  FOR SELECT USING (
    id IN (
      SELECT family_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "families_insert_policy" ON public.families
  FOR INSERT WITH CHECK (true);

CREATE POLICY "families_update_policy" ON public.families
  FOR UPDATE USING (
    id IN (
      SELECT family_id FROM public.profiles 
      WHERE id = auth.uid() AND role = 'owner'
    )
  ); 