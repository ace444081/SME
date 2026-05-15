-- ============================================================================
-- SME-Pay Seed Data
-- Populates lookup tables, roles, permissions, and demo data
-- ============================================================================

-- ─── 1. Roles ───────────────────────────────────────────────────────────────
INSERT INTO roles (role_code, role_name, description, is_system_role) VALUES
  ('PAYROLL_ADMIN',  'Payroll Administrator', 'Manages payroll operations, employee records, and payroll computation', TRUE),
  ('OWNER_MANAGER',  'Owner / Manager',       'Reviews, approves, and finalizes payroll; views reports and audit logs', TRUE),
  ('SYSTEM_ADMIN',   'System Administrator',   'Manages users, roles, settings, backup, restore, and audit logs', TRUE),
  ('EMPLOYEE',       'Employee',               'Optional portal access for viewing own records', TRUE);

-- ─── 2. Permissions ─────────────────────────────────────────────────────────
INSERT INTO permissions (permission_code, module_name, action_name, description) VALUES
  -- Auth
  ('AUTH_LOGIN',              'Auth',       'Login',     'Can log in to the system'),
  ('AUTH_CHANGE_PASSWORD',    'Auth',       'Update',    'Can change own password'),
  -- Users
  ('USERS_VIEW',              'Users',      'View',      'Can view user list'),
  ('USERS_CREATE',            'Users',      'Create',    'Can create user accounts'),
  ('USERS_UPDATE',            'Users',      'Update',    'Can edit user accounts'),
  ('USERS_MANAGE_ROLES',      'Users',      'ManageRoles', 'Can assign/change user roles'),
  ('USERS_DISABLE',           'Users',      'Disable',   'Can disable/enable users'),
  ('USERS_RESET_PASSWORD',    'Users',      'ResetPwd',  'Can reset user passwords'),
  -- Company
  ('COMPANY_VIEW',            'Company',    'View',      'Can view company info'),
  ('COMPANY_UPDATE',          'Company',    'Update',    'Can edit company info'),
  ('COMPANY_UPDATE_LIMITED',  'Company',    'UpdateLimited', 'Can edit display-only company fields'),
  -- Employees
  ('EMPLOYEES_VIEW',          'Employees',  'View',      'Can view employee records'),
  ('EMPLOYEES_CREATE',        'Employees',  'Create',    'Can create employees'),
  ('EMPLOYEES_UPDATE',        'Employees',  'Update',    'Can edit employees'),
  ('EMPLOYEES_DEACTIVATE',    'Employees',  'Deactivate','Can deactivate employees'),
  ('EMPLOYEES_MANAGE_RATES',  'Employees',  'ManageRates', 'Can manage employee rates'),
  ('EMPLOYEES_MANAGE_GOVIDS', 'Employees',  'ManageGovIDs', 'Can manage government IDs'),
  -- Payroll Periods
  ('PERIODS_VIEW',            'Payroll Periods', 'View',   'Can view payroll periods'),
  ('PERIODS_CREATE',          'Payroll Periods', 'Create', 'Can create payroll periods'),
  ('PERIODS_UPDATE',          'Payroll Periods', 'Update', 'Can edit payroll periods'),
  -- Attendance
  ('ATTENDANCE_VIEW',         'Attendance', 'View',      'Can view attendance inputs'),
  ('ATTENDANCE_ENCODE',       'Attendance', 'Encode',    'Can encode attendance'),
  ('ATTENDANCE_UPDATE',       'Attendance', 'Update',    'Can correct attendance'),
  -- Deductions
  ('DEDUCTIONS_VIEW',         'Deductions', 'View',      'Can view deduction settings'),
  ('DEDUCTIONS_MANAGE',       'Deductions', 'Manage',    'Can manage deduction references'),
  -- Payroll
  ('PAYROLL_COMPUTE',         'Payroll',    'Compute',   'Can compute payroll'),
  ('PAYROLL_REVIEW',          'Payroll',    'Review',    'Can review payroll computation'),
  ('PAYROLL_SUBMIT',          'Payroll',    'Submit',    'Can submit payroll for review'),
  ('PAYROLL_RETURN',          'Payroll',    'Return',    'Can return payroll for correction'),
  ('PAYROLL_FINALIZE',        'Payroll',    'Finalize',  'Can finalize payroll'),
  ('PAYROLL_REOPEN',          'Payroll',    'Reopen',    'Can reopen finalized payroll'),
  -- Payslips
  ('PAYSLIPS_GENERATE',       'Payslips',   'Generate',  'Can generate payslips'),
  ('PAYSLIPS_VIEW',           'Payslips',   'View',      'Can view payslips'),
  ('PAYSLIPS_DOWNLOAD',       'Payslips',   'Download',  'Can download payslips'),
  -- Reports
  ('REPORTS_VIEW',            'Reports',    'View',      'Can view reports'),
  ('REPORTS_GENERATE',        'Reports',    'Generate',  'Can generate reports'),
  ('REPORTS_EXPORT',          'Reports',    'Export',    'Can export reports'),
  -- History
  ('HISTORY_VIEW',            'History',    'View',      'Can view payroll history'),
  -- Audit
  ('AUDIT_VIEW',              'Audit',      'View',      'Can view full audit logs'),
  ('AUDIT_EXPORT',            'Audit',      'Export',    'Can export audit logs'),
  -- Backup
  ('BACKUP_CREATE',           'Backup',     'Create',    'Can create backups'),
  ('BACKUP_RESTORE',          'Backup',     'Restore',   'Can restore backups'),
  -- Settings
  ('SETTINGS_VIEW',           'Settings',   'View',      'Can view system settings'),
  ('SETTINGS_UPDATE',         'Settings',   'Update',    'Can update system settings');

-- ─── 3. Role-Permission Assignments ─────────────────────────────────────────
-- Payroll Admin permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_code = 'PAYROLL_ADMIN'
  AND p.permission_code IN (
    'AUTH_LOGIN', 'AUTH_CHANGE_PASSWORD',
    'COMPANY_VIEW', 'COMPANY_UPDATE_LIMITED',
    'EMPLOYEES_VIEW', 'EMPLOYEES_CREATE', 'EMPLOYEES_UPDATE', 'EMPLOYEES_DEACTIVATE',
    'EMPLOYEES_MANAGE_RATES', 'EMPLOYEES_MANAGE_GOVIDS',
    'PERIODS_VIEW', 'PERIODS_CREATE', 'PERIODS_UPDATE',
    'ATTENDANCE_VIEW', 'ATTENDANCE_ENCODE', 'ATTENDANCE_UPDATE',
    'DEDUCTIONS_VIEW', 'DEDUCTIONS_MANAGE',
    'PAYROLL_COMPUTE', 'PAYROLL_REVIEW', 'PAYROLL_SUBMIT',
    'PAYSLIPS_GENERATE', 'PAYSLIPS_VIEW', 'PAYSLIPS_DOWNLOAD',
    'REPORTS_VIEW', 'REPORTS_GENERATE', 'REPORTS_EXPORT',
    'HISTORY_VIEW'
  );

-- Owner/Manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_code = 'OWNER_MANAGER'
  AND p.permission_code IN (
    'AUTH_LOGIN', 'AUTH_CHANGE_PASSWORD',
    'COMPANY_VIEW',
    'EMPLOYEES_VIEW', 'EMPLOYEES_MANAGE_RATES',
    'PERIODS_VIEW',
    'ATTENDANCE_VIEW',
    'DEDUCTIONS_VIEW',
    'PAYROLL_REVIEW', 'PAYROLL_RETURN', 'PAYROLL_FINALIZE', 'PAYROLL_REOPEN',
    'PAYSLIPS_VIEW', 'PAYSLIPS_DOWNLOAD',
    'REPORTS_VIEW', 'REPORTS_GENERATE', 'REPORTS_EXPORT',
    'HISTORY_VIEW',
    'AUDIT_VIEW', 'AUDIT_EXPORT'
  );

-- System Admin permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_code = 'SYSTEM_ADMIN'
  AND p.permission_code IN (
    'AUTH_LOGIN', 'AUTH_CHANGE_PASSWORD',
    'USERS_VIEW', 'USERS_CREATE', 'USERS_UPDATE', 'USERS_MANAGE_ROLES',
    'USERS_DISABLE', 'USERS_RESET_PASSWORD',
    'COMPANY_VIEW', 'COMPANY_UPDATE',
    'DEDUCTIONS_VIEW', 'DEDUCTIONS_MANAGE',
    'AUDIT_VIEW', 'AUDIT_EXPORT',
    'BACKUP_CREATE', 'BACKUP_RESTORE',
    'SETTINGS_VIEW', 'SETTINGS_UPDATE'
  );

-- ─── 4. Payroll Frequencies ─────────────────────────────────────────────────
INSERT INTO payroll_frequencies (frequency_code, frequency_name, periods_per_year) VALUES
  ('DAILY',        'Daily',        365),
  ('WEEKLY',       'Weekly',       52),
  ('SEMI_MONTHLY', 'Semi-monthly', 24),
  ('MONTHLY',      'Monthly',      12);

-- ─── 5. Employment Statuses ─────────────────────────────────────────────────
INSERT INTO employment_statuses (status_code, status_name, description) VALUES
  ('ACTIVE',     'Active',      'Currently employed'),
  ('RESIGNED',   'Resigned',    'Voluntarily left the company'),
  ('TERMINATED', 'Terminated',  'Employment terminated by company'),
  ('ON_LEAVE',   'On Leave',    'Temporarily away from work'),
  ('INACTIVE',   'Inactive',    'No longer active but not formally separated');

-- ─── 6. Government ID Types ────────────────────────────────────────────────
INSERT INTO government_id_types (type_code, type_name, is_required_for_payroll) VALUES
  ('SSS',        'Social Security System Number',       TRUE),
  ('PHILHEALTH', 'PhilHealth Identification Number',    TRUE),
  ('PAGIBIG',    'Pag-IBIG MID Number',                 TRUE),
  ('TIN',        'Tax Identification Number',            TRUE);

-- ─── 7. Deduction Types ────────────────────────────────────────────────────
INSERT INTO deduction_types (deduction_code, deduction_name, deduction_category, calculation_method, reduces_taxable_income, has_employer_share) VALUES
  ('SSS',              'SSS Contribution',                    'STATUTORY', 'BRACKET',    TRUE,  TRUE),
  ('PHILHEALTH',       'PhilHealth Contribution',             'STATUTORY', 'PERCENTAGE', TRUE,  TRUE),
  ('PAGIBIG',          'Pag-IBIG Contribution',               'STATUTORY', 'PERCENTAGE', TRUE,  TRUE),
  ('WITHHOLDING_TAX',  'Withholding Tax on Compensation',     'TAX',       'BRACKET',    FALSE, FALSE),
  ('CASH_ADVANCE',     'Cash Advance',                        'LOAN',      'MANUAL',     FALSE, FALSE),
  ('OTHER_DEDUCTION',  'Other Deduction',                     'OTHER',     'MANUAL',     FALSE, FALSE);

-- ─── 8. Earning Types ──────────────────────────────────────────────────────
INSERT INTO earning_types (earning_code, earning_name, is_taxable, is_system_generated) VALUES
  ('BASIC_PAY',                    'Basic Pay',                    TRUE,  TRUE),
  ('OVERTIME_PAY',                 'Overtime Pay',                 TRUE,  TRUE),
  ('HOLIDAY_PAY',                  'Holiday Pay',                  TRUE,  TRUE),
  ('REST_DAY_OT_PAY',             'Rest Day Overtime Pay',        TRUE,  TRUE),
  ('ALLOWANCE_TAXABLE',           'Taxable Allowance',            TRUE,  FALSE),
  ('ALLOWANCE_NONTAXABLE',        'Non-taxable Allowance',        FALSE, FALSE),
  ('MANUAL_EARNING_ADJUSTMENT',   'Manual Earning Adjustment',    TRUE,  FALSE);

-- ─── 9. Manual Adjustment Types ────────────────────────────────────────────
INSERT INTO manual_adjustment_types (adjustment_code, adjustment_name, adjustment_class, is_taxable) VALUES
  ('MEAL_ALLOWANCE',       'Meal Allowance',        'EARNING',    FALSE),
  ('TRANSPORTATION',       'Transportation Allow',  'EARNING',    FALSE),
  ('COMMISSION',           'Commission',            'EARNING',    TRUE),
  ('CASH_ADVANCE',         'Cash Advance',          'DEDUCTION',  FALSE),
  ('LOAN_PAYMENT',         'Loan Payment',          'DEDUCTION',  FALSE),
  ('OTHER_EARNING',        'Other Earning',         'EARNING',    TRUE),
  ('OTHER_DEDUCTION',      'Other Deduction',       'DEDUCTION',  FALSE);
