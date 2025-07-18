-- Targeted diagnostic to check what's actually missing
-- This won't affect your existing tables or data

-- Check RLS policies for each table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN ('applications', 'saved_cvs', 'saved_cover_letters', 'cvs', 'profiles', 'user_subscriptions', 'usage_records')
ORDER BY tablename, policyname;

-- Check if key functions exist
SELECT 
    routine_name,
    routine_type,
    CASE 
        WHEN routine_name IN ('get_user_usage', 'get_user_subscription_status', 'has_active_subscription', 'update_updated_at_column') 
        THEN 'Expected'
        ELSE 'Unexpected'
    END as function_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Check foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('applications', 'saved_cvs', 'saved_cover_letters', 'cvs', 'profiles', 'user_subscriptions', 'usage_records')
ORDER BY tc.table_name;

-- Check if RLS is enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename IN ('applications', 'saved_cvs', 'saved_cover_letters', 'cvs', 'profiles', 'user_subscriptions', 'usage_records')
ORDER BY tablename;

-- Check permissions for authenticated role
SELECT 
    table_name,
    privilege_type
FROM information_schema.table_privileges 
WHERE grantee = 'authenticated'
    AND table_schema = 'public'
    AND table_name IN ('applications', 'saved_cvs', 'saved_cover_letters', 'cvs', 'profiles', 'user_subscriptions', 'usage_records')
ORDER BY table_name, privilege_type; 