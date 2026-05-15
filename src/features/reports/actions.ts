"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit/log";

/**
 * Get payroll summary for a run.
 */
export async function getPayrollSummary(runId: string) {
  await requirePermission("REPORTS_VIEW");
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("v_payroll_period_summary")
    .select("*")
    .eq("payroll_run_id", runId)
    .single();

  return data;
}

/**
 * Get audit logs for display.
 */
export async function getAuditLogs(params?: { limit?: number; entityType?: string }) {
  const user = await requirePermission("AUDIT_VIEW");
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from("audit_logs")
    .select("*, users(username)")
    .eq("company_id", user.company_id)
    .order("created_at", { ascending: false })
    .limit(params?.limit ?? 100);

  if (params?.entityType) {
    query = query.eq("entity_type", params.entityType);
  }

  const { data } = await query;
  return data ?? [];
}

/**
 * Create a report export record.
 */
export async function createReportExport(params: {
  payrollPeriodId?: string;
  payrollRunId?: string;
  reportType: string;
  fileFormat: string;
}) {
  const user = await requirePermission("REPORTS_GENERATE");
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("report_exports")
    .insert({
      company_id: user.company_id,
      payroll_period_id: params.payrollPeriodId,
      payroll_run_id: params.payrollRunId,
      report_type: params.reportType,
      file_format: params.fileFormat,
      generated_by_user_id: user.user_id,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await writeAuditLog({
    companyId: user.company_id, userId: user.user_id,
    actionCode: "REPORT_GENERATED", entityType: "report_exports",
    entityId: data.report_export_id,
    newValues: { report_type: params.reportType, file_format: params.fileFormat },
  });

  return { data };
}
