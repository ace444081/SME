-- ============================================================================
-- SME-Pay Demo Supabase Auth Seed
-- Populates auth.users and auth.identities for the 3 demo accounts
-- Run AFTER 002_seed_demo_data.sql
-- ============================================================================

-- 1. Insert into auth.users (Supabase Authentication schema)
-- We set both email_confirmed_at and confirmed_at, and omit instance_id so Supabase GoTrue defaults correctly.
-- ON CONFLICT DO UPDATE ensures that if the rows already exist unconfirmed from a previous run, they get fully confirmed and updated with the password hash.
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES
  ('00000000-0000-0000-0000-000000000011', 'payroll@visualoptions.ph', crypt('password123', gen_salt('bf')), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Payroll Admin"}', NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000012', 'owner@visualoptions.ph', crypt('password123', gen_salt('bf')), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Owner Manager"}', NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000013', 'admin@visualoptions.ph', crypt('password123', gen_salt('bf')), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"System Admin"}', NOW(), NOW(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO UPDATE SET
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  confirmed_at = EXCLUDED.confirmed_at,
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  role = EXCLUDED.role,
  aud = EXCLUDED.aud;

-- 2. Insert into auth.identities
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000011', format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000011', 'payroll@visualoptions.ph')::jsonb, 'email', '00000000-0000-0000-0000-000000000011', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000012', format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000012', 'owner@visualoptions.ph')::jsonb, 'email', '00000000-0000-0000-0000-000000000012', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000013', format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000013', 'admin@visualoptions.ph')::jsonb, 'email', '00000000-0000-0000-0000-000000000013', NOW(), NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 3. Link public.users auth_user_id to auth.users id
UPDATE public.users 
SET auth_user_id = user_id 
WHERE user_id IN ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000013');
