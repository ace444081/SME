/**
 * Payroll Computation Engine — Main Orchestrator
 *
 * This is the top-level function that computes payroll for a single employee.
 * It calls earnings and deductions calculators, then assembles the result.
 */

import { computeEarnings } from "./earnings";
import {
  computeStatutoryDeductions,
  computeWithholdingTax,
  computeManualDeductions,
} from "./deductions";
import type {
  EmployeePayrollInput,
  ComputedPayroll,
  StatutoryReferences,
} from "./types";

/**
 * Compute payroll for a single employee.
 * Pure function — no side effects, no database access.
 */
export function computeEmployeePayroll(
  input: EmployeePayrollInput,
  refs: StatutoryReferences
): ComputedPayroll {
  const warnings: string[] = [];

  // Step 1: Compute earnings
  const earnings = computeEarnings(input, refs);
  const grossPay = round2(earnings.reduce((sum, e) => sum + e.amount, 0));

  // Step 2: Compute statutory deductions
  const { deductions: statutoryDeductions, employerContributions } =
    computeStatutoryDeductions(grossPay, refs);

  // Step 3: Compute taxable income
  // Taxable income = gross pay - deductions that reduce taxable income (SSS, PhilHealth, Pag-IBIG)
  const preTaxDeductions = statutoryDeductions
    .filter((d) => d.reduces_taxable_income)
    .reduce((sum, d) => sum + d.amount, 0);

  // Also exclude non-taxable earnings
  const nonTaxableEarnings = earnings
    .filter((e) => !e.is_taxable)
    .reduce((sum, e) => sum + e.amount, 0);

  const taxableIncome = round2(grossPay - preTaxDeductions - nonTaxableEarnings);

  // Step 4: Compute withholding tax
  const taxTypeInfo = refs.deduction_type_map["WITHHOLDING_TAX"];
  const taxLine = taxTypeInfo
    ? computeWithholdingTax(taxableIncome, refs.tax_brackets, taxTypeInfo.deduction_type_id)
    : null;

  // Step 5: Manual deductions
  const manualDeductionLines = computeManualDeductions(
    input.manual_deductions,
    refs.deduction_type_map
  );

  // Step 6: Assemble all deductions
  const allDeductions = [...statutoryDeductions];
  if (taxLine) allDeductions.push(taxLine);
  allDeductions.push(...manualDeductionLines);

  const totalDeductions = round2(allDeductions.reduce((sum, d) => sum + d.amount, 0));
  const totalEmployerContributions = round2(
    employerContributions.reduce((sum, c) => sum + c.amount, 0)
  );
  const netPay = round2(grossPay - totalDeductions);

  // Step 7: Validate
  if (netPay < 0) {
    warnings.push("Net pay is negative — deductions exceed gross pay");
  }
  if (grossPay === 0) {
    warnings.push("Gross pay is zero");
  }

  const computationStatus =
    warnings.length > 0 ? "WARNING" : "OK";

  return {
    employee_id: input.employee_id,
    attendance_input_id: input.attendance_input_id,
    rate_history_id: input.rate_history_id,
    earnings,
    deductions: allDeductions,
    employer_contributions: employerContributions,
    gross_pay: grossPay,
    total_deductions: totalDeductions,
    total_employer_contributions: totalEmployerContributions,
    net_pay: netPay,
    taxable_income: taxableIncome,
    computation_status: computationStatus,
    warning_message: warnings.length > 0 ? warnings.join("; ") : null,
  };
}

/**
 * Compute payroll for all employees in a batch.
 */
export function computeBatchPayroll(
  inputs: EmployeePayrollInput[],
  refs: StatutoryReferences
): ComputedPayroll[] {
  return inputs.map((input) => computeEmployeePayroll(input, refs));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
