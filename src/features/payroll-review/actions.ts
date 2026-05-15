"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit/log";

/**
 * Submit a payroll run for review.
 * Allowed from: COMPUTED
 * Transitions to: SUBMITTED
 */
export async function submitPayrollForReview(runId: string, remarks?: string) {
  const user = await requirePermission("PAYROLL_SUBMIT");
  const supabase = await createServerSupabaseClient();

  const { data: run } = await supabase.from("payroll_runs").select("run_status, payroll_period_id").eq("payroll_run_id", runId).single();
  if (!run) return { error: "Run not found" };
  if (run.run_status !== "COMPUTED") return { error: `Cannot submit a ${run.run_status} run` };

  const { error } = await supabase.from("payroll_runs").update({ run_status: "SUBMITTED" }).eq("payroll_run_id", runId);
  if (error) return { error: error.message };

  await supabase.from("payroll_periods").update({ period_status: "SUBMITTED" }).eq("payroll_period_id", run.payroll_period_id);

  await supabase.from("payroll_review_actions").insert({
    payroll_run_id: runId, action_type: "SUBMIT", action_by_user_id: user.user_id, remarks,
  });

  await writeAuditLog({
    companyId: user.company_id, userId: user.user_id,
    actionCode: "PAYROLL_SUBMITTED", entityType: "payroll_runs", entityId: runId,
  });

  return { success: true };
}

/**
 * Return a payroll run for correction.
 * Allowed from: SUBMITTED
 * Transitions to: RETURNED (run) + RETURNED (period)
 */
export async function returnPayrollForCorrection(runId: string, remarks: string) {
  const user = await requirePermission("PAYROLL_RETURN");
  const supabase = await createServerSupabaseClient();

  const { data: run } = await supabase.from("payroll_runs").select("run_status, payroll_period_id").eq("payroll_run_id", runId).single();
  if (!run) return { error: "Run not found" };
  if (run.run_status !== "SUBMITTED") return { error: `Cannot return a ${run.run_status} run` };

  await supabase.from("payroll_runs").update({ run_status: "RETURNED" }).eq("payroll_run_id", runId);
  await supabase.from("payroll_periods").update({ period_status: "RETURNED" }).eq("payroll_period_id", run.payroll_period_id);

  // Unlock attendance inputs
  await supabase
    .from("attendance_payroll_inputs")
    .update({ input_status: "CORRECTED" })
    .eq("payroll_period_id", run.payroll_period_id)
    .eq("input_status", "LOCKED");

  await supabase.from("payroll_review_actions").insert({
    payroll_run_id: runId, action_type: "RETURN", action_by_user_id: user.user_id, remarks,
  });

  await supabase.from("payroll_period_status_history").insert({
    payroll_period_id: run.payroll_period_id, old_status: "SUBMITTED", new_status: "RETURNED",
    changed_by_user_id: user.user_id, remarks,
  });

  await writeAuditLog({
    companyId: user.company_id, userId: user.user_id,
    actionCode: "PAYROLL_RETURNED", entityType: "payroll_runs", entityId: runId,
    newValues: { remarks },
  });

  return { success: true };
}

/**
 * Finalize a payroll run.
 * Allowed from: SUBMITTED
 * Transitions to: FINALIZED (run) + FINALIZED (period)
 * THIS IS THE CRITICAL ACTION — after this, data is locked by DB triggers.
 */
export async function finalizePayroll(runId: string, remarks?: string) {
  const user = await requirePermission("PAYROLL_FINALIZE");
  const supabase = await createServerSupabaseClient();

  const { data: run } = await supabase.from("payroll_runs").select("run_status, payroll_period_id").eq("payroll_run_id", runId).single();
  if (!run) return { error: "Run not found" };
  if (run.run_status !== "SUBMITTED") return { error: `Cannot finalize a ${run.run_status} run` };

  // Finalize run
  await supabase.from("payroll_runs").update({ run_status: "FINALIZED" }).eq("payroll_run_id", runId);

  // Finalize period
  await supabase.from("payroll_periods").update({ period_status: "FINALIZED" }).eq("payroll_period_id", run.payroll_period_id);

  await supabase.from("payroll_review_actions").insert({
    payroll_run_id: runId, action_type: "FINALIZE", action_by_user_id: user.user_id, remarks,
  });

  await supabase.from("payroll_period_status_history").insert({
    payroll_period_id: run.payroll_period_id, old_status: "SUBMITTED", new_status: "FINALIZED",
    changed_by_user_id: user.user_id, remarks,
  });

  await writeAuditLog({
    companyId: user.company_id, userId: user.user_id,
    actionCode: "PAYROLL_FINALIZED", entityType: "payroll_runs", entityId: runId,
    newValues: { period_id: run.payroll_period_id },
  });

  return { success: true };
}

/**
 * Reopen a finalized payroll period (P1 feature).
 * Allowed from: FINALIZED
 * Transitions to: REOPENED
 */
export async function reopenPayroll(periodId: string, remarks: string) {
  const user = await requirePermission("PAYROLL_REOPEN");
  const supabase = await createServerSupabaseClient();

  const { data: period } = await supabase.from("payroll_periods").select("period_status").eq("payroll_period_id", periodId).single();
  if (!period) return { error: "Period not found" };
  if (period.period_status !== "FINALIZED") return { error: `Cannot reopen a ${period.period_status} period` };

  // Reopen period
  await supabase.from("payroll_periods").update({ period_status: "REOPENED" }).eq("payroll_period_id", periodId);

  // Void the finalized run
  await supabase.from("payroll_runs")
    .update({ run_status: "VOIDED" })
    .eq("payroll_period_id", periodId)
    .eq("run_status", "FINALIZED");

  await supabase.from("payroll_period_status_history").insert({
    payroll_period_id: periodId, old_status: "FINALIZED", new_status: "REOPENED",
    changed_by_user_id: user.user_id, remarks,
  });

  await writeAuditLog({
    companyId: user.company_id, userId: user.user_id,
    actionCode: "PAYROLL_REOPENED", entityType: "payroll_periods", entityId: periodId,
    newValues: { remarks },
  });

  return { success: true };
}

/**
 * Get review actions for a run.
 */
export async function getReviewHistory(runId: string) {
  await requirePermission("PAYROLL_REVIEW");
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("payroll_review_actions")
    .select("*, users(username)")
    .eq("payroll_run_id", runId)
    .order("action_at", { ascending: false });
  return data ?? [];
}
