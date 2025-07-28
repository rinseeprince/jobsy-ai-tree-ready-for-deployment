-- Fix inactive roles issue
-- This script will ensure all recent role grants are properly set as active

-- First, let's see what needs to be fixed
SELECT 
    email,
    role,
    is_active,
    granted_at,
    expires_at,
    CASE 
        WHEN expires_at IS NULL THEN 'Never'
        WHEN expires_at > NOW() THEN 'Not Expired'
        ELSE 'Expired'
    END as expiration_status
FROM user_roles 
WHERE email IN ('gnanidavid@gmail.com', 'samuel.k@taboola.com', 's.kalepa91@gmail.com')
ORDER BY created_at DESC;

-- Fix: Set is_active = true for all roles that haven't expired
UPDATE user_roles 
SET 
    is_active = true,
    updated_at = NOW()
WHERE 
    (expires_at IS NULL OR expires_at > NOW())
    AND is_active = false;

-- Show the results after the fix
SELECT 
    email,
    role,
    is_active,
    granted_at,
    expires_at,
    CASE 
        WHEN expires_at IS NULL THEN 'Never'
        WHEN expires_at > NOW() THEN 'Not Expired'
        ELSE 'Expired'
    END as expiration_status
FROM user_roles 
WHERE email IN ('gnanidavid@gmail.com', 'samuel.k@taboola.com', 's.kalepa91@gmail.com')
ORDER BY created_at DESC;

-- Show all user_roles to confirm the fix
SELECT 
    email,
    role,
    is_active,
    granted_at,
    expires_at,
    CASE 
        WHEN is_active = true AND (expires_at IS NULL OR expires_at > NOW()) THEN 'Active'
        ELSE 'Inactive'
    END as status
FROM user_roles 
ORDER BY created_at DESC; 