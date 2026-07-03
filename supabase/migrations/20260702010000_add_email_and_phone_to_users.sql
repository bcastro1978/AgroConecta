-- Migration: Add email to public.users and update handle_new_user trigger function
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    full_name, 
    email,
    phone_number,
    role, 
    address, 
    provincia, 
    canton, 
    parroquia, 
    location_ref_lat, 
    location_ref_lng,
    verification_status
  )
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Usuario Nuevo'),
    new.email,
    new.raw_user_meta_data->>'phone_number',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'Productor'),
    new.raw_user_meta_data->>'address',
    new.raw_user_meta_data->>'provincia',
    new.raw_user_meta_data->>'canton',
    new.raw_user_meta_data->>'parroquia',
    (new.raw_user_meta_data->>'location_ref_lat')::float,
    (new.raw_user_meta_data->>'location_ref_lng')::float,
    'Pending'
  );
  RETURN new;
END;
$$;

-- Backfill emails for existing users from auth.users
UPDATE public.users u
SET email = a.email
FROM auth.users a
WHERE u.id = a.id AND u.email IS NULL;
