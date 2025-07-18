-- Create subscription tables for Jobsy AI
-- This script sets up the database schema for the 3-tier subscription system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL CHECK (feature IN ('cv_generations', 'cv_optimizations', 'cover_letters', 'application_wizard')),
    usage_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);

CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_feature ON usage_records(feature);
CREATE INDEX IF NOT EXISTS idx_usage_records_usage_date ON usage_records(usage_date);
CREATE INDEX IF NOT EXISTS idx_usage_records_user_feature_date ON usage_records(user_id, feature, usage_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_subscriptions updated_at
CREATE TRIGGER update_user_subscriptions_updated_at 
    BEFORE UPDATE ON user_subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for usage_records
CREATE POLICY "Users can view their own usage records" ON usage_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage records" ON usage_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_subscriptions TO authenticated;
GRANT ALL ON usage_records TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_usage(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_active_subscription(UUID) TO authenticated;

-- Insert some helpful comments
COMMENT ON TABLE user_subscriptions IS 'Stores user subscription information including Stripe integration';
COMMENT ON TABLE usage_records IS 'Tracks feature usage for subscription limits';
COMMENT ON COLUMN user_subscriptions.plan_id IS 'References the plan ID from the application (e.g., "pro-monthly", "premium-quarterly")';
COMMENT ON COLUMN user_subscriptions.stripe_subscription_id IS 'Stripe subscription ID for webhook processing';
COMMENT ON COLUMN usage_records.feature IS 'The feature being used (cv_generations, cv_optimizations, cover_letters, application_wizard)';
COMMENT ON COLUMN usage_records.usage_date IS 'Date of usage for monthly limit tracking'; 