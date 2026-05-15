-- ============================================================================
-- Migration 012 — Row Level Security Policies
-- SME-Pay: Web-Based Payroll Automation System
--
-- These policies restrict data access through Supabase RLS.
-- All users can only see data from their own company_id.
-- ============================================================================

-- Enable RLS on all tables with company_id
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_government_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_rate_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_payroll_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_payroll_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_payroll_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_employee_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_earning_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_deduction_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_employer_contribution_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE archive_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_error_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on lookup tables (read-only for all authenticated)
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_frequencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE employment_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE government_id_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE deduction_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE earning_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_adjustment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE statutory_reference_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE statutory_contribution_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE withholding_tax_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE withholding_tax_brackets ENABLE ROW LEVEL SECURITY;

-- ─── Helper function: get current user's company_id ─────────────────────────
CREATE OR REPLACE FUNCTION auth_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM users
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─── Lookup tables: read-only for all authenticated users ───────────────────
CREATE POLICY "Authenticated read all" ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON payroll_frequencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON employment_statuses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON government_id_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON deduction_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON earning_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON manual_adjustment_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON statutory_reference_sets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON statutory_contribution_brackets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON withholding_tax_tables FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated read all" ON withholding_tax_brackets FOR SELECT TO authenticated USING (true);

-- ─── User-scoped: can see own user_roles ────────────────────────────────────
CREATE POLICY "Users see own roles" ON user_roles FOR SELECT TO authenticated
  USING (user_id IN (SELECT user_id FROM users WHERE auth_user_id = auth.uid()));

-- ─── Company-scoped tables ──────────────────────────────────────────────────
-- All CUD operations should go through server actions with the service-role key.
-- These SELECT policies allow authenticated users to view their company's data.

CREATE POLICY "Company isolation" ON companies FOR SELECT TO authenticated
  USING (company_id = auth_company_id());

CREATE POLICY "Company isolation" ON users FOR SELECT TO authenticated
  USING (company_id = auth_company_id());

CREATE POLICY "Company isolation" ON departments FOR SELECT TO authenticated
  USING (company_id = auth_company_id());

CREATE POLICY "Company isolation" ON job_positions FOR SELECT TO authenticated
  USING (company_id = auth_company_id());

CREATE POLICY "Company isolation" ON employees FOR SELECT TO authenticated
  USING (company_id = auth_company_id());

CREATE POLICY "Company isolation employees govids" ON employee_government_ids FOR SELECT TO authenticated
  USING (employee_id IN (
    SELECT employee_id FROM employees WHERE company_id = auth_company_id()
  ));

CREATE POLICY "Company isolation employee rates" ON employee_rate_history FOR SELECT TO authenticated
  USING (employee_id IN (
    SELECT employee_id FROM employees WHERE company_id = auth_company_id()
  ));

CREATE POLICY "Company isolation" ON company_payroll_settings FOR SELECT TO authenticated
  USING (company_id = auth_company_id());

CREATE POLICY "Company isolation" ON payroll_periods FOR SELECT TO authenticated
  USING (company_id = auth_company_id());

CREATE POLICY "Company isolation attendance" ON attendance_payroll_inputs FOR SELECT TO authenticated
  USING (payroll_period_id IN (
    SELECT payroll_period_id FROM payroll_periods WHERE company_id = auth_company_id()
  ));

CREATE POLICY "Company isolation manual adj" ON manual_payroll_adjustments FOR SELECT TO authenticated
  USING (payroll_period_id IN (
    SELECT payroll_period_id FROM payroll_periods WHERE company_id = auth_company_id()
  ));

CREATE POLICY "Company isolation runs" ON payroll_runs FOR SELECT TO authenticated
  USING (payroll_period_id IN (
    SELECT payroll_period_id FROM payroll_periods WHERE company_id = auth_company_id()
  ));

CREATE POLICY "Company isolation results" ON payroll_employee_results FOR SELECT TO authenticated
  USING (payroll_run_id IN (
    SELECT pr.payroll_run_id FROM payroll_runs pr
    JOIN payroll_periods pp ON pp.payroll_period_id = pr.payroll_period_id
    WHERE pp.company_id = auth_company_id()
  ));

CREATE POLICY "Company isolation earning lines" ON payroll_earning_lines FOR SELECT TO authenticated
  USING (payroll_employee_result_id IN (
    SELECT per.payroll_employee_result_id FROM payroll_employee_results per
    JOIN payroll_runs pr ON pr.payroll_run_id = per.payroll_run_id
    JOIN payroll_periods pp ON pp.payroll_period_id = pr.payroll_period_id
    WHERE pp.company_id = auth_company_id()
  ));

CREATE POLICY "Company isolation deduction lines" ON payroll_deduction_lines FOR SELECT TO authenticated
  USING (payroll_employee_result_id IN (
    SELECT per.payroll_employee_result_id FROM payroll_employee_results per
    JOIN payroll_runs pr ON pr.payroll_run_id = per.payroll_run_id
    JOIN payroll_periods pp ON pp.payroll_period_id = pr.payroll_period_id
    WHERE pp.company_id = auth_company_id()
  ));

CREATE POLICY "Company isolation employer contrib" ON payroll_employer_contribution_lines FOR SELECT TO authenticated
  USING (payroll_employee_result_id IN (
    SELECT per.payroll_employee_result_id FROM payroll_employee_results per
    JOIN payroll_runs pr ON pr.payroll_run_id = per.payroll_run_id
    JOIN payroll_periods pp ON pp.payroll_period_id = pr.payroll_period_id
    WHERE pp.company_id = auth_company_id()
  ));

CREATE POLICY "Company isolation" ON document_templates FOR SELECT TO authenticated
  USING (company_id = auth_company_id());

CREATE POLICY "Company isolation payslips" ON payslips FOR SELECT TO authenticated
  USING (payroll_employee_result_id IN (
    SELECT per.payroll_employee_result_id FROM payroll_employee_results per
    JOIN payroll_runs pr ON pr.payroll_run_id = per.payroll_run_id
    JOIN payroll_periods pp ON pp.payroll_period_id = pr.payroll_period_id
    WHERE pp.company_id = auth_company_id()
  ));

CREATE POLICY "Company isolation" ON report_exports FOR SELECT TO authenticated
  USING (company_id = auth_company_id());

CREATE POLICY "Company isolation" ON backup_files FOR SELECT TO authenticated
  USING (company_id = auth_company_id());

CREATE POLICY "Company isolation" ON audit_logs FOR SELECT TO authenticated
  USING (company_id = auth_company_id());

CREATE POLICY "Company isolation" ON archive_logs FOR SELECT TO authenticated
  USING (company_id = auth_company_id());

CREATE POLICY "Company isolation" ON system_error_logs FOR SELECT TO authenticated
  USING (company_id = auth_company_id());
