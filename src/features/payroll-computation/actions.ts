"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit/log";
import { computeBatchPayroll } from "@/lib/payroll";
import type { EmployeePayrollInput, StatutoryReferences } from "@/lib/payroll";

/**
 * Fetch all statutory references needed for payroll computation.
 */
async function loadStatutoryReferences(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>): Promise<StatutoryReferences> {
  // Load active reference sets with brackets
  const { data: refSets } = await supabase
    .from("statutory_reference_sets")
    .select("*, deduction_types(deduction_code)")
    .eq("is_active", true);

  const sssSetId = refSets?.find(r => (r.deduction_types as { deduction_code: string })?.deduction_code === "SSS")?.reference_set_id;
  const phSetId = refSets?.find(r => (r.deduction_types as { deduction_code: string })?.deduction_code === "PHILHEALTH")?.reference_set_id;
  const piSetId = refSets?.find(r => (r.deduction_types as { deduction_code: string })?.deduction_code === "PAGIBIG")?.reference_set_id;

  const loadBrackets = async (setId: string | undefined) => {
    if (!setId) return [];
    const { data } = await supabase
      .from("statutory_contribution_brackets")
      .select("*")
      .eq("reference_set_id", setId)
      .order("min_compensation");
    return data ?? [];
  };

  const [sssBrackets, phBrackets, piBrackets] = await Promise.all([
    loadBrackets(sssSetId),
    loadBrackets(phSetId),
    loadBrackets(piSetId),
  ]);

  // Load tax brackets (latest active)
  const { data: taxTable } = await supabase
    .from("withholding_tax_tables")
    .select("tax_table_id")
    .order("effective_from", { ascending: false })
    .limit(1)
    .single();

  let taxBrackets: StatutoryReferences["tax_brackets"] = [];
  if (taxTable) {
    const { data } = await supabase
      .from("withholding_tax_brackets")
      .select("*")
      .eq("tax_table_id", taxTable.tax_table_id)
      .order("bracket_no");
    taxBrackets = data ?? [];
  }

  // Load deduction type map
  const { data: dedTypes } = await supabase.from("deduction_types").select("deduction_type_id, deduction_code, reduces_taxable_income");
  const deduction_type_map: StatutoryReferences["deduction_type_map"] = {};
  for (const dt of dedTypes ?? []) {
    deduction_type_map[dt.deduction_code] = { deduction_type_id: dt.deduction_type_id, reduces_taxable_income: dt.reduces_taxable_income };
  }

  // Load earning type map
  const { data: earnTypes } = await supabase.from("earning_types").select("earning_type_id, earning_code, is_taxable");
  const earning_type_map: StatutoryReferences["earning_type_map"] = {};
  for (const et of earnTypes ?? []) {
    earning_type_map[et.earning_code] = { earning_type_id: et.earning_type_id, is_taxable: et.is_taxable };
  }

  return {
    sss_brackets: sssBrackets,
    philhealth_brackets: phBrackets,
    pagibig_brackets: piBrackets,
    tax_brackets: taxBrackets,
    deduction_type_map,
    earning_type_map,
  };
}

/**
 * Run payroll computation for a payroll period.
 */
export async function runPayrollComputation(periodId: string) {
  const user = await requirePermission("PAYROLL_COMPUTE");
  const supabase = await createServerSupabaseClient();

  // 1. Validate period status
  const { data: period } = await supabase
    .from("payroll_periods")
    .select("period_status, company_id")
    .eq("payroll_period_id", periodId)
    .single();

  if (!period) return { error: "Period not found" };
  if (!["OPEN", "RETURNED", "REOPENED"].includes(period.period_status)) {
    return { error: `Cannot compute payroll for a ${period.period_status} period` };
  }

  // 2. Get attendance inputs
  const { data: inputs } = await supabase
    .from("attendance_payroll_inputs")
    .select("*")
    .eq("payroll_period_id", periodId)
    .in("input_status", ["DRAFT", "VALIDATED", "CORRECTED"]);

  if (!inputs || inputs.length === 0) {
    return { error: "No attendance inputs found for this period" };
  }

  // 3. Load company settings
  const { data: settings } = await supabase
    .from("company_payroll_settings")
    .select("*")
    .eq("company_id", period.company_id)
    .is("effective_to", null)
    .order("effective_from", { ascending: false })
    .limit(1)
    .single();

  if (!settings) return { error: "Company payroll settings not configured" };

  // 4. Load employee rates
  const employeeIds = inputs.map(i => i.employee_id);
  const { data: rates } = await supabase
    .from("employee_rate_history")
    .select("*")
    .in("employee_id", employeeIds)
    .is("effective_to", null);

  const rateMap = new Map((rates ?? []).map(r => [r.employee_id, r]));

  // 5. Load manual adjustments
  const { data: adjustments } = await supabase
    .from("manual_payroll_adjustments")
    .select("*, manual_adjustment_types(adjustment_code, adjustment_name, adjustment_class, is_taxable)")
    .eq("payroll_period_id", periodId);

  const adjByEmployee = new Map<string, typeof adjustments>();
  for (const adj of adjustments ?? []) {
    const existing = adjByEmployee.get(adj.employee_id) ?? [];
    existing.push(adj);
    adjByEmployee.set(adj.employee_id, existing);
  }

  // 6. Load statutory references
  const refs = await loadStatutoryReferences(supabase);

  // 7. Build computation inputs
  const computationInputs: EmployeePayrollInput[] = [];
  const skippedEmployees: string[] = [];

  for (const input of inputs) {
    const rate = rateMap.get(input.employee_id);
    if (!rate) {
      skippedEmployees.push(input.employee_id);
      continue;
    }

    const empAdjs = adjByEmployee.get(input.employee_id) ?? [];
    const manualEarnings = empAdjs
      .filter(a => (a.manual_adjustment_types as { adjustment_class: string })?.adjustment_class === "EARNING")
      .map(a => ({
        manual_adjustment_id: a.manual_adjustment_id,
        adjustment_type_id: a.adjustment_type_id,
        adjustment_code: (a.manual_adjustment_types as { adjustment_code: string })?.adjustment_code ?? "",
        adjustment_name: (a.manual_adjustment_types as { adjustment_name: string })?.adjustment_name ?? "",
        is_taxable: (a.manual_adjustment_types as { is_taxable: boolean })?.is_taxable ?? false,
        amount: a.amount,
      }));
    const manualDeductions = empAdjs
      .filter(a => (a.manual_adjustment_types as { adjustment_class: string })?.adjustment_class === "DEDUCTION")
      .map(a => ({
        manual_adjustment_id: a.manual_adjustment_id,
        adjustment_type_id: a.adjustment_type_id,
        adjustment_code: (a.manual_adjustment_types as { adjustment_code: string })?.adjustment_code ?? "",
        adjustment_name: (a.manual_adjustment_types as { adjustment_name: string })?.adjustment_name ?? "",
        is_taxable: (a.manual_adjustment_types as { is_taxable: boolean })?.is_taxable ?? false,
        amount: a.amount,
      }));

    computationInputs.push({
      employee_id: input.employee_id,
      attendance_input_id: input.attendance_input_id,
      rate_history_id: rate.rate_history_id,
      pay_basis: rate.pay_basis,
      rate_amount: rate.rate_amount,
      working_days_per_month: settings.default_working_days_per_month,
      working_hours_per_day: settings.default_working_hours_per_day,
      overtime_multiplier: settings.default_overtime_multiplier,
      days_worked: input.days_worked,
      regular_hours_worked: input.regular_hours_worked,
      absence_days: input.absence_days,
      late_minutes: input.late_minutes,
      undertime_minutes: input.undertime_minutes,
      overtime_hours: input.overtime_hours,
      rest_day_overtime_hours: input.rest_day_overtime_hours,
      holiday_overtime_hours: input.holiday_overtime_hours,
      manual_earnings: manualEarnings,
      manual_deductions: manualDeductions,
    });
  }

  // 8. Run computation
  const results = computeBatchPayroll(computationInputs, refs);

  // 9. Create payroll run
  const { data: existingRuns } = await supabase
    .from("payroll_runs")
    .select("run_number")
    .eq("payroll_period_id", periodId)
    .order("run_number", { ascending: false })
    .limit(1);

  const nextRunNumber = (existingRuns?.[0]?.run_number ?? 0) + 1;

  const { data: payrollRun, error: runError } = await supabase
    .from("payroll_runs")
    .insert({
      payroll_period_id: periodId,
      run_number: nextRunNumber,
      run_status: "COMPUTED",
      computed_by_user_id: user.user_id,
      formula_version: "1.0.0",
      remarks: skippedEmployees.length > 0 ? `Skipped ${skippedEmployees.length} employees (missing rate)` : null,
    })
    .select()
    .single();

  if (runError) return { error: runError.message };

  // 10. Insert results and lines
  for (const result of results) {
    const { data: empResult, error: resultError } = await supabase
      .from("payroll_employee_results")
      .insert({
        payroll_run_id: payrollRun.payroll_run_id,
        employee_id: result.employee_id,
        attendance_input_id: result.attendance_input_id,
        rate_history_id: result.rate_history_id,
        computation_status: result.computation_status,
        warning_message: result.warning_message,
      })
      .select()
      .single();

    if (resultError) continue;

    // Insert earning lines
    if (result.earnings.length > 0) {
      await supabase.from("payroll_earning_lines").insert(
        result.earnings.map((e) => ({
          payroll_employee_result_id: empResult.payroll_employee_result_id,
          earning_type_id: e.earning_type_id,
          source_manual_adjustment_id: e.source_manual_adjustment_id,
          description: e.description,
          quantity: e.quantity,
          rate_used: e.rate_used,
          amount: e.amount,
          is_taxable: e.is_taxable,
        }))
      );
    }

    // Insert deduction lines
    if (result.deductions.length > 0) {
      await supabase.from("payroll_deduction_lines").insert(
        result.deductions.map((d) => ({
          payroll_employee_result_id: empResult.payroll_employee_result_id,
          deduction_type_id: d.deduction_type_id,
          reference_set_id: d.reference_set_id,
          contribution_bracket_id: d.contribution_bracket_id,
          tax_bracket_id: d.tax_bracket_id,
          source_manual_adjustment_id: d.source_manual_adjustment_id,
          description: d.description,
          amount: d.amount,
          reduces_taxable_income: d.reduces_taxable_income,
        }))
      );
    }

    // Insert employer contribution lines
    if (result.employer_contributions.length > 0) {
      await supabase.from("payroll_employer_contribution_lines").insert(
        result.employer_contributions.map((c) => ({
          payroll_employee_result_id: empResult.payroll_employee_result_id,
          deduction_type_id: c.deduction_type_id,
          reference_set_id: c.reference_set_id,
          contribution_bracket_id: c.contribution_bracket_id,
          description: c.description,
          amount: c.amount,
        }))
      );
    }
  }

  // 11. Update attendance input statuses to LOCKED
  await supabase
    .from("attendance_payroll_inputs")
    .update({ input_status: "LOCKED" })
    .eq("payroll_period_id", periodId)
    .in("input_status", ["DRAFT", "VALIDATED", "CORRECTED"]);

  // 12. Update period status to COMPUTED
  await supabase
    .from("payroll_periods")
    .update({ period_status: "COMPUTED" })
    .eq("payroll_period_id", periodId);

  // 13. Audit
  await writeAuditLog({
    companyId: user.company_id,
    userId: user.user_id,
    actionCode: "PAYROLL_COMPUTED",
    entityType: "payroll_runs",
    entityId: payrollRun.payroll_run_id,
    newValues: {
      period_id: periodId,
      run_number: nextRunNumber,
      employees_computed: results.length,
      employees_skipped: skippedEmployees.length,
    },
  });

  return {
    data: {
      payroll_run_id: payrollRun.payroll_run_id,
      run_number: nextRunNumber,
      employees_computed: results.length,
      employees_skipped: skippedEmployees.length,
    },
  };
}

/**
 * Get payroll runs for a period.
 */
export async function getPayrollRuns(periodId?: string) {
  const user = await requirePermission("PAYROLL_COMPUTE");
  const supabase = await createServerSupabaseClient();
  let query = supabase
    .from("payroll_runs")
    .select("*, payroll_periods(period_code, period_name, period_status)")
    .order("computed_at", { ascending: false });

  if (periodId) {
    query = query.eq("payroll_period_id", periodId);
  }

  const { data } = await query;
  return data ?? [];
}

/**
 * Get detailed results for a payroll run.
 */
export async function getPayrollRunResults(runId: string) {
  await requirePermission("PAYROLL_REVIEW");
  const supabase = await createServerSupabaseClient();

  const { data: results } = await supabase
    .from("payroll_employee_results")
    .select("*, employees(employee_no, first_name, last_name)")
    .eq("payroll_run_id", runId);

  // Get totals from the view
  const { data: totals } = await supabase
    .from("v_payroll_employee_totals")
    .select("*")
    .eq("payroll_run_id", runId);

  return { results: results ?? [], totals: totals ?? [] };
}
