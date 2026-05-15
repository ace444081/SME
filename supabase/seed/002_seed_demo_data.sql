-- ============================================================================
-- SME-Pay Demo Seed Data
-- Creates a demo company, users, and employees for testing/thesis presentation
-- Run AFTER 001_seed_lookups_roles_permissions.sql
-- ============================================================================

-- ─── 1. Demo Company ───────────────────────────────────────────────────────
INSERT INTO companies (company_id, company_name, business_name, tin, address_line, city, province, postal_code, contact_number, email)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Visual Options Engineering and Fabrication Services',
  'Visual Options',
  '000-000-000-000',
  '123 Industrial Avenue',
  'Quezon City',
  'Metro Manila',
  '1100',
  '(02) 8123-4567',
  'info@visualoptions.ph'
);

-- ─── 2. Demo Users ─────────────────────────────────────────────────────────
-- password_hash is NULL because we use Supabase Auth.
-- auth_user_id will be set when Supabase Auth accounts are created.
INSERT INTO users (user_id, company_id, username, email, password_hash, account_status) VALUES
  ('00000000-0000-0000-0000-000000000011',
   '00000000-0000-0000-0000-000000000001',
   'payroll_admin',
   'payroll@visualoptions.ph',
   NULL,
   'ACTIVE'),
  ('00000000-0000-0000-0000-000000000012',
   '00000000-0000-0000-0000-000000000001',
   'owner_manager',
   'owner@visualoptions.ph',
   NULL,
   'ACTIVE'),
  ('00000000-0000-0000-0000-000000000013',
   '00000000-0000-0000-0000-000000000001',
   'system_admin',
   'admin@visualoptions.ph',
   NULL,
   'ACTIVE');

-- ─── 3. Assign Roles to Demo Users ─────────────────────────────────────────
INSERT INTO user_roles (user_id, role_id)
SELECT '00000000-0000-0000-0000-000000000011', role_id FROM roles WHERE role_code = 'PAYROLL_ADMIN';

INSERT INTO user_roles (user_id, role_id)
SELECT '00000000-0000-0000-0000-000000000012', role_id FROM roles WHERE role_code = 'OWNER_MANAGER';

INSERT INTO user_roles (user_id, role_id)
SELECT '00000000-0000-0000-0000-000000000013', role_id FROM roles WHERE role_code = 'SYSTEM_ADMIN';

-- ─── 4. Demo Departments ───────────────────────────────────────────────────
INSERT INTO departments (department_id, company_id, department_name) VALUES
  ('00000000-0000-0000-0000-000000000021',
   '00000000-0000-0000-0000-000000000001',
   'Fabrication'),
  ('00000000-0000-0000-0000-000000000022',
   '00000000-0000-0000-0000-000000000001',
   'Engineering'),
  ('00000000-0000-0000-0000-000000000023',
   '00000000-0000-0000-0000-000000000001',
   'Administration');

-- ─── 5. Demo Job Positions ─────────────────────────────────────────────────
INSERT INTO job_positions (position_id, company_id, position_title) VALUES
  ('00000000-0000-0000-0000-000000000031',
   '00000000-0000-0000-0000-000000000001',
   'Welder'),
  ('00000000-0000-0000-0000-000000000032',
   '00000000-0000-0000-0000-000000000001',
   'Driver'),
  ('00000000-0000-0000-0000-000000000033',
   '00000000-0000-0000-0000-000000000001',
   'Office Staff'),
  ('00000000-0000-0000-0000-000000000034',
   '00000000-0000-0000-0000-000000000001',
   'Project Engineer'),
  ('00000000-0000-0000-0000-000000000035',
   '00000000-0000-0000-0000-000000000001',
   'Laborer');

-- ─── 6. Demo Employees ─────────────────────────────────────────────────────
-- 5 employees: monthly, daily, hourly, overtime-heavy, missing-data warning

INSERT INTO employees (employee_id, company_id, employee_no, first_name, middle_name, last_name, department_id, position_id, employment_status_id, hire_date, created_by_user_id)
SELECT
  '00000000-0000-0000-0000-000000000041',
  '00000000-0000-0000-0000-000000000001',
  'EMP-001', 'Juan', 'Dela', 'Cruz',
  '00000000-0000-0000-0000-000000000023',
  '00000000-0000-0000-0000-000000000033',
  es.employment_status_id,
  '2023-01-15',
  '00000000-0000-0000-0000-000000000011'
FROM employment_statuses es WHERE es.status_code = 'ACTIVE';

INSERT INTO employees (employee_id, company_id, employee_no, first_name, middle_name, last_name, department_id, position_id, employment_status_id, hire_date, created_by_user_id)
SELECT
  '00000000-0000-0000-0000-000000000042',
  '00000000-0000-0000-0000-000000000001',
  'EMP-002', 'Maria', 'Santos', 'Garcia',
  '00000000-0000-0000-0000-000000000021',
  '00000000-0000-0000-0000-000000000031',
  es.employment_status_id,
  '2023-03-01',
  '00000000-0000-0000-0000-000000000011'
FROM employment_statuses es WHERE es.status_code = 'ACTIVE';

INSERT INTO employees (employee_id, company_id, employee_no, first_name, middle_name, last_name, department_id, position_id, employment_status_id, hire_date, created_by_user_id)
SELECT
  '00000000-0000-0000-0000-000000000043',
  '00000000-0000-0000-0000-000000000001',
  'EMP-003', 'Pedro', NULL, 'Reyes',
  '00000000-0000-0000-0000-000000000021',
  '00000000-0000-0000-0000-000000000035',
  es.employment_status_id,
  '2024-01-10',
  '00000000-0000-0000-0000-000000000011'
FROM employment_statuses es WHERE es.status_code = 'ACTIVE';

INSERT INTO employees (employee_id, company_id, employee_no, first_name, middle_name, last_name, department_id, position_id, employment_status_id, hire_date, created_by_user_id)
SELECT
  '00000000-0000-0000-0000-000000000044',
  '00000000-0000-0000-0000-000000000001',
  'EMP-004', 'Ana', 'Lopez', 'Mendoza',
  '00000000-0000-0000-0000-000000000022',
  '00000000-0000-0000-0000-000000000034',
  es.employment_status_id,
  '2022-06-15',
  '00000000-0000-0000-0000-000000000011'
FROM employment_statuses es WHERE es.status_code = 'ACTIVE';

-- EMP-005: Employee with missing data (no government IDs, will trigger warning)
INSERT INTO employees (employee_id, company_id, employee_no, first_name, last_name, department_id, position_id, employment_status_id, hire_date, created_by_user_id)
SELECT
  '00000000-0000-0000-0000-000000000045',
  '00000000-0000-0000-0000-000000000001',
  'EMP-005', 'Carlos', 'Tan',
  '00000000-0000-0000-0000-000000000021',
  '00000000-0000-0000-0000-000000000032',
  es.employment_status_id,
  '2025-01-02',
  '00000000-0000-0000-0000-000000000011'
FROM employment_statuses es WHERE es.status_code = 'ACTIVE';

-- ─── 7. Demo Employee Rates ────────────────────────────────────────────────
-- EMP-001: Monthly employee (₱18,000/month)
INSERT INTO employee_rate_history (employee_id, pay_basis, rate_amount, effective_from, created_by_user_id) VALUES
  ('00000000-0000-0000-0000-000000000041', 'MONTHLY', 18000.00, '2023-01-15', '00000000-0000-0000-0000-000000000011');

-- EMP-002: Daily employee (₱600/day)
INSERT INTO employee_rate_history (employee_id, pay_basis, rate_amount, effective_from, created_by_user_id) VALUES
  ('00000000-0000-0000-0000-000000000042', 'DAILY', 600.00, '2023-03-01', '00000000-0000-0000-0000-000000000011');

-- EMP-003: Hourly employee (₱85/hour)
INSERT INTO employee_rate_history (employee_id, pay_basis, rate_amount, effective_from, created_by_user_id) VALUES
  ('00000000-0000-0000-0000-000000000043', 'HOURLY', 85.00, '2024-01-10', '00000000-0000-0000-0000-000000000011');

-- EMP-004: Monthly with overtime (₱25,000/month)
INSERT INTO employee_rate_history (employee_id, pay_basis, rate_amount, effective_from, created_by_user_id) VALUES
  ('00000000-0000-0000-0000-000000000044', 'MONTHLY', 25000.00, '2022-06-15', '00000000-0000-0000-0000-000000000011');

-- EMP-005: Daily (no rate initially — missing data warning scenario)
-- Rate intentionally NOT added for this employee to test v_incomplete_employee_records

-- ─── 8. Demo Government IDs (for 4 of 5 employees) ────────────────────────
-- EMP-001: All IDs
INSERT INTO employee_government_ids (employee_id, government_id_type_id, id_number)
SELECT '00000000-0000-0000-0000-000000000041', government_id_type_id, id_val
FROM (VALUES
  ('SSS',        '33-1234567-8'),
  ('PHILHEALTH', '01-234567890-1'),
  ('PAGIBIG',    '1234-5678-9012'),
  ('TIN',        '123-456-789-000')
) AS ids(type_code, id_val)
JOIN government_id_types git ON git.type_code = ids.type_code;

-- EMP-002: All IDs
INSERT INTO employee_government_ids (employee_id, government_id_type_id, id_number)
SELECT '00000000-0000-0000-0000-000000000042', government_id_type_id, id_val
FROM (VALUES
  ('SSS',        '33-9876543-2'),
  ('PHILHEALTH', '01-987654321-0'),
  ('PAGIBIG',    '9876-5432-1098'),
  ('TIN',        '987-654-321-000')
) AS ids(type_code, id_val)
JOIN government_id_types git ON git.type_code = ids.type_code;

-- EMP-003: All IDs
INSERT INTO employee_government_ids (employee_id, government_id_type_id, id_number)
SELECT '00000000-0000-0000-0000-000000000043', government_id_type_id, id_val
FROM (VALUES
  ('SSS',        '33-1111111-1'),
  ('PHILHEALTH', '01-111111111-1'),
  ('PAGIBIG',    '1111-1111-1111'),
  ('TIN',        '111-111-111-000')
) AS ids(type_code, id_val)
JOIN government_id_types git ON git.type_code = ids.type_code;

-- EMP-004: All IDs
INSERT INTO employee_government_ids (employee_id, government_id_type_id, id_number)
SELECT '00000000-0000-0000-0000-000000000044', government_id_type_id, id_val
FROM (VALUES
  ('SSS',        '33-2222222-2'),
  ('PHILHEALTH', '01-222222222-2'),
  ('PAGIBIG',    '2222-2222-2222'),
  ('TIN',        '222-222-222-000')
) AS ids(type_code, id_val)
JOIN government_id_types git ON git.type_code = ids.type_code;

-- EMP-005: NO government IDs (intentionally missing for incomplete records test)

-- ─── 9. Default Payroll Settings ───────────────────────────────────────────
INSERT INTO company_payroll_settings (
  company_id, default_frequency_id,
  default_working_days_per_month, default_working_hours_per_day,
  default_overtime_multiplier, allow_manual_adjustments,
  require_manager_approval, effective_from, created_by_user_id
)
SELECT
  '00000000-0000-0000-0000-000000000001',
  pf.frequency_id,
  26.00, 8.00, 1.250000, TRUE, TRUE,
  '2023-01-01',
  '00000000-0000-0000-0000-000000000011'
FROM payroll_frequencies pf
WHERE pf.frequency_code = 'SEMI_MONTHLY';
