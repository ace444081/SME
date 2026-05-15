/**
 * Payroll Computation Engine — Deductions Calculator
 *
 * Computes statutory deductions (SSS, PhilHealth, Pag-IBIG) and withholding tax
 * from contribution brackets. All values come from the database — nothing hardcoded.
 */

import type {
  DeductionLine,
  EmployerContributionLine,
  ContributionBracket,
  TaxBracket,
  StatutoryReferences,
  ManualAdjustment,
} from "./types";

/**
 * Look up the matching contribution bracket for a given monthly compensation.
 */
function findBracket(
  brackets: ContributionBracket[],
  monthlyCompensation: number
): ContributionBracket | null {
  for (const b of brackets) {
    const min = b.min_compensation;
    const max = b.max_compensation ?? Infinity;
    if (monthlyCompensation >= min && monthlyCompensation <= max) {
      return b;
    }
  }
  return null;
}

/**
 * Compute employee share from a bracket.
 * Uses fixed amount if present, otherwise rate × salary credit (or compensation).
 */
function computeEmployeeShare(bracket: ContributionBracket, compensation: number): number {
  if (bracket.employee_fixed_amount !== null) {
    return bracket.employee_fixed_amount;
  }
  if (bracket.employee_rate !== null) {
    const base = bracket.salary_credit ?? compensation;
    return round2(base * bracket.employee_rate);
  }
  return 0;
}

function computeEmployerShare(bracket: ContributionBracket, compensation: number): number {
  if (bracket.employer_fixed_amount !== null) {
    return bracket.employer_fixed_amount;
  }
  if (bracket.employer_rate !== null) {
    const base = bracket.salary_credit ?? compensation;
    return round2(base * bracket.employer_rate);
  }
  return 0;
}

/**
 * Compute all statutory deductions for a given gross pay.
 */
export function computeStatutoryDeductions(
  grossPay: number,
  refs: StatutoryReferences
): { deductions: DeductionLine[]; employerContributions: EmployerContributionLine[] } {
  const deductions: DeductionLine[] = [];
  const employerContributions: EmployerContributionLine[] = [];

  // SSS
  const sssBracket = findBracket(refs.sss_brackets, grossPay);
  if (sssBracket) {
    const sssTypeInfo = refs.deduction_type_map["SSS"];
    const eeShare = computeEmployeeShare(sssBracket, grossPay);
    const erShare = computeEmployerShare(sssBracket, grossPay);

    if (sssTypeInfo) {
      deductions.push({
        deduction_type_id: sssTypeInfo.deduction_type_id,
        deduction_code: "SSS",
        description: "SSS Contribution",
        amount: eeShare,
        reduces_taxable_income: sssTypeInfo.reduces_taxable_income,
        reference_set_id: sssBracket.reference_set_id,
        contribution_bracket_id: sssBracket.contribution_bracket_id,
        tax_bracket_id: null,
        source_manual_adjustment_id: null,
      });

      employerContributions.push({
        deduction_type_id: sssTypeInfo.deduction_type_id,
        deduction_code: "SSS",
        description: "SSS Employer Share",
        amount: erShare,
        reference_set_id: sssBracket.reference_set_id,
        contribution_bracket_id: sssBracket.contribution_bracket_id,
      });
    }
  }

  // PhilHealth
  const phBracket = findBracket(refs.philhealth_brackets, grossPay);
  if (phBracket) {
    const phTypeInfo = refs.deduction_type_map["PHILHEALTH"];
    const eeShare = computeEmployeeShare(phBracket, grossPay);
    const erShare = computeEmployerShare(phBracket, grossPay);

    if (phTypeInfo) {
      deductions.push({
        deduction_type_id: phTypeInfo.deduction_type_id,
        deduction_code: "PHILHEALTH",
        description: "PhilHealth Contribution",
        amount: eeShare,
        reduces_taxable_income: phTypeInfo.reduces_taxable_income,
        reference_set_id: phBracket.reference_set_id,
        contribution_bracket_id: phBracket.contribution_bracket_id,
        tax_bracket_id: null,
        source_manual_adjustment_id: null,
      });

      employerContributions.push({
        deduction_type_id: phTypeInfo.deduction_type_id,
        deduction_code: "PHILHEALTH",
        description: "PhilHealth Employer Share",
        amount: erShare,
        reference_set_id: phBracket.reference_set_id,
        contribution_bracket_id: phBracket.contribution_bracket_id,
      });
    }
  }

  // Pag-IBIG
  const pagibigBracket = findBracket(refs.pagibig_brackets, grossPay);
  if (pagibigBracket) {
    const piTypeInfo = refs.deduction_type_map["PAGIBIG"];
    const eeShare = computeEmployeeShare(pagibigBracket, grossPay);
    const erShare = computeEmployerShare(pagibigBracket, grossPay);

    if (piTypeInfo) {
      deductions.push({
        deduction_type_id: piTypeInfo.deduction_type_id,
        deduction_code: "PAGIBIG",
        description: "Pag-IBIG Contribution",
        amount: eeShare,
        reduces_taxable_income: piTypeInfo.reduces_taxable_income,
        reference_set_id: pagibigBracket.reference_set_id,
        contribution_bracket_id: pagibigBracket.contribution_bracket_id,
        tax_bracket_id: null,
        source_manual_adjustment_id: null,
      });

      employerContributions.push({
        deduction_type_id: piTypeInfo.deduction_type_id,
        deduction_code: "PAGIBIG",
        description: "Pag-IBIG Employer Share",
        amount: erShare,
        reference_set_id: pagibigBracket.reference_set_id,
        contribution_bracket_id: pagibigBracket.contribution_bracket_id,
      });
    }
  }

  return { deductions, employerContributions };
}

/**
 * Compute withholding tax given taxable income and tax brackets.
 */
export function computeWithholdingTax(
  taxableIncome: number,
  taxBrackets: TaxBracket[],
  deductionTypeId: string
): DeductionLine | null {
  if (taxableIncome <= 0 || taxBrackets.length === 0) return null;

  // Find the applicable bracket
  let matchedBracket: TaxBracket | null = null;
  for (const b of taxBrackets) {
    const lower = b.lower_bound;
    const upper = b.upper_bound ?? Infinity;
    if (taxableIncome >= lower && taxableIncome <= upper) {
      matchedBracket = b;
      break;
    }
  }

  if (!matchedBracket) return null;

  const excess = taxableIncome - matchedBracket.excess_over_amount;
  const tax = round2(matchedBracket.base_tax_amount + excess * matchedBracket.marginal_rate);

  if (tax <= 0) return null;

  return {
    deduction_type_id: deductionTypeId,
    deduction_code: "WITHHOLDING_TAX",
    description: "Withholding Tax",
    amount: tax,
    reduces_taxable_income: false,
    reference_set_id: null,
    contribution_bracket_id: null,
    tax_bracket_id: matchedBracket.tax_bracket_id,
    source_manual_adjustment_id: null,
  };
}

/**
 * Add manual deduction lines.
 */
export function computeManualDeductions(
  manualDeductions: ManualAdjustment[],
  deductionTypeMap: Record<string, { deduction_type_id: string; reduces_taxable_income: boolean }>
): DeductionLine[] {
  return manualDeductions.map((adj) => {
    const typeInfo = deductionTypeMap["OTHER_DEDUCTION"] ?? deductionTypeMap["CASH_ADVANCE"];
    return {
      deduction_type_id: typeInfo?.deduction_type_id ?? "",
      deduction_code: adj.adjustment_code,
      description: adj.adjustment_name,
      amount: adj.amount,
      reduces_taxable_income: false,
      reference_set_id: null,
      contribution_bracket_id: null,
      tax_bracket_id: null,
      source_manual_adjustment_id: adj.manual_adjustment_id,
    };
  });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
