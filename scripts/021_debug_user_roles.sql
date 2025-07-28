-- Debug script to check user_roles table status
-- This will help us understand why users are showing as inactive

-- Check all user_roles records
SELECT 
    id,
    user_id,
    email,
    role,
    is_active,
    granted_at,
    expires_at,
    created_at,
    updated_at,
    CASE 
        WHEN expires_at IS NULL THEN 'Never'
        WHEN expires_at > NOW() THEN 'Not Expired'
        ELSE 'Expired'
    END as expiration_status,
    CASE 
        WHEN is_active = true AND (expires_at IS NULL OR expires_at > NOW()) THEN 'Should be Active'
        ELSE 'Should be Inactive'
    END as expected_status
FROM user_roles 
ORDER BY created_at DESC;

-- Check specific users mentioned in the screenshot
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

-- Check if there are multiple records for the same user
SELECT 
    email,
    COUNT(*) as record_count,
    STRING_AGG(role || ' (' || CASE WHEN is_active THEN 'active' ELSE 'inactive' END || ')', ', ') as roles
FROM user_roles 
GROUP BY email 
HAVING COUNT(*) > 1
ORDER BY record_count DESC; 