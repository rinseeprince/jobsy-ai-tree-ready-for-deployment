-- Create all missing tables for Jobsy AI
-- This script sets up all the database tables that the application needs

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create cvs table (used by cv-service.ts)
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

-- Create saved_cover_letters table (used by cover-letter-service.ts)
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

-- Create profiles table (used by stripe checkout)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_cvs_created_at ON cvs(created_at);
CREATE INDEX IF NOT EXISTS idx_cvs_template_id ON cvs(template_id);

CREATE INDEX IF NOT EXISTS idx_saved_cover_letters_user_id ON saved_cover_letters(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_cover_letters_status ON saved_cover_letters(status);
CREATE INDEX IF NOT EXISTS idx_saved_cover_letters_created_at ON saved_cover_letters(created_at);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cvs
CREATE POLICY "Users can view their own CVs" ON cvs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CVs" ON cvs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CVs" ON cvs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CVs" ON cvs
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for saved_cover_letters
CREATE POLICY "Users can view their own cover letters" ON saved_cover_letters
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cover letters" ON saved_cover_letters
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cover letters" ON saved_cover_letters
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cover letters" ON saved_cover_letters
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Grant necessary permissions
GRANT ALL ON cvs TO authenticated;
GRANT ALL ON saved_cover_letters TO authenticated;
GRANT ALL ON profiles TO authenticated;

-- Insert helpful comments
COMMENT ON TABLE cvs IS 'Stores CV files for each user';
COMMENT ON TABLE saved_cover_letters IS 'Stores saved cover letters for each user';
COMMENT ON TABLE profiles IS 'Stores user profile information'; 