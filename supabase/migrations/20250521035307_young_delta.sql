/*
  # Initial Schema Setup

  1. Tables Created
    - accounts: For managing family/home accounts
    - profiles: Extended user profile information
    - account_members: Links users to accounts with roles
    - categories: Transaction categories
    - transactions: Financial transactions
    - budget_categories: Monthly budget limits per category

  2. Security
    - Enabled RLS on all tables
    - Created policies for data access control
    - Added function to check account membership
    - Set up trigger for new user registration

  3. Features
    - Automatic account creation for new users
    - Role-based access control
    - Cascading deletes for related data
*/

-- Create table for accounts (homes)
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create a table for user profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT profiles_email_key UNIQUE (email)
);

-- Create account_members to link users to accounts with roles
CREATE TABLE public.account_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (account_id, user_id)
);

-- Create table for categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create table for transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create table for budget categories
CREATE TABLE public.budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  limit_amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (account_id, category_id, month)
);

-- Enable Row Level Security
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

-- Create a function to check if a user is a member of an account
CREATE OR REPLACE FUNCTION public.is_account_member(account_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.account_members
    WHERE account_id = account_uuid AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create policies for accounts
CREATE POLICY "Members can view accounts they belong to" 
  ON public.accounts FOR SELECT 
  USING (public.is_account_member(id, auth.uid()));

-- Create policies for account_members
CREATE POLICY "Members can view account memberships they belong to" 
  ON public.account_members FOR SELECT 
  USING (user_id = auth.uid() OR public.is_account_member(account_id, auth.uid()));

-- Create policies for categories
CREATE POLICY "Members can view categories of accounts they belong to" 
  ON public.categories FOR SELECT 
  USING (public.is_account_member(account_id, auth.uid()));

-- Create policies for transactions
CREATE POLICY "Members can view transactions of accounts they belong to" 
  ON public.transactions FOR SELECT 
  USING (public.is_account_member(account_id, auth.uid()));

CREATE POLICY "Members can insert transactions to accounts they belong to" 
  ON public.transactions FOR INSERT 
  WITH CHECK (public.is_account_member(account_id, auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Members can update transactions of accounts they belong to" 
  ON public.transactions FOR UPDATE 
  USING (public.is_account_member(account_id, auth.uid()));

CREATE POLICY "Members can delete transactions of accounts they belong to" 
  ON public.transactions FOR DELETE 
  USING (public.is_account_member(account_id, auth.uid()));

-- Create policies for budget_categories
CREATE POLICY "Members can view budgets of accounts they belong to" 
  ON public.budget_categories FOR SELECT 
  USING (public.is_account_member(account_id, auth.uid()));

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (new.id, new.email, '', '');

  -- Create a default account for new user
  WITH new_account AS (
    INSERT INTO public.accounts (name)
    VALUES ('My Account')
    RETURNING id
  )
  INSERT INTO public.account_members (account_id, user_id, role)
  SELECT id, new.id, 'owner'
  FROM new_account;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();