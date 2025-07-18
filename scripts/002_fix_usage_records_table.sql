-- Fix usage_records table schema to match the code expectations
-- This script will drop the existing table and recreate it with the correct structure

-- Drop the existing usage_records table (this will delete all data)
DROP TABLE IF EXISTS usage_records CASCADE;

-- Create usage_records table with the correct schema
CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL CHECK (feature IN ('cv_generations', 'cv_optimizations', 'cover_letters', 'application_wizard')),
    usage_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_feature ON usage_records(feature);
CREATE INDEX IF NOT EXISTS idx_usage_records_usage_date ON usage_records(usage_date);
CREATE INDEX IF NOT EXISTS idx_usage_records_user_feature_date ON usage_records(user_id, feature, usage_date);

-- Enable Row Level Security (RLS)
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for usage_records
CREATE POLICY "Users can view their own usage records" ON usage_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage records" ON usage_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON usage_records TO authenticated;

-- Insert helpful comments
COMMENT ON TABLE usage_records IS 'Tracks feature usage for subscription limits';
COMMENT ON COLUMN usage_records.feature IS 'The feature being used (cv_generations, cv_optimizations, cover_letters, application_wizard)';
COMMENT ON COLUMN usage_records.usage_date IS 'Date of usage for monthly limit tracking'; 