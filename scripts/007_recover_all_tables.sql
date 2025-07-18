-- Comprehensive recovery script for Jobsy AI database
-- This script will safely recreate all tables, functions, and policies
-- Run this after the diagnostic script to fix any issues

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. RECREATE ALL TABLES
-- ============================================================================

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    job_posting TEXT NOT NULL,
    cv_content TEXT NOT NULL,
    cover_letter TEXT NOT NULL,
    cv_recommendations TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN (
        'applied', 'phone_screen', 'first_interview', 'second_interview', 
        'third_interview', 'final_interview', 'offer', 'accepted', 
        'rejected', 'withdrawn', 'ghosted'
    )) DEFAULT 'applied',
    applied_date DATE,
    interview_date DATE,
    notes TEXT,
    job_url TEXT,
    salary_range TEXT,
    location TEXT,
    remote BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved_cvs table
CREATE TABLE IF NOT EXISTS saved_cvs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    cv_data JSONB NOT NULL,
    template_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'ready', 'sent')) DEFAULT 'draft',
    word_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved_cover_letters table
CREATE TABLE IF NOT EXISTS saved_cover_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    template_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'ready', 'sent')) DEFAULT 'draft',
    word_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cvs table
CREATE TABLE IF NOT EXISTS cvs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    template_id TEXT NOT NULL,
    file_size INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL,
    stripe_subscription_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_records table
CREATE TABLE IF NOT EXISTS usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL CHECK (feature IN ('cv_generations', 'cv_optimizations', 'cover_letters', 'application_wizard')),
    usage_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. CREATE INDEXES
-- ============================================================================

-- Applications indexes
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);
CREATE INDEX IF NOT EXISTS idx_applications_company_name ON applications(company_name);
CREATE INDEX IF NOT EXISTS idx_applications_applied_date ON applications(applied_date);

-- Saved CVs indexes
CREATE INDEX IF NOT EXISTS idx_saved_cvs_user_id ON saved_cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_cvs_status ON saved_cvs(status);
CREATE INDEX IF NOT EXISTS idx_saved_cvs_created_at ON saved_cvs(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_cvs_template_id ON saved_cvs(template_id);

-- Saved cover letters indexes
CREATE INDEX IF NOT EXISTS idx_saved_cover_letters_user_id ON saved_cover_letters(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_cover_letters_status ON saved_cover_letters(status);
CREATE INDEX IF NOT EXISTS idx_saved_cover_letters_created_at ON saved_cover_letters(created_at);

-- CVs indexes
CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_cvs_created_at ON cvs(created_at);
CREATE INDEX IF NOT EXISTS idx_cvs_template_id ON cvs(template_id);

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Subscription indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);

-- Usage records indexes
CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_feature ON usage_records(feature);
CREATE INDEX IF NOT EXISTS idx_usage_records_usage_date ON usage_records(usage_date);
CREATE INDEX IF NOT EXISTS idx_usage_records_user_feature_date ON usage_records(user_id, feature, usage_date);

-- ============================================================================
-- 3. CREATE FUNCTIONS
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
-- 4. CREATE TRIGGERS
-- ============================================================================

-- Create trigger for user_subscriptions updated_at
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. CREATE RLS POLICIES
-- ============================================================================

-- Applications policies
DROP POLICY IF EXISTS "Users can view their own applications" ON applications;
CREATE POLICY "Users can view their own applications" ON applications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own applications" ON applications;
CREATE POLICY "Users can insert their own applications" ON applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own applications" ON applications;
CREATE POLICY "Users can update their own applications" ON applications
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own applications" ON applications;
CREATE POLICY "Users can delete their own applications" ON applications
    FOR DELETE USING (auth.uid() = user_id);

-- Saved CVs policies
DROP POLICY IF EXISTS "Users can view their own saved CVs" ON saved_cvs;
CREATE POLICY "Users can view their own saved CVs" ON saved_cvs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own saved CVs" ON saved_cvs;
CREATE POLICY "Users can insert their own saved CVs" ON saved_cvs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own saved CVs" ON saved_cvs;
CREATE POLICY "Users can update their own saved CVs" ON saved_cvs
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own saved CVs" ON saved_cvs;
CREATE POLICY "Users can delete their own saved CVs" ON saved_cvs
    FOR DELETE USING (auth.uid() = user_id);

-- Saved cover letters policies
DROP POLICY IF EXISTS "Users can view their own cover letters" ON saved_cover_letters;
CREATE POLICY "Users can view their own cover letters" ON saved_cover_letters
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own cover letters" ON saved_cover_letters;
CREATE POLICY "Users can insert their own cover letters" ON saved_cover_letters
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cover letters" ON saved_cover_letters;
CREATE POLICY "Users can update their own cover letters" ON saved_cover_letters
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own cover letters" ON saved_cover_letters;
CREATE POLICY "Users can delete their own cover letters" ON saved_cover_letters
    FOR DELETE USING (auth.uid() = user_id);

-- CVs policies
DROP POLICY IF EXISTS "Users can view their own CVs" ON cvs;
CREATE POLICY "Users can view their own CVs" ON cvs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own CVs" ON cvs;
CREATE POLICY "Users can insert their own CVs" ON cvs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own CVs" ON cvs;
CREATE POLICY "Users can update their own CVs" ON cvs
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own CVs" ON cvs;
CREATE POLICY "Users can delete their own CVs" ON cvs
    FOR DELETE USING (auth.uid() = user_id);

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- User subscriptions policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON user_subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON user_subscriptions;
CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscriptions" ON user_subscriptions;
CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Usage records policies
DROP POLICY IF EXISTS "Users can view their own usage records" ON usage_records;
CREATE POLICY "Users can view their own usage records" ON usage_records
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own usage records" ON usage_records;
CREATE POLICY "Users can insert their own usage records" ON usage_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 7. GRANT PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON applications TO authenticated;
GRANT ALL ON saved_cvs TO authenticated;
GRANT ALL ON saved_cover_letters TO authenticated;
GRANT ALL ON cvs TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON user_subscriptions TO authenticated;
GRANT ALL ON usage_records TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_usage(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_active_subscription(UUID) TO authenticated;

-- ============================================================================
-- 8. ADD COMMENTS
-- ============================================================================

COMMENT ON TABLE applications IS 'Stores job applications for each user';
COMMENT ON TABLE saved_cvs IS 'Stores saved CVs for each user';
COMMENT ON TABLE saved_cover_letters IS 'Stores saved cover letters for each user';
COMMENT ON TABLE cvs IS 'Stores CV files for each user';
COMMENT ON TABLE profiles IS 'Stores user profile information';
COMMENT ON TABLE user_subscriptions IS 'Stores user subscription information including Stripe integration';
COMMENT ON TABLE usage_records IS 'Tracks feature usage for subscription limits'; 