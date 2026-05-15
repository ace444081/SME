"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit/log";

/**
 * Generate payslips for a finalized payroll run.
 * Only allowed for FINALIZED runs per checklist rules.
 */
export async function generatePayslips(runId: string) {
  const user = await requirePermission("PAYSLIPS_GENERATE");
  const supabase = await createServerSupabaseClient();

  // 1. Verify run is FINALIZED
  const { data: run } = await supabase
    .from("payroll_runs")
    .select("run_status, payroll_period_id, run_number")
    .eq("payroll_run_id", runId)
    .single();

  if (!run) return { error: "Run not found" };
  if (run.run_status !== "FINALIZED") {
    return { error: "Payslips can only be generated from FINALIZED payroll runs" };
  }

  // 2. Verify period is FINALIZED
  const { data: period } = await supabase
    .from("payroll_periods")
    .select("period_status, period_code")
    .eq("payroll_period_id", run.payroll_period_id)
    .single();

  if (!period || period.period_status !== "FINALIZED") {
    return { error: "Payslips can only be generated for FINALIZED payroll periods" };
  }

  // 3. Get employee results
  const { data: results } = await supabase
    .from("payroll_employee_results")
    .select("payroll_employee_result_id, employee_id, employees(employee_no, first_name, last_name)")
    .eq("payroll_run_id", runId);

  if (!results || results.length === 0) return { error: "No results found" };

  // 4. Check for existing payslips
  const existingResultIds = results.map(r => r.payroll_employee_result_id);
  const { data: existing } = await supabase
    .from("payslips")
    .select("payroll_employee_result_id")
    .in("payroll_employee_result_id", existingResultIds)
    .in("payslip_status", ["GENERATED", "RELEASED"]);

  const alreadyGenerated = new Set((existing ?? []).map(e => e.payroll_employee_result_id));

  // 5. Generate payslips for employees without one
  const payslipsToInsert = results
    .filter(r => !alreadyGenerated.has(r.payroll_employee_result_id))
    .map((r, index) => {
      const emp = r.employees as unknown as { employee_no: string } | null;
      return {
        payroll_employee_result_id: r.payroll_employee_result_id,
        payslip_no: `PS-${period.period_code}-${emp?.employee_no ?? index}`,
        payslip_status: "GENERATED",
        generated_by_user_id: user.user_id,
      };
    });

  if (payslipsToInsert.length === 0) {
    return { data: { generated: 0, message: "All payslips already generated" } };
  }

  const { error } = await supabase.from("payslips").insert(payslipsToInsert);
  if (error) return { error: error.message };

  await writeAuditLog({
    companyId: user.company_id, userId: user.user_id,
    actionCode: "PAYSLIPS_GENERATED", entityType: "payslips",
    entityId: runId,
    newValues: { count: payslipsToInsert.length, period_code: period.period_code },
  });

  return { data: { generated: payslipsToInsert.length } };
}

/**
 * Get payslips for display.
 */
export async function getPayslips(runId?: string) {
  await requirePermission("PAYSLIPS_VIEW");
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("payslips")
    .select(`
      *,
      payroll_employee_results(
        payroll_run_id,
        employees(employee_no, first_name, last_name),
        payroll_runs(run_number, payroll_periods(period_code, period_name))
      )
    `)
    .order("generated_at", { ascending: false });

  if (runId) {
    query = query.eq("payroll_employee_results.payroll_run_id", runId);
  }

  const { data } = await query;
  return data ?? [];
}

/**
 * Get detailed payslip data for a single employee result.
 */
export async function getPayslipDetail(resultId: string) {
  await requirePermission("PAYSLIPS_VIEW");
  const supabase = await createServerSupabaseClient();

  const { data: result } = await supabase
    .from("payroll_employee_results")
    .select("*, employees(employee_no, first_name, middle_name, last_name, departments(department_name), job_positions(position_title))")
    .eq("payroll_employee_result_id", resultId)
    .single();

  const { data: earnings } = await supabase
    .from("payroll_earning_lines")
    .select("*, earning_types(earning_code, earning_name)")
    .eq("payroll_employee_result_id", resultId);

  const { data: deductions } = await supabase
    .from("payroll_deduction_lines")
    .select("*, deduction_types(deduction_code, deduction_name)")
    .eq("payroll_employee_result_id", resultId);

  const { data: totals } = await supabase
    .from("v_payroll_employee_totals")
    .select("*")
    .eq("payroll_employee_result_id", resultId)
    .single();

  return { result, earnings: earnings ?? [], deductions: deductions ?? [], totals };
}
