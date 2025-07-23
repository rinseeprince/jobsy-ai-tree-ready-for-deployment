-- Simple user_roles RLS policy that avoids infinite recursion
-- This approach uses a separate admin check or allows all authenticated users to view

-- Drop all existing policies on user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;

-- Disable RLS temporarily to clean up
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Option 1: Simple policy - allow authenticated users to view their own roles
-- This is the safest approach that won't cause recursion
CREATE POLICY "Users can view their own roles" ON user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Option 2: Allow all authenticated users to view all roles
-- This is less secure but avoids recursion issues
-- Uncomment the line below if you want this approach instead
-- CREATE POLICY "Authenticated users can view all roles" ON user_roles
--     FOR SELECT
--     USING (auth.uid() IS NOT NULL);

-- For now, let's use Option 1 (users can only see their own roles)
-- Admin functionality will be handled in the application layer

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_roles';

-- Test that the policy works without recursion
SELECT COUNT(*) FROM user_roles LIMIT 1; 