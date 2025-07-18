-- Targeted fix for missing RLS policies, functions, and permissions
-- This script only adds what's missing without affecting existing data

-- ============================================================================
-- 1. ENABLE RLS ON TABLES (if not already enabled)
-- ============================================================================

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. CREATE MISSING RLS POLICIES (only if they don't exist)
-- ============================================================================

-- Applications policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'applications' AND policyname = 'Users can view their own applications') THEN
        CREATE POLICY "Users can view their own applications" ON applications FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'applications' AND policyname = 'Users can insert their own applications') THEN
        CREATE POLICY "Users can insert their own applications" ON applications FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'applications' AND policyname = 'Users can update their own applications') THEN
        CREATE POLICY "Users can update their own applications" ON applications FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'applications' AND policyname = 'Users can delete their own applications') THEN
        CREATE POLICY "Users can delete their own applications" ON applications FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Saved CVs policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_cvs' AND policyname = 'Users can view their own saved CVs') THEN
        CREATE POLICY "Users can view their own saved CVs" ON saved_cvs FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_cvs' AND policyname = 'Users can insert their own saved CVs') THEN
        CREATE POLICY "Users can insert their own saved CVs" ON saved_cvs FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_cvs' AND policyname = 'Users can update their own saved CVs') THEN
        CREATE POLICY "Users can update their own saved CVs" ON saved_cvs FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_cvs' AND policyname = 'Users can delete their own saved CVs') THEN
        CREATE POLICY "Users can delete their own saved CVs" ON saved_cvs FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Saved cover letters policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_cover_letters' AND policyname = 'Users can view their own cover letters') THEN
        CREATE POLICY "Users can view their own cover letters" ON saved_cover_letters FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_cover_letters' AND policyname = 'Users can insert their own cover letters') THEN
        CREATE POLICY "Users can insert their own cover letters" ON saved_cover_letters FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_cover_letters' AND policyname = 'Users can update their own cover letters') THEN
        CREATE POLICY "Users can update their own cover letters" ON saved_cover_letters FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_cover_letters' AND policyname = 'Users can delete their own cover letters') THEN
        CREATE POLICY "Users can delete their own cover letters" ON saved_cover_letters FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- CVs policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cvs' AND policyname = 'Users can view their own CVs') THEN
        CREATE POLICY "Users can view their own CVs" ON cvs FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cvs' AND policyname = 'Users can insert their own CVs') THEN
        CREATE POLICY "Users can insert their own CVs" ON cvs FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cvs' AND policyname = 'Users can update their own CVs') THEN
        CREATE POLICY "Users can update their own CVs" ON cvs FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cvs' AND policyname = 'Users can delete their own CVs') THEN
        CREATE POLICY "Users can delete their own CVs" ON cvs FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- User subscriptions policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_subscriptions' AND policyname = 'Users can view their own subscriptions') THEN
        CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_subscriptions' AND policyname = 'Users can insert their own subscriptions') THEN
        CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_subscriptions' AND policyname = 'Users can update their own subscriptions') THEN
        CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Usage records policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'usage_records' AND policyname = 'Users can view their own usage records') THEN
        CREATE POLICY "Users can view their own usage records" ON usage_records FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'usage_records' AND policyname = 'Users can insert their own usage records') THEN
        CREATE POLICY "Users can insert their own usage records" ON usage_records FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================================
-- 3. CREATE MISSING FUNCTIONS
-- ============================================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to get current usage for a user
CREATE OR REPLACE FUNCTION get_user_usage(
    p_user_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    feature TEXT,
    usage_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ur.feature,
        COUNT(*) as usage_count
    FROM usage_records ur
    WHERE ur.user_id = p_user_id
      AND ur.usage_date >= p_start_date
      AND ur.usage_date <= p_end_date
    GROUP BY ur.feature;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get subscription status for a user
CREATE OR REPLACE FUNCTION get_user_subscription_status(p_user_id UUID)
RETURNS TABLE (
    plan_id TEXT,
    status TEXT,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        us.plan_id,
        us.status,
        us.current_period_end,
        us.cancel_at_period_end
    FROM user_subscriptions us
    WHERE us.user_id = p_user_id
      AND us.status = 'active'
    ORDER BY us.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    subscription_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO subscription_count
    FROM user_subscriptions
    WHERE user_id = p_user_id
      AND status = 'active'
      AND current_period_end > NOW();
    
    RETURN subscription_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. CREATE TRIGGERS (if they don't exist)
-- ============================================================================

-- Create trigger for user_subscriptions updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_subscriptions_updated_at') THEN
        CREATE TRIGGER update_user_subscriptions_updated_at 
            BEFORE UPDATE ON user_subscriptions 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ============================================================================
-- 5. GRANT PERMISSIONS (if not already granted)
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON applications TO authenticated;
GRANT ALL ON saved_cvs TO authenticated;
GRANT ALL ON saved_cover_letters TO authenticated;
GRANT ALL ON cvs TO authenticated;
GRANT ALL ON user_subscriptions TO authenticated;
GRANT ALL ON usage_records TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_usage(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_active_subscription(UUID) TO authenticated; 