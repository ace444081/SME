-- ============================================================================
-- SME-Pay Demo Supabase Auth Seed
-- Populates auth.users and auth.identities for the 3 demo accounts
-- Run AFTER 002_seed_demo_data.sql
-- ============================================================================

-- 1. Insert into auth.users (Supabase Authentication schema)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
) VALUES
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000000', 'payroll@visualoptions.ph', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Payroll Admin"}', NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000000', 'owner@visualoptions.ph', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"Owner Manager"}', NOW(), NOW(), 'authenticated', 'authenticated'),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000000', 'admin@visualoptions.ph', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"name":"System Admin"}', NOW(), NOW(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert into auth.identities
INSERT INTO auth.identities (
  id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000011', format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000011', 'payroll@visualoptions.ph')::jsonb, 'email', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000012', format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000012', 'owner@visualoptions.ph')::jsonb, 'email', NOW(), NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000013', format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000013', 'admin@visualoptions.ph')::jsonb, 'email', NOW(), NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 3. Link public.users auth_user_id to auth.users id
UPDATE public.users 
SET auth_user_id = user_id 
WHERE user_id IN ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000013');
