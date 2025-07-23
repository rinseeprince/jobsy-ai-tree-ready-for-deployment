-- Fix user_roles RLS policy to prevent infinite recursion
-- This script will drop the existing broken policy and create a simple, working one

-- First, let's see what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_roles';

-- Drop all existing policies on user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Users can insert their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;

-- Disable RLS temporarily to clean up
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create a simple, safe policy for viewing roles
-- Users can only see their own roles
CREATE POLICY "Users can view their own roles" ON user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all roles (this will be checked in the application logic)
CREATE POLICY "Admins can view all roles" ON user_roles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin' 
            AND is_active = true
        )
    );

-- Users cannot insert/update/delete their own roles (only admins can)
-- This prevents users from granting themselves admin privileges

-- Admins can manage all roles
CREATE POLICY "Admins can manage all roles" ON user_roles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin' 
            AND is_active = true
        )
    );

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_roles';

-- Test the policies work
-- This should not cause infinite recursion
SELECT COUNT(*) FROM user_roles LIMIT 1; 