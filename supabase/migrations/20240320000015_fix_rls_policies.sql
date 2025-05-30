-- Drop existing policies
DROP POLICY IF EXISTS "Users can view family members" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profiles" ON public.profiles;

-- Create new policies for profiles
CREATE POLICY "Users can view family members" ON public.profiles
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Allow profile creation during registration
CREATE POLICY "Enable insert for registration" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Drop existing policies for families
DROP POLICY IF EXISTS "Users can view their own family" ON public.families;
DROP POLICY IF EXISTS "Family owners can update family" ON public.families;

-- Create new policies for families
CREATE POLICY "Users can view their own family" ON public.families
  FOR SELECT USING (
    id IN (
      SELECT family_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Family owners can update family" ON public.families
  FOR UPDATE USING (
    id IN (
      SELECT family_id FROM public.profiles 
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- Allow family creation during registration
CREATE POLICY "Enable insert for registration" ON public.families
  FOR INSERT WITH CHECK (true); 