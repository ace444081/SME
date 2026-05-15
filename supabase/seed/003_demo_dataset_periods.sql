-- ============================================================================
-- SME-Pay Demo Dataset (Periods and Runs)
-- Run AFTER 002_seed_demo_data.sql
-- ============================================================================

-- ─── 1. Finalized Payroll Period ───────────────────────────────────────────
INSERT INTO payroll_periods (
  payroll_period_id, company_id, frequency_id, period_code, period_name,
  period_start_date, period_end_date, cutoff_start_date, cutoff_end_date,
  pay_date, period_status, created_by_user_id
) VALUES (
  '00000000-0000-0000-0000-000000000051',
  '00000000-0000-0000-0000-000000000001',
  (SELECT frequency_id FROM payroll_frequencies WHERE frequency_code = 'SEMI_MONTHLY'),
  '2026-04-B', 'April 2nd Cut-off 2026',
  '2026-04-16', '2026-04-30', '2026-04-11', '2026-04-25',
  '2026-04-30', 'FINALIZED', '00000000-0000-0000-0000-000000000011'
);

-- Finalized Payroll Run
INSERT INTO payroll_runs (
  payroll_run_id, payroll_period_id, run_date, run_status,
  computed_by_user_id, finalized_by_user_id, finalized_at
) VALUES (
  '00000000-0000-0000-0000-000000000061',
  '00000000-0000-0000-0000-000000000051',
  '2026-04-28', 'FINALIZED',
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000012',
  '2026-04-29 10:00:00+00'
);

-- Finalized Employee Result for EMP-001
INSERT INTO payroll_employee_results (
  payroll_employee_result_id, payroll_run_id, employee_id,
  gross_pay, total_deductions, net_pay, is_manual_override
) VALUES (
  '00000000-0000-0000-0000-000000000041', -- matches employee id for simplicity in demo
  '00000000-0000-0000-0000-000000000061',
  '00000000-0000-0000-0000-000000000041',
  9000.00, 1000.00, 8000.00, FALSE
);

-- Payslip for EMP-001
INSERT INTO payslips (
  payslip_id, payroll_employee_result_id, generated_date, document_url, is_viewed_by_employee
) VALUES (
  '00000000-0000-0000-0000-000000000071',
  '00000000-0000-0000-0000-000000000041',
  '2026-04-30', NULL, FALSE
);

-- ─── 2. Open Payroll Period ────────────────────────────────────────────────
INSERT INTO payroll_periods (
  payroll_period_id, company_id, frequency_id, period_code, period_name,
  period_start_date, period_end_date, cutoff_start_date, cutoff_end_date,
  pay_date, period_status, created_by_user_id
) VALUES (
  '00000000-0000-0000-0000-000000000052',
  '00000000-0000-0000-0000-000000000001',
  (SELECT frequency_id FROM payroll_frequencies WHERE frequency_code = 'SEMI_MONTHLY'),
  '2026-05-A', 'May 1st Cut-off 2026',
  '2026-05-01', '2026-05-15', '2026-04-26', '2026-05-10',
  '2026-05-15', 'OPEN', '00000000-0000-0000-0000-000000000011'
);

-- Attendance for Open Period
INSERT INTO attendance_payroll_inputs (
  input_id, payroll_period_id, employee_id, days_worked, regular_hours_worked,
  absence_days, overtime_hours, rest_day_hours, holiday_hours
) VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000052', '00000000-0000-0000-0000-000000000041', 11, 88, 0, 0, 0, 0),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000052', '00000000-0000-0000-0000-000000000042', 10, 80, 1, 0, 0, 0),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000052', '00000000-0000-0000-0000-000000000044', 11, 88, 0, 10, 8, 0);

-- ─── 3. Returned Payroll Scenario ──────────────────────────────────────────
INSERT INTO payroll_periods (
  payroll_period_id, company_id, frequency_id, period_code, period_name,
  period_start_date, period_end_date, cutoff_start_date, cutoff_end_date,
  pay_date, period_status, created_by_user_id
) VALUES (
  '00000000-0000-0000-0000-000000000053',
  '00000000-0000-0000-0000-000000000001',
  (SELECT frequency_id FROM payroll_frequencies WHERE frequency_code = 'SEMI_MONTHLY'),
  '2026-05-B', 'May 2nd Cut-off 2026 (Returned)',
  '2026-05-16', '2026-05-31', '2026-05-11', '2026-05-25',
  '2026-05-31', 'RETURNED', '00000000-0000-0000-0000-000000000011'
);

INSERT INTO payroll_runs (
  payroll_run_id, payroll_period_id, run_date, run_status,
  computed_by_user_id, reviewer_notes
) VALUES (
  '00000000-0000-0000-0000-000000000063',
  '00000000-0000-0000-0000-000000000053',
  '2026-05-28', 'RETURNED',
  '00000000-0000-0000-0000-000000000011',
  'Missing overtime hours for EMP-004. Please correct and re-submit.'
);
