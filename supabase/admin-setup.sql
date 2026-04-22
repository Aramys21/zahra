-- ============================================
-- SETUP ADMIN ACCOUNT FOR ZAHRA DIFFUSION
-- ============================================
-- Run this in Supabase SQL Editor

-- Step 1: Create profiles table if not exists
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'user',
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 2: Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policies for profiles table
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Allow service role to manage all profiles
CREATE POLICY "Service role can manage all profiles"
    ON profiles FOR ALL
    USING (auth.role() = 'service_role');

-- Step 4: Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name',
            ''
        ),
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger to call the function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Function to update user role to admin
CREATE OR REPLACE FUNCTION public.set_user_as_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE profiles
    SET role = 'admin',
        updated_at = timezone('utc'::text, now())
    WHERE email = user_email;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USAGE INSTRUCTIONS
-- ============================================

-- METHOD 1: Update existing user to admin (RECOMMENDED)
-- First, create the user manually in Supabase Dashboard > Authentication
-- Then run this query:
-- SELECT public.set_user_as_admin('bouachar37@gmail.com');

-- METHOD 2: Direct SQL update
-- UPDATE profiles SET role = 'admin' WHERE email = 'bouachar37@gmail.com';

-- METHOD 3: Check if user is admin
-- SELECT * FROM profiles WHERE email = 'bouachar37@gmail.com';

-- ============================================
-- TO CREATE USER MANUALLY:
-- ============================================
-- 1. Go to Supabase Dashboard > Authentication
-- 2. Click "Add user" > "Create new user"
-- 3. Email: bouachar37@gmail.com
-- 4. Set your password manually
-- 5. Click "Create user"
-- 6. Then run: SELECT public.set_user_as_admin('bouachar37@gmail.com');
