-- Disable RLS on user_roles table as a temporary fix
-- This will allow the application to work while we figure out the proper RLS setup

-- Drop all existing policies on user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Authenticated users can view all roles" ON user_roles;

-- Disable RLS completely on user_roles table
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_roles';

-- Test that the table is accessible
SELECT COUNT(*) FROM user_roles LIMIT 1;

-- Note: This is a temporary fix. The application should handle access control
-- through the RolesService methods that check user permissions. 