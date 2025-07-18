-- Create saved_cvs table for Jobsy AI
-- This script sets up the database schema for storing saved CVs

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_cvs_user_id ON saved_cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_cvs_status ON saved_cvs(status);
CREATE INDEX IF NOT EXISTS idx_saved_cvs_created_at ON saved_cvs(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_cvs_template_id ON saved_cvs(template_id);

-- Enable Row Level Security (RLS)
ALTER TABLE saved_cvs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for saved_cvs
CREATE POLICY "Users can view their own saved CVs" ON saved_cvs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved CVs" ON saved_cvs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved CVs" ON saved_cvs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved CVs" ON saved_cvs
    FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON saved_cvs TO authenticated;

-- Insert helpful comments
COMMENT ON TABLE saved_cvs IS 'Stores saved CVs for each user';
COMMENT ON COLUMN saved_cvs.cv_data IS 'JSON data containing the CV content and structure';
COMMENT ON COLUMN saved_cvs.template_id IS 'ID of the template used for this CV';
COMMENT ON COLUMN saved_cvs.status IS 'Current status of the CV (draft, ready, sent)';
COMMENT ON COLUMN saved_cvs.word_count IS 'Total word count of the CV content'; 