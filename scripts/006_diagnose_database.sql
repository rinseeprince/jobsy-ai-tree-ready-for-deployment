-- Diagnostic script to check database state after CASCADE operations
-- This will help identify what tables exist and what might be missing

-- Check if all expected tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('applications', 'saved_cvs', 'saved_cover_letters', 'cvs', 'profiles', 'user_subscriptions', 'usage_records') 
        THEN 'Expected'
        ELSE 'Unexpected'
    END as table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check for any broken foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public';

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check if functions exist
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
    AND routine_name IN ('get_user_usage', 'get_user_subscription_status', 'has_active_subscription', 'update_updated_at_column')
ORDER BY routine_name;

-- Check table row counts (if tables exist)
DO $$
DECLARE
    table_name text;
    row_count bigint;
BEGIN
    FOR table_name IN 
        SELECT unnest(ARRAY['applications', 'saved_cvs', 'saved_cover_letters', 'cvs', 'profiles', 'user_subscriptions', 'usage_records'])
    LOOP
        BEGIN
            EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO row_count;
            RAISE NOTICE 'Table %: % rows', table_name, row_count;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Table %: Does not exist or error: %', table_name, SQLERRM;
        END;
    END LOOP;
END $$; 