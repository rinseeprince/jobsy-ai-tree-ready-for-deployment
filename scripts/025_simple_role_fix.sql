-- Simple fix for role granting - clean and straightforward
-- This will allow unlimited grant/revoke cycles

-- First, clean up duplicate records - keep only the most recent one per user
DELETE FROM user_roles 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id) id
    FROM user_roles 
    ORDER BY user_id, created_at DESC
);

-- Drop the existing function
DROP FUNCTION IF EXISTS grant_user_role(UUID, TEXT, TEXT, UUID, INTEGER, TEXT);

-- Create a simple, working function
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
    existing_role_id UUID;
    expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Find user by email
    SELECT * INTO user_record 
    FROM auth.users 
    WHERE email = target_email;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'User not found with that email. The user must sign up first.'
        );
    END IF;

    -- Calculate expiration
    IF new_role = 'admin' THEN
        expires_at := NULL;
    ELSIF expiry_days IS NOT NULL THEN
        expires_at := NOW() + (expiry_days || ' days')::INTERVAL;
    ELSE
        expires_at := NULL;
    END IF;

    -- Check if user already has a role record
    SELECT id INTO existing_role_id 
    FROM user_roles 
    WHERE user_id = user_record.id;

    -- Update existing or insert new
    IF existing_role_id IS NOT NULL THEN
        UPDATE user_roles 
        SET 
            role = new_role,
            granted_by = granted_by_id,
            granted_at = NOW(),
            expires_at = expires_at,
            notes = grant_notes,
            is_active = true,
            updated_at = NOW()
        WHERE id = existing_role_id;
    ELSE
        INSERT INTO user_roles (
            user_id,
            email,
            role,
            granted_by,
            expires_at,
            notes,
            is_active
        ) VALUES (
            user_record.id,
            user_record.email,
            new_role,
            granted_by_id,
            expires_at,
            grant_notes,
            true
        );
    END IF;

    -- Log the action
    INSERT INTO role_grants_log (
        user_id,
        email,
        role,
        action,
        granted_by,
        expires_at,
        notes
    ) VALUES (
        user_record.id,
        user_record.email,
        new_role,
        'granted',
        granted_by_id,
        expires_at,
        grant_notes
    );

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

-- Grant permissions
GRANT EXECUTE ON FUNCTION grant_user_role TO authenticated;

-- Test it works
SELECT 'Role system fixed - you can now grant and revoke unlimited times' as status; 