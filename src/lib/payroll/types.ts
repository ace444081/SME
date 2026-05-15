/**
 * Payroll Computation Engine Types
 *
 * These types define the internal data structures used by the payroll
 * computation engine. They are NOT the database types but computed values.
 */

export interface EmployeePayrollInput {
  employee_id: string;
  attendance_input_id: string;
  rate_history_id: string;

  // Rate info
  pay_basis: "MONTHLY" | "DAILY" | "HOURLY";
  rate_amount: number;

  // Company settings
  working_days_per_month: number;
  working_hours_per_day: number;
  overtime_multiplier: number;

  // Attendance
  days_worked: number;
  regular_hours_worked: number | null;
  absence_days: number;
  late_minutes: number;
  undertime_minutes: number;
  overtime_hours: number;
  rest_day_overtime_hours: number | null;
  holiday_overtime_hours: number | null;

  // Manual adjustments
  manual_earnings: ManualAdjustment[];
  manual_deductions: ManualAdjustment[];
}

export interface ManualAdjustment {
  manual_adjustment_id: string;
  adjustment_type_id: string;
  adjustment_code: string;
  adjustment_name: string;
  is_taxable: boolean;
  amount: number;
}

export interface EarningLine {
  earning_type_id: string;
  earning_code: string;
  description: string;
  quantity: number | null;
  rate_used: number | null;
  amount: number;
  is_taxable: boolean;
  source_manual_adjustment_id: string | null;
}

export interface DeductionLine {
  deduction_type_id: string;
  deduction_code: string;
  description: string;
  amount: number;
  reduces_taxable_income: boolean;
  reference_set_id: string | null;
  contribution_bracket_id: string | null;
  tax_bracket_id: string | null;
  source_manual_adjustment_id: string | null;
}

export interface EmployerContributionLine {
  deduction_type_id: string;
  deduction_code: string;
  description: string;
  amount: number;
  reference_set_id: string | null;
  contribution_bracket_id: string | null;
}

export interface ComputedPayroll {
  employee_id: string;
  attendance_input_id: string;
  rate_history_id: string;
  earnings: EarningLine[];
  deductions: DeductionLine[];
  employer_contributions: EmployerContributionLine[];
  gross_pay: number;
  total_deductions: number;
  total_employer_contributions: number;
  net_pay: number;
  taxable_income: number;
  computation_status: "OK" | "WARNING" | "ERROR";
  warning_message: string | null;
}

export interface ContributionBracket {
  contribution_bracket_id: string;
  reference_set_id: string;
  min_compensation: number;
  max_compensation: number | null;
  salary_credit: number | null;
  employee_rate: number | null;
  employer_rate: number | null;
  employee_fixed_amount: number | null;
  employer_fixed_amount: number | null;
}

export interface TaxBracket {
  tax_bracket_id: string;
  tax_table_id: string;
  bracket_no: number;
  lower_bound: number;
  upper_bound: number | null;
  base_tax_amount: number;
  excess_over_amount: number;
  marginal_rate: number;
}

export interface StatutoryReferences {
  sss_brackets: ContributionBracket[];
  philhealth_brackets: ContributionBracket[];
  pagibig_brackets: ContributionBracket[];
  tax_brackets: TaxBracket[];
  deduction_type_map: Record<string, { deduction_type_id: string; reduces_taxable_income: boolean }>;
  earning_type_map: Record<string, { earning_type_id: string; is_taxable: boolean }>;
}
