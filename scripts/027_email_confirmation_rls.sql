-- Email Confirmation RLS Policies
-- This script updates all RLS policies to only allow confirmed users

-- Drop existing policies and recreate them with email confirmation checks

-- Applications table
DROP POLICY IF EXISTS "Users can view their own applications" ON applications;
DROP POLICY IF EXISTS "Users can insert their own applications" ON applications;
DROP POLICY IF EXISTS "Users can update their own applications" ON applications;
DROP POLICY IF EXISTS "Users can delete their own applications" ON applications;

CREATE POLICY "Confirmed users can view their own applications" ON applications
FOR SELECT USING (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

CREATE POLICY "Confirmed users can insert their own applications" ON applications
FOR INSERT WITH CHECK (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

CREATE POLICY "Confirmed users can update their own applications" ON applications
FOR UPDATE USING (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

CREATE POLICY "Confirmed users can delete their own applications" ON applications
FOR DELETE USING (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

-- Saved CVs table
DROP POLICY IF EXISTS "Users can view their own saved CVs" ON saved_cvs;
DROP POLICY IF EXISTS "Users can insert their own saved CVs" ON saved_cvs;
DROP POLICY IF EXISTS "Users can update their own saved CVs" ON saved_cvs;
DROP POLICY IF EXISTS "Users can delete their own saved CVs" ON saved_cvs;

CREATE POLICY "Confirmed users can view their own saved CVs" ON saved_cvs
FOR SELECT USING (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

CREATE POLICY "Confirmed users can insert their own saved CVs" ON saved_cvs
FOR INSERT WITH CHECK (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

CREATE POLICY "Confirmed users can update their own saved CVs" ON saved_cvs
FOR UPDATE USING (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

CREATE POLICY "Confirmed users can delete their own saved CVs" ON saved_cvs
FOR DELETE USING (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

-- Saved Cover Letters table
DROP POLICY IF EXISTS "Users can view their own cover letters" ON saved_cover_letters;
DROP POLICY IF EXISTS "Users can insert their own cover letters" ON saved_cover_letters;
DROP POLICY IF EXISTS "Users can update their own cover letters" ON saved_cover_letters;
DROP POLICY IF EXISTS "Users can delete their own cover letters" ON saved_cover_letters;

CREATE POLICY "Confirmed users can view their own cover letters" ON saved_cover_letters
FOR SELECT USING (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

CREATE POLICY "Confirmed users can insert their own cover letters" ON saved_cover_letters
FOR INSERT WITH CHECK (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

CREATE POLICY "Confirmed users can update their own cover letters" ON saved_cover_letters
FOR UPDATE USING (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

CREATE POLICY "Confirmed users can delete their own cover letters" ON saved_cover_letters
FOR DELETE USING (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

-- CVs table (if exists)
-- Note: This table may not exist in all setups, so these policies are commented out
-- Uncomment if you have a cvs table
/*
DROP POLICY IF EXISTS "Users can view their own CVs" ON cvs;
DROP POLICY IF EXISTS "Users can insert their own CVs" ON cvs;
DROP POLICY IF EXISTS "Users can update their own CVs" ON cvs;
DROP POLICY IF EXISTS "Users can delete their own CVs" ON cvs;

CREATE POLICY "Confirmed users can view their own CVs" ON cvs
FOR SELECT USING (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

CREATE POLICY "Confirmed users can insert their own CVs" ON cvs
FOR INSERT WITH CHECK (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

CREATE POLICY "Confirmed users can update their own CVs" ON cvs
FOR UPDATE USING (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

CREATE POLICY "Confirmed users can delete their own CVs" ON cvs
FOR DELETE USING (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);
*/

-- Profiles table (if exists)
-- Note: This table may not exist in all setups, so these policies are commented out
-- Uncomment if you have a profiles table
/*
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Confirmed users can view their own profile" ON profiles
FOR SELECT USING (
  auth.uid() = id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

CREATE POLICY "Confirmed users can insert their own profile" ON profiles
FOR INSERT WITH CHECK (
  auth.uid() = id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

CREATE POLICY "Confirmed users can update their own profile" ON profiles
FOR UPDATE USING (
  auth.uid() = id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);
*/

-- User Subscriptions table (if exists)
-- Note: This table may not exist in all setups, so these policies are commented out
-- Uncomment if you have a user_subscriptions table
/*
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON user_subscriptions;

CREATE POLICY "Confirmed users can view their own subscriptions" ON user_subscriptions
FOR SELECT USING (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

CREATE POLICY "Confirmed users can insert their own subscriptions" ON user_subscriptions
FOR INSERT WITH CHECK (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

CREATE POLICY "Confirmed users can update their own subscriptions" ON user_subscriptions
FOR UPDATE USING (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);
*/

-- Usage Records table (if exists)
-- Note: This table may not exist in all setups, so these policies are commented out
-- Uncomment if you have a usage_records table
/*
DROP POLICY IF EXISTS "Users can view their own usage records" ON usage_records;
DROP POLICY IF EXISTS "Users can insert their own usage records" ON usage_records;

CREATE POLICY "Confirmed users can view their own usage records" ON usage_records
FOR SELECT USING (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

CREATE POLICY "Confirmed users can insert their own usage records" ON usage_records
FOR INSERT WITH CHECK (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);
*/

-- User Roles table (if exists)
-- Note: This table may not exist in all setups, so these policies are commented out
-- Uncomment if you have a user_roles table
/*
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;

CREATE POLICY "Confirmed users can view their own roles" ON user_roles
FOR SELECT USING (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

CREATE POLICY "Confirmed admins can view all roles" ON user_roles
FOR SELECT USING (
  auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role_name = 'admin'
  )
);

CREATE POLICY "Confirmed admins can manage all roles" ON user_roles
FOR ALL USING (
  auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role_name = 'admin'
  )
);
*/

-- User Notifications table (if exists)
-- Note: This table may not exist in all setups, so these policies are commented out
-- Uncomment if you have a user_notifications table
/*
DROP POLICY IF EXISTS "Users can view their own notifications" ON user_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON user_notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON user_notifications;

CREATE POLICY "Confirmed users can view their own notifications" ON user_notifications
FOR SELECT USING (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

CREATE POLICY "Confirmed users can update their own notifications" ON user_notifications
FOR UPDATE USING (
  auth.uid() = user_id 
  AND auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);

CREATE POLICY "System can insert notifications for confirmed users" ON user_notifications
FOR INSERT WITH CHECK (
  auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
);
*/

-- Role Grants Log table (if exists)
-- Note: This table may not exist in all setups, so these policies are commented out
-- Uncomment if you have a role_grants_log table
/*
DROP POLICY IF EXISTS "Admins can view role grants log" ON role_grants_log;
DROP POLICY IF EXISTS "Admins can insert role grants log" ON role_grants_log;

CREATE POLICY "Confirmed admins can view role grants log" ON role_grants_log
FOR SELECT USING (
  auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role_name = 'admin'
  )
);

CREATE POLICY "Confirmed admins can insert role grants log" ON role_grants_log
FOR INSERT WITH CHECK (
  auth.jwt() ->> 'email_confirmed_at' IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role_name = 'admin'
  )
);
*/ 