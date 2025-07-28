-- Create missing tables and grant_user_role function for Jobsy AI
-- This script fixes the PGRST202 error by creating the missing database function

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('free', 'pro', 'premium', 'super_user', 'admin')),
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role_grants_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS role_grants_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('free', 'pro', 'premium', 'super_user', 'admin')),
    action TEXT NOT NULL CHECK (action IN ('granted', 'revoked', 'expired')),
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_email ON user_roles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_expires_at ON user_roles(expires_at);

CREATE INDEX IF NOT EXISTS idx_role_grants_log_user_id ON role_grants_log(user_id);
CREATE INDEX IF NOT EXISTS idx_role_grants_log_email ON role_grants_log(email);
CREATE INDEX IF NOT EXISTS idx_role_grants_log_action ON role_grants_log(action);
CREATE INDEX IF NOT EXISTS idx_role_grants_log_created_at ON role_grants_log(created_at);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON user_notifications(read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_grants_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

CREATE POLICY "Admins can manage all roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

-- Create RLS policies for role_grants_log
CREATE POLICY "Admins can view role grants log" ON role_grants_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

CREATE POLICY "Admins can insert role grants log" ON role_grants_log
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
        )
    );

-- Create RLS policies for user_notifications
CREATE POLICY "Users can view their own notifications" ON user_notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON user_notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON user_notifications
    FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON user_roles TO authenticated;
GRANT ALL ON role_grants_log TO authenticated;
GRANT ALL ON user_notifications TO authenticated;

-- Create the grant_user_role function
CREATE OR REPLACE FUNCTION grant_user_role(
    target_user_id UUID DEFAULT NULL,
    target_email TEXT,
    new_role TEXT,
    granted_by_id UUID,
    expiry_days INTEGER DEFAULT NULL,
    grant_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    existing_role RECORD;
    expires_at TIMESTAMP WITH TIME ZONE;
    result JSONB;
BEGIN
    -- Validate role
    IF new_role NOT IN ('free', 'pro', 'premium', 'super_user', 'admin') THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Invalid role specified'
        );
    END IF;

    -- Find user by email if target_user_id is not provided
    IF target_user_id IS NULL THEN
        SELECT * INTO user_record 
        FROM auth.users 
        WHERE email = target_email;
        
        IF NOT FOUND THEN
            RETURN jsonb_build_object(
                'success', false,
                'message', 'User not found with that email. The user must sign up first.'
            );
        END IF;
        
        target_user_id := user_record.id;
    ELSE
        -- Verify user exists
        SELECT * INTO user_record 
        FROM auth.users 
        WHERE id = target_user_id;
        
        IF NOT FOUND THEN
            RETURN jsonb_build_object(
                'success', false,
                'message', 'User not found with that ID'
            );
        END IF;
    END IF;

    -- Check if user already has an active role
    SELECT * INTO existing_role 
    FROM user_roles 
    WHERE user_id = target_user_id AND is_active = true;

    -- Calculate expiration date
    IF new_role = 'admin' THEN
        expires_at := NULL; -- Admin roles never expire
    ELSIF expiry_days IS NOT NULL THEN
        expires_at := NOW() + (expiry_days || ' days')::INTERVAL;
    ELSE
        expires_at := NULL;
    END IF;

    -- Insert or update role
    IF existing_role IS NOT NULL THEN
        -- Update existing role
        UPDATE user_roles 
        SET 
            role = new_role,
            granted_by = granted_by_id,
            granted_at = NOW(),
            expires_at = expires_at,
            notes = grant_notes,
            is_active = true,
            updated_at = NOW()
        WHERE id = existing_role.id;
    ELSE
        -- Insert new role
        INSERT INTO user_roles (
            user_id,
            email,
            role,
            granted_by,
            expires_at,
            notes,
            is_active
        ) VALUES (
            target_user_id,
            user_record.email,
            new_role,
            granted_by_id,
            expires_at,
            grant_notes,
            true
        );
    END IF;

    -- Log the role grant
    INSERT INTO role_grants_log (
        user_id,
        email,
        role,
        action,
        granted_by,
        expires_at,
        notes
    ) VALUES (
        target_user_id,
        user_record.email,
        new_role,
        'granted',
        granted_by_id,
        expires_at,
        grant_notes
    );

    -- Return success
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Role granted successfully'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Database error: ' || SQLERRM
        );
END;
$$;

-- Create the revoke_user_role function (referenced in the TypeScript code)
CREATE OR REPLACE FUNCTION revoke_user_role(
    target_user_id UUID,
    revoked_by_id UUID,
    revoke_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
    role_record RECORD;
BEGIN
    -- Get user info
    SELECT * INTO user_record 
    FROM auth.users 
    WHERE id = target_user_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'User not found'
        );
    END IF;

    -- Get current role
    SELECT * INTO role_record 
    FROM user_roles 
    WHERE user_id = target_user_id AND is_active = true;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'User has no active role to revoke'
        );
    END IF;

    -- Deactivate the role
    UPDATE user_roles 
    SET 
        is_active = false,
        updated_at = NOW()
    WHERE id = role_record.id;

    -- Log the role revocation
    INSERT INTO role_grants_log (
        user_id,
        email,
        role,
        action,
        granted_by,
        notes
    ) VALUES (
        target_user_id,
        user_record.email,
        role_record.role,
        'revoked',
        revoked_by_id,
        revoke_notes
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Role revoked successfully'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Database error: ' || SQLERRM
        );
END;
$$;

-- Create the expire_user_roles function (referenced in the TypeScript code)
CREATE OR REPLACE FUNCTION expire_user_roles()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    expired_count INTEGER := 0;
    role_record RECORD;
BEGIN
    -- Find expired roles
    FOR role_record IN 
        SELECT ur.*, u.email 
        FROM user_roles ur
        JOIN auth.users u ON ur.user_id = u.id
        WHERE ur.is_active = true 
        AND ur.expires_at IS NOT NULL 
        AND ur.expires_at < NOW()
    LOOP
        -- Deactivate expired role
        UPDATE user_roles 
        SET is_active = false, updated_at = NOW()
        WHERE id = role_record.id;

        -- Log the expiration
        INSERT INTO role_grants_log (
            user_id,
            email,
            role,
            action,
            granted_by,
            expires_at,
            notes
        ) VALUES (
            role_record.user_id,
            role_record.email,
            role_record.role,
            'expired',
            role_record.granted_by,
            role_record.expires_at,
            'Automatically expired'
        );

        expired_count := expired_count + 1;
    END LOOP;

    RETURN expired_count;
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION grant_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION expire_user_roles TO authenticated;

-- Insert helpful comments
COMMENT ON TABLE user_roles IS 'Stores user role assignments and permissions';
COMMENT ON TABLE role_grants_log IS 'Audit log of role grants, revocations, and expirations';
COMMENT ON TABLE user_notifications IS 'Stores user notifications and alerts';
COMMENT ON FUNCTION grant_user_role IS 'Grants a role to a user by email or user ID';
COMMENT ON FUNCTION revoke_user_role IS 'Revokes an active role from a user';
COMMENT ON FUNCTION expire_user_roles IS 'Expires roles that have passed their expiration date';

-- Test the function creation
SELECT 'Function grant_user_role created successfully' as status; 