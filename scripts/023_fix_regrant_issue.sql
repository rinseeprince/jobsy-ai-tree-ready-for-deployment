-- Fix the re-granting issue for revoked users
-- This script improves the grant_user_role function to better handle revoked users

-- Drop the existing function
DROP FUNCTION IF EXISTS grant_user_role(UUID, TEXT, TEXT, UUID, INTEGER, TEXT);

-- Create the improved grant_user_role function with better error handling
CREATE OR REPLACE FUNCTION grant_user_role(
    target_user_id UUID DEFAULT NULL,
    target_email TEXT DEFAULT NULL,
    new_role TEXT DEFAULT NULL,
    granted_by_id UUID DEFAULT NULL,
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
    role_id UUID;
BEGIN
    -- Validate required parameters
    IF target_email IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'target_email is required'
        );
    END IF;

    IF new_role IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'new_role is required'
        );
    END IF;

    IF granted_by_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'granted_by_id is required'
        );
    END IF;

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

    -- Calculate expiration date
    IF new_role = 'admin' THEN
        expires_at := NULL; -- Admin roles never expire
    ELSIF expiry_days IS NOT NULL THEN
        expires_at := NOW() + (expiry_days || ' days')::INTERVAL;
    ELSE
        expires_at := NULL;
    END IF;

    -- Check if user has ANY role record (active or inactive) - get the most recent one
    SELECT * INTO existing_role 
    FROM user_roles 
    WHERE user_id = target_user_id
    ORDER BY created_at DESC
    LIMIT 1;

    -- Insert or update role
    IF existing_role IS NOT NULL THEN
        -- Update existing role (whether active or inactive)
        UPDATE user_roles 
        SET 
            role = new_role,
            granted_by = granted_by_id,
            granted_at = NOW(),
            expires_at = expires_at,
            notes = grant_notes,
            is_active = true,
            updated_at = NOW()
        WHERE id = existing_role.id
        RETURNING id INTO role_id;
        
        IF role_id IS NULL THEN
            RETURN jsonb_build_object(
                'success', false,
                'message', 'Failed to update existing role'
            );
        END IF;
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
        )
        RETURNING id INTO role_id;
        
        IF role_id IS NULL THEN
            RETURN jsonb_build_object(
                'success', false,
                'message', 'Failed to insert new role'
            );
        END IF;
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

    -- Return success with more details
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Role granted successfully',
        'user_id', target_user_id,
        'email', user_record.email,
        'role', new_role,
        'expires_at', expires_at,
        'role_id', role_id
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Database error: ' || SQLERRM,
            'error_code', SQLSTATE
        );
END;
$$;

-- Grant execute permissions on the updated function
GRANT EXECUTE ON FUNCTION grant_user_role TO authenticated;

-- Test the function creation
SELECT 'Function grant_user_role updated with improved re-granting logic' as status; 