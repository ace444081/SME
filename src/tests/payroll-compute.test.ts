import { describe, it, expect } from "vitest";
import { computeEmployeePayroll } from "@/lib/payroll/compute";
import type { EmployeePayrollInput, StatutoryReferences } from "@/lib/payroll/types";

// Minimal statutory references for testing
const testRefs: StatutoryReferences = {
  sss_brackets: [
    { contribution_bracket_id: "sss-1", reference_set_id: "sss-set", min_compensation: 0, max_compensation: 20000, salary_credit: null, employee_rate: 0.045, employer_rate: 0.085, employee_fixed_amount: null, employer_fixed_amount: null },
    { contribution_bracket_id: "sss-2", reference_set_id: "sss-set", min_compensation: 20001, max_compensation: 30000, salary_credit: null, employee_rate: 0.045, employer_rate: 0.085, employee_fixed_amount: null, employer_fixed_amount: null },
  ],
  philhealth_brackets: [
    { contribution_bracket_id: "ph-1", reference_set_id: "ph-set", min_compensation: 0, max_compensation: null, salary_credit: null, employee_rate: 0.025, employer_rate: 0.025, employee_fixed_amount: null, employer_fixed_amount: null },
  ],
  pagibig_brackets: [
    { contribution_bracket_id: "pi-1", reference_set_id: "pi-set", min_compensation: 0, max_compensation: null, salary_credit: null, employee_rate: null, employer_rate: null, employee_fixed_amount: 100, employer_fixed_amount: 100 },
  ],
  tax_brackets: [
    { tax_bracket_id: "tax-1", tax_table_id: "tax-table", bracket_no: 1, lower_bound: 0, upper_bound: 10417, base_tax_amount: 0, excess_over_amount: 0, marginal_rate: 0 },
    { tax_bracket_id: "tax-2", tax_table_id: "tax-table", bracket_no: 2, lower_bound: 10418, upper_bound: 16667, base_tax_amount: 0, excess_over_amount: 10417, marginal_rate: 0.15 },
    { tax_bracket_id: "tax-3", tax_table_id: "tax-table", bracket_no: 3, lower_bound: 16668, upper_bound: 33333, base_tax_amount: 937.50, excess_over_amount: 16667, marginal_rate: 0.20 },
  ],
  deduction_type_map: {
    SSS: { deduction_type_id: "dt-sss", reduces_taxable_income: true },
    PHILHEALTH: { deduction_type_id: "dt-ph", reduces_taxable_income: true },
    PAGIBIG: { deduction_type_id: "dt-pi", reduces_taxable_income: true },
    WITHHOLDING_TAX: { deduction_type_id: "dt-tax", reduces_taxable_income: false },
    CASH_ADVANCE: { deduction_type_id: "dt-ca", reduces_taxable_income: false },
    OTHER_DEDUCTION: { deduction_type_id: "dt-other", reduces_taxable_income: false },
  },
  earning_type_map: {
    BASIC_PAY: { earning_type_id: "et-basic", is_taxable: true },
    OVERTIME_PAY: { earning_type_id: "et-ot", is_taxable: true },
    HOLIDAY_PAY: { earning_type_id: "et-hol", is_taxable: true },
    REST_DAY_OT_PAY: { earning_type_id: "et-rd", is_taxable: true },
    MANUAL_EARNING_ADJUSTMENT: { earning_type_id: "et-manual", is_taxable: true },
  },
};

describe("Payroll Computation Engine", () => {
  it("computes monthly employee payroll correctly", () => {
    const input: EmployeePayrollInput = {
      employee_id: "emp-1",
      attendance_input_id: "att-1",
      rate_history_id: "rate-1",
      pay_basis: "MONTHLY",
      rate_amount: 18000,
      working_days_per_month: 26,
      working_hours_per_day: 8,
      overtime_multiplier: 1.25,
      days_worked: 26,
      regular_hours_worked: null,
      absence_days: 0,
      late_minutes: 0,
      undertime_minutes: 0,
      overtime_hours: 0,
      rest_day_overtime_hours: null,
      holiday_overtime_hours: null,
      manual_earnings: [],
      manual_deductions: [],
    };

    const result = computeEmployeePayroll(input, testRefs);

    expect(result.gross_pay).toBe(18000);
    expect(result.earnings).toHaveLength(1);
    expect(result.earnings[0].earning_code).toBe("BASIC_PAY");
    expect(result.deductions.length).toBeGreaterThan(0);
    expect(result.net_pay).toBeLessThan(result.gross_pay);
    expect(result.computation_status).toBe("OK");
  });

  it("computes daily employee with overtime correctly", () => {
    const input: EmployeePayrollInput = {
      employee_id: "emp-2",
      attendance_input_id: "att-2",
      rate_history_id: "rate-2",
      pay_basis: "DAILY",
      rate_amount: 600,
      working_days_per_month: 26,
      working_hours_per_day: 8,
      overtime_multiplier: 1.25,
      days_worked: 13,
      regular_hours_worked: null,
      absence_days: 0,
      late_minutes: 0,
      undertime_minutes: 0,
      overtime_hours: 5,
      rest_day_overtime_hours: null,
      holiday_overtime_hours: null,
      manual_earnings: [],
      manual_deductions: [],
    };

    const result = computeEmployeePayroll(input, testRefs);

    // Basic: 600 * 13 = 7800
    expect(result.earnings[0].amount).toBe(7800);
    // OT: (600/8) * 1.25 * 5 = 468.75
    expect(result.earnings).toHaveLength(2);
    expect(result.earnings[1].earning_code).toBe("OVERTIME_PAY");
    expect(result.earnings[1].amount).toBe(468.75);
    expect(result.gross_pay).toBe(8268.75);
  });

  it("handles absence deduction for monthly employees", () => {
    const input: EmployeePayrollInput = {
      employee_id: "emp-3",
      attendance_input_id: "att-3",
      rate_history_id: "rate-3",
      pay_basis: "MONTHLY",
      rate_amount: 18000,
      working_days_per_month: 26,
      working_hours_per_day: 8,
      overtime_multiplier: 1.25,
      days_worked: 24,
      regular_hours_worked: null,
      absence_days: 2,
      late_minutes: 0,
      undertime_minutes: 0,
      overtime_hours: 0,
      rest_day_overtime_hours: null,
      holiday_overtime_hours: null,
      manual_earnings: [],
      manual_deductions: [],
    };

    const result = computeEmployeePayroll(input, testRefs);

    // 18000 - (18000/26 * 2) = 18000 - 1384.62 = 16615.38
    const expectedBasic = Math.round((18000 - (18000 / 26) * 2) * 100) / 100;
    expect(result.gross_pay).toBe(expectedBasic);
  });

  it("includes manual earning adjustments", () => {
    const input: EmployeePayrollInput = {
      employee_id: "emp-4",
      attendance_input_id: "att-4",
      rate_history_id: "rate-4",
      pay_basis: "MONTHLY",
      rate_amount: 18000,
      working_days_per_month: 26,
      working_hours_per_day: 8,
      overtime_multiplier: 1.25,
      days_worked: 26,
      regular_hours_worked: null,
      absence_days: 0,
      late_minutes: 0,
      undertime_minutes: 0,
      overtime_hours: 0,
      rest_day_overtime_hours: null,
      holiday_overtime_hours: null,
      manual_earnings: [
        { manual_adjustment_id: "adj-1", adjustment_type_id: "at-1", adjustment_code: "COMMISSION", adjustment_name: "Commission", is_taxable: true, amount: 2000 },
      ],
      manual_deductions: [],
    };

    const result = computeEmployeePayroll(input, testRefs);

    expect(result.gross_pay).toBe(20000);
    expect(result.earnings).toHaveLength(2); // Basic + Commission
  });

  it("warns when net pay is negative", () => {
    const input: EmployeePayrollInput = {
      employee_id: "emp-5",
      attendance_input_id: "att-5",
      rate_history_id: "rate-5",
      pay_basis: "DAILY",
      rate_amount: 100,
      working_days_per_month: 26,
      working_hours_per_day: 8,
      overtime_multiplier: 1.25,
      days_worked: 1,
      regular_hours_worked: null,
      absence_days: 0,
      late_minutes: 0,
      undertime_minutes: 0,
      overtime_hours: 0,
      rest_day_overtime_hours: null,
      holiday_overtime_hours: null,
      manual_earnings: [],
      manual_deductions: [
        { manual_adjustment_id: "adj-2", adjustment_type_id: "at-2", adjustment_code: "CASH_ADVANCE", adjustment_name: "Cash Advance", is_taxable: false, amount: 500 },
      ],
    };

    const result = computeEmployeePayroll(input, testRefs);
    expect(result.computation_status).toBe("WARNING");
    expect(result.warning_message).toContain("negative");
  });
});
