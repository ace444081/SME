-- ============================================================================
-- Migration 011 — Database Views
-- SME-Pay: Web-Based Payroll Automation System
-- ============================================================================

-- ─── v_employee_current_rate ────────────────────────────────────────────────
-- Shows the current active salary/rate per employee (effective_to IS NULL)
CREATE OR REPLACE VIEW v_employee_current_rate AS
SELECT
  erh.employee_id,
  erh.rate_history_id,
  erh.pay_basis,
  erh.rate_amount,
  erh.effective_from
FROM employee_rate_history erh
WHERE erh.effective_to IS NULL;


-- ─── v_payroll_employee_totals ──────────────────────────────────────────────
-- Computes gross pay, total deductions, employer contributions, and net pay
-- from the payroll line tables. No totals are stored in base tables.
CREATE OR REPLACE VIEW v_payroll_employee_totals AS
SELECT
  per.payroll_employee_result_id,
  per.payroll_run_id,
  per.employee_id,
  COALESCE(earn.total_earnings, 0) AS gross_pay,
  COALESCE(ded.total_deductions, 0) AS total_deductions,
  COALESCE(emp_contrib.total_employer_contributions, 0) AS total_employer_contributions,
  COALESCE(earn.total_earnings, 0) - COALESCE(ded.total_deductions, 0) AS net_pay
FROM payroll_employee_results per
LEFT JOIN (
  SELECT payroll_employee_result_id, SUM(amount) AS total_earnings
  FROM payroll_earning_lines
  GROUP BY payroll_employee_result_id
) earn ON earn.payroll_employee_result_id = per.payroll_employee_result_id
LEFT JOIN (
  SELECT payroll_employee_result_id, SUM(amount) AS total_deductions
  FROM payroll_deduction_lines
  GROUP BY payroll_employee_result_id
) ded ON ded.payroll_employee_result_id = per.payroll_employee_result_id
LEFT JOIN (
  SELECT payroll_employee_result_id, SUM(amount) AS total_employer_contributions
  FROM payroll_employer_contribution_lines
  GROUP BY payroll_employee_result_id
) emp_contrib ON emp_contrib.payroll_employee_result_id = per.payroll_employee_result_id;


-- ─── v_payroll_period_summary ───────────────────────────────────────────────
-- Summarizes payroll by period and run
CREATE OR REPLACE VIEW v_payroll_period_summary AS
SELECT
  pp.payroll_period_id,
  pp.period_code,
  pp.period_name,
  pr.payroll_run_id,
  pr.run_number,
  pr.run_status,
  COUNT(vpet.employee_id) AS employee_count,
  SUM(vpet.gross_pay) AS total_gross_pay,
  SUM(vpet.total_deductions) AS total_deductions,
  SUM(vpet.total_employer_contributions) AS total_employer_contributions,
  SUM(vpet.net_pay) AS total_net_pay
FROM payroll_periods pp
JOIN payroll_runs pr
  ON pr.payroll_period_id = pp.payroll_period_id
JOIN v_payroll_employee_totals vpet
  ON vpet.payroll_run_id = pr.payroll_run_id
GROUP BY
  pp.payroll_period_id,
  pp.period_code,
  pp.period_name,
  pr.payroll_run_id,
  pr.run_number,
  pr.run_status;


-- ─── v_incomplete_employee_records ──────────────────────────────────────────
-- Flags employees missing current rate or required government IDs
CREATE OR REPLACE VIEW v_incomplete_employee_records AS
SELECT
  e.employee_id,
  e.employee_no,
  e.first_name,
  e.last_name,
  CASE
    WHEN cr.rate_history_id IS NULL THEN TRUE
    WHEN EXISTS (
      SELECT 1
      FROM government_id_types git
      WHERE git.is_required_for_payroll = TRUE
        AND NOT EXISTS (
          SELECT 1
          FROM employee_government_ids egid
          WHERE egid.employee_id = e.employee_id
            AND egid.government_id_type_id = git.government_id_type_id
        )
    ) THEN TRUE
    ELSE FALSE
  END AS has_missing_payroll_data,
  CASE
    WHEN cr.rate_history_id IS NULL THEN TRUE
    ELSE FALSE
  END AS missing_current_rate,
  (
    SELECT string_agg(git.type_code, ', ')
    FROM government_id_types git
    WHERE git.is_required_for_payroll = TRUE
      AND NOT EXISTS (
        SELECT 1
        FROM employee_government_ids egid
        WHERE egid.employee_id = e.employee_id
          AND egid.government_id_type_id = git.government_id_type_id
      )
  ) AS missing_government_ids
FROM employees e
LEFT JOIN v_employee_current_rate cr
  ON cr.employee_id = e.employee_id;


-- ─── v_contribution_bracket_totals ──────────────────────────────────────────
-- Computes total contribution (employee + employer) per bracket row.
-- Replaces the removed total_fixed_amount column (DB-03 fix).
CREATE OR REPLACE VIEW v_contribution_bracket_totals AS
SELECT
  scb.contribution_bracket_id,
  scb.reference_set_id,
  scb.min_compensation,
  scb.max_compensation,
  scb.salary_credit,
  scb.employee_rate,
  scb.employer_rate,
  scb.employee_fixed_amount,
  scb.employer_fixed_amount,
  COALESCE(scb.employee_fixed_amount, 0) + COALESCE(scb.employer_fixed_amount, 0) AS total_fixed_amount
FROM statutory_contribution_brackets scb;
