-- 💾 Super Admin Permissions & Profiles Update
-- This migration fixes the 0 counts and empty organization screen for the Super Admin.

-- 1. Add created_at to profiles if missing
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Update existing profiles with a reasonable created_at (if it was NULL)
-- We can use the information from auth.users if available, but for now just ensure NOT NULL.
UPDATE public.profiles SET created_at = NOW() WHERE created_at IS NULL;

-- 3. RLS Bypasses for Super Admin (ayibakep@gmail.com)
-- We use a policy that checks the authenticated user's email.

-- Organizations
DROP POLICY IF EXISTS "super_admin_orgs_select" ON public.organizations;
CREATE POLICY "super_admin_orgs_select" ON public.organizations
    FOR SELECT USING (
        auth.jwt() ->> 'email' = 'ayibakep@gmail.com'
    );

-- Org Members
DROP POLICY IF EXISTS "super_admin_members_select" ON public.org_members;
CREATE POLICY "super_admin_members_select" ON public.org_members
    FOR SELECT USING (
        auth.jwt() ->> 'email' = 'ayibakep@gmail.com'
    );

-- Goals
DROP POLICY IF EXISTS "super_admin_goals_select" ON public.goals;
CREATE POLICY "super_admin_goals_select" ON public.goals
    FOR SELECT USING (
        auth.jwt() ->> 'email' = 'ayibakep@gmail.com'
    );

-- Profiles
DROP POLICY IF EXISTS "super_admin_profiles_select" ON public.profiles;
CREATE POLICY "super_admin_profiles_select" ON public.profiles
    FOR SELECT USING (
        auth.jwt() ->> 'email' = 'ayibakep@gmail.com'
    );

-- Payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "super_admin_payments_select" ON public.payments;
CREATE POLICY "super_admin_payments_select" ON public.payments
    FOR SELECT USING (
        auth.jwt() ->> 'email' = 'ayibakep@gmail.com'
    );

-- 4. Fix get_my_org_ids to be even more robust (if needed)
-- (Already looks good in schema.sql, but super admin doesn't need it if we have the policies above)
