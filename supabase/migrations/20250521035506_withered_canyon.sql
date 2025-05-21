/*
  # Initial Schema Setup

  1. Tables
    - accounts: Store household/family accounts
    - profiles: User profile information
    - account_members: Link users to accounts with roles
    - categories: Transaction categories
    - transactions: Financial transactions
    - budget_categories: Monthly budget limits per category

  2. Security
    - Enable RLS on all tables
    - Create policies for data access
    - Setup trigger for new user registration
*/

-- Create tables if they don't exist
DO $$ 
BEGIN

-- Create table for accounts (homes)
IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'accounts') THEN
  CREATE TABLE public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
  );
END IF;

-- Create a table for user profiles
IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
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
END IF;

-- Create account_members to link users to accounts with roles
IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'account_members') THEN
  CREATE TABLE public.account_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE (account_id, user_id)
  );
END IF;

-- Create table for categories
IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
  CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
  );
END IF;

-- Create table for transactions
IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transactions') THEN
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
END IF;

-- Create table for budget categories
IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'budget_categories') THEN
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
END IF;

END $$;

-- Enable Row Level Security (idempotent operations)
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

-- Create or replace function to check if a user is a member of an account
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

-- Drop existing policies if they exist and create new ones
DO $$ 
BEGIN
  -- Profiles policies
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  
  CREATE POLICY "Users can view their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

  CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

  -- Accounts policies
  DROP POLICY IF EXISTS "Members can view accounts they belong to" ON public.accounts;
  
  CREATE POLICY "Members can view accounts they belong to" 
    ON public.accounts FOR SELECT 
    USING (public.is_account_member(id, auth.uid()));

  -- Account members policies
  DROP POLICY IF EXISTS "Members can view account memberships they belong to" ON public.account_members;
  
  CREATE POLICY "Members can view account memberships they belong to" 
    ON public.account_members FOR SELECT 
    USING (user_id = auth.uid() OR public.is_account_member(account_id, auth.uid()));

  -- Categories policies
  DROP POLICY IF EXISTS "Members can view categories of accounts they belong to" ON public.categories;
  
  CREATE POLICY "Members can view categories of accounts they belong to" 
    ON public.categories FOR SELECT 
    USING (public.is_account_member(account_id, auth.uid()));

  -- Transactions policies
  DROP POLICY IF EXISTS "Members can view transactions of accounts they belong to" ON public.transactions;
  DROP POLICY IF EXISTS "Members can insert transactions to accounts they belong to" ON public.transactions;
  DROP POLICY IF EXISTS "Members can update transactions of accounts they belong to" ON public.transactions;
  DROP POLICY IF EXISTS "Members can delete transactions of accounts they belong to" ON public.transactions;
  
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

  -- Budget categories policies
  DROP POLICY IF EXISTS "Members can view budgets of accounts they belong to" ON public.budget_categories;
  
  CREATE POLICY "Members can view budgets of accounts they belong to" 
    ON public.budget_categories FOR SELECT 
    USING (public.is_account_member(account_id, auth.uid()));
END $$;

-- Create or replace function to handle new user signups
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

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();