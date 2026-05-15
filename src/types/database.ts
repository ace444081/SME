/**
 * SME-Pay Database Types
 *
 * These types correspond to the 3NF database schema defined in
 * docs/SME-Pay_Database_Schema_3NF_REVISED.md
 *
 * Types will be expanded as migrations are implemented in Phase 2.
 */

// ─── Enums ──────────────────────────────────────────────────────────────────

export type AccountStatus = "ACTIVE" | "LOCKED" | "DISABLED" | "PENDING";

export type PayrollPeriodStatus =
  | "OPEN"
  | "COMPUTED"
  | "SUBMITTED"
  | "RETURNED"
  | "FINALIZED"
  | "REOPENED"
  | "ARCHIVED";

export type PayrollRunStatus =
  | "DRAFT"
  | "COMPUTED"
  | "SUBMITTED"
  | "RETURNED"
  | "FINALIZED"
  | "VOIDED";

export type ComputationStatus = "OK" | "WARNING" | "ERROR" | "VOIDED";

export type InputStatus =
  | "DRAFT"
  | "VALIDATED"
  | "CORRECTED"
  | "LOCKED"
  | "VOIDED";

export type PayslipStatus = "GENERATED" | "RELEASED" | "REPLACED" | "VOIDED";

export type ReviewActionType =
  | "SUBMIT"
  | "REVIEW"
  | "RETURN"
  | "APPROVE"
  | "FINALIZE"
  | "REOPEN";

export type PayBasis = "MONTHLY" | "DAILY" | "HOURLY";

export type DeductionCategory =
  | "STATUTORY"
  | "TAX"
  | "CUSTOM"
  | "LOAN"
  | "OTHER";

export type CalculationMethod = "BRACKET" | "PERCENTAGE" | "FIXED" | "MANUAL";

export type AdjustmentClass = "EARNING" | "DEDUCTION";

export type SettingValueType = "STRING" | "NUMBER" | "BOOLEAN" | "JSON";

export type RoleCode =
  | "PAYROLL_ADMIN"
  | "OWNER_MANAGER"
  | "SYSTEM_ADMIN"
  | "EMPLOYEE";

// ─── Base Table Types (stubs — expanded per migration) ──────────────────────

export interface Company {
  company_id: string;
  company_name: string;
  business_name: string | null;
  tin: string | null;
  address_line: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  contact_number: string | null;
  email: string | null;
  logo_file_path: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  user_id: string;
  company_id: string;
  employee_id: string | null;
  username: string;
  email: string | null;
  account_status: AccountStatus;
  must_change_password: boolean;
  last_login_at: string | null;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Role {
  role_id: string;
  role_code: RoleCode;
  role_name: string;
  description: string | null;
  is_system_role: boolean;
  created_at: string;
}

export interface Permission {
  permission_id: string;
  permission_code: string;
  module_name: string;
  action_name: string;
  description: string | null;
}

export interface UserRole {
  user_id: string;
  role_id: string;
  assigned_by_user_id: string | null;
  assigned_at: string;
}

export interface Employee {
  employee_id: string;
  company_id: string;
  employee_no: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  birth_date: string | null;
  sex: string | null;
  civil_status: string | null;
  contact_number: string | null;
  email: string | null;
  address_line: string | null;
  department_id: string | null;
  position_id: string | null;
  employment_status_id: string;
  hire_date: string;
  separation_date: string | null;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface PayrollPeriod {
  payroll_period_id: string;
  company_id: string;
  frequency_id: string;
  period_code: string;
  period_name: string;
  period_start_date: string;
  period_end_date: string;
  cutoff_start_date: string;
  cutoff_end_date: string;
  pay_date: string | null;
  period_status: PayrollPeriodStatus;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface PayrollRun {
  payroll_run_id: string;
  payroll_period_id: string;
  run_number: number;
  run_status: PayrollRunStatus;
  computed_by_user_id: string;
  computed_at: string;
  formula_version: string | null;
  remarks: string | null;
}

export interface AuditLog {
  audit_log_id: string;
  company_id: string;
  user_id: string | null;
  action_code: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
