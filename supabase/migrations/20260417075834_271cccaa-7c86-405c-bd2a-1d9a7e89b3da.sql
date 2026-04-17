-- Grant admin role to martinnjega66@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'martinnjega66@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;