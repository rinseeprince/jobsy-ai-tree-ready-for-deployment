-- Create applications table for Jobsy AI
-- This script sets up the database schema for storing job applications

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);
CREATE INDEX IF NOT EXISTS idx_applications_company_name ON applications(company_name);
CREATE INDEX IF NOT EXISTS idx_applications_applied_date ON applications(applied_date);

-- Enable Row Level Security (RLS)
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for applications
CREATE POLICY "Users can view their own applications" ON applications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own applications" ON applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own applications" ON applications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applications" ON applications
    FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON applications TO authenticated;

-- Insert helpful comments
COMMENT ON TABLE applications IS 'Stores job applications for each user';
COMMENT ON COLUMN applications.status IS 'Current status of the application';
COMMENT ON COLUMN applications.applied_date IS 'Date when the application was submitted';
COMMENT ON COLUMN applications.interview_date IS 'Date of the interview (if scheduled)'; 