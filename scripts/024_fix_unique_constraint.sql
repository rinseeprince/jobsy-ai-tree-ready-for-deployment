-- Fix the unique constraint issue preventing role re-granting
-- The user_roles table has a unique constraint that's preventing updates

-- First, let's see the current table structure
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'user_roles' 
AND constraint_type = 'UNIQUE';

-- Check the current user_roles table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
ORDER BY ordinal_position;

-- Remove the problematic unique constraint on user_id
-- (This constraint prevents having multiple role records per user)
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_key;

-- Also check for any other unique constraints that might cause issues
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;

-- Verify the constraints are removed
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'user_roles' 
AND constraint_type = 'UNIQUE';

-- Show the current user_roles records to understand the data
SELECT 
    id,
    user_id,
    email,
    role,
    is_active,
    granted_at,
    expires_at,
    created_at
FROM user_roles 
ORDER BY created_at DESC;

-- Test the function again by calling it manually
-- (Replace the user_id and email with actual values from your database)
SELECT grant_user_role(
    target_user_id := NULL,
    target_email := 'samuel.k@taboola.com',
    new_role := 'super_user',
    granted_by_id := '6f276146-e4b1-4aa9-a9b0-64e6d1b9dfc3',
    expiry_days := 30,
    grant_notes := 'Test re-granting after constraint fix'
);

-- Show the results after the test
SELECT 
    id,
    user_id,
    email,
    role,
    is_active,
    granted_at,
    expires_at,
    created_at
FROM user_roles 
WHERE email = 'samuel.k@taboola.com'
ORDER BY created_at DESC; 