-- Add super admin user for kemal@weareasocial.com
INSERT INTO public.admin_users (
    id,
    email,
    name,
    role,
    is_active,
    requires_2fa,
    totp_enabled,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'kemal@weareasocial.com',
    'Kemal Teksal',
    'super_admin',
    true,
    false,
    false,
    now(),
    now()
) ON CONFLICT (email) DO UPDATE SET
    role = 'super_admin',
    is_active = true,
    requires_2fa = false,
    updated_at = now();
