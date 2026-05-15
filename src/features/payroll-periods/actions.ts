"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit/log";
import { payrollPeriodSchema } from "./schemas";

export async function getPayrollPeriods() {
  const user = await requirePermission("PERIODS_VIEW");
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("payroll_periods")
    .select("*, payroll_frequencies(frequency_name)")
    .eq("company_id", user.company_id)
    .order("period_start_date", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createPayrollPeriod(formData: FormData) {
  const user = await requirePermission("PERIODS_CREATE");
  const supabase = await createServerSupabaseClient();

  const rawData = {
    frequency_id: formData.get("frequency_id") as string,
    period_code: formData.get("period_code") as string,
    period_name: formData.get("period_name") as string,
    period_start_date: formData.get("period_start_date") as string,
    period_end_date: formData.get("period_end_date") as string,
    cutoff_start_date: formData.get("cutoff_start_date") as string,
    cutoff_end_date: formData.get("cutoff_end_date") as string,
    pay_date: (formData.get("pay_date") as string) || null,
  };

  const parsed = payrollPeriodSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const periodData = {
    ...parsed.data,
    company_id: user.company_id,
    period_status: "OPEN",
    created_by_user_id: user.user_id,
  };

  const { data, error } = await supabase.from("payroll_periods").insert(periodData).select().single();
  if (error) return { error: error.message };

  // Insert initial status history
  await supabase.from("payroll_period_status_history").insert({
    payroll_period_id: data.payroll_period_id,
    old_status: null,
    new_status: "OPEN",
    changed_by_user_id: user.user_id,
  });

  await writeAuditLog({
    companyId: user.company_id, userId: user.user_id,
    actionCode: "PERIOD_CREATED", entityType: "payroll_periods",
    entityId: data.payroll_period_id, newValues: periodData as unknown as Record<string, unknown>,
  });

  return { data };
}

export async function updatePeriodStatus(periodId: string, newStatus: string, remarks?: string) {
  const user = await requirePermission("PERIODS_UPDATE");
  const supabase = await createServerSupabaseClient();

  const { data: period } = await supabase
    .from("payroll_periods")
    .select("period_status")
    .eq("payroll_period_id", periodId)
    .single();

  if (!period) return { error: "Period not found" };
  const oldStatus = period.period_status;

  const { error } = await supabase
    .from("payroll_periods")
    .update({ period_status: newStatus })
    .eq("payroll_period_id", periodId);
  if (error) return { error: error.message };

  await supabase.from("payroll_period_status_history").insert({
    payroll_period_id: periodId,
    old_status: oldStatus,
    new_status: newStatus,
    changed_by_user_id: user.user_id,
    remarks,
  });

  await writeAuditLog({
    companyId: user.company_id, userId: user.user_id,
    actionCode: "PERIOD_STATUS_CHANGED", entityType: "payroll_periods",
    entityId: periodId,
    oldValues: { period_status: oldStatus },
    newValues: { period_status: newStatus },
  });

  return { success: true };
}

export async function getPayrollFrequencies() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("payroll_frequencies").select("*").order("frequency_name");
  return data ?? [];
}
