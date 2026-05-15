"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit/log";
import { attendanceInputSchema } from "./schemas";

export async function getAttendanceInputs(periodId: string) {
  const user = await requirePermission("ATTENDANCE_VIEW");
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("attendance_payroll_inputs")
    .select("*, employees(employee_no, first_name, last_name)")
    .eq("payroll_period_id", periodId)
    .order("employees(employee_no)");
  if (error) throw new Error(error.message);

  // Also get employees who don't have inputs yet
  const { data: allEmployees } = await supabase
    .from("employees")
    .select("employee_id, employee_no, first_name, last_name")
    .eq("company_id", user.company_id)
    .in("employment_status_id",
      (await supabase.from("employment_statuses").select("employment_status_id").eq("status_code", "ACTIVE")).data?.map(s => s.employment_status_id) ?? []
    );

  return { inputs: data ?? [], employees: allEmployees ?? [] };
}

export async function saveAttendanceInput(formData: FormData) {
  const user = await requirePermission("ATTENDANCE_ENCODE");
  const supabase = await createServerSupabaseClient();

  const periodId = formData.get("payroll_period_id") as string;

  // Check period status — must be OPEN, RETURNED, or REOPENED
  const { data: period } = await supabase
    .from("payroll_periods")
    .select("period_status")
    .eq("payroll_period_id", periodId)
    .single();

  if (!period || !["OPEN", "RETURNED", "REOPENED"].includes(period.period_status)) {
    return { error: `Cannot encode attendance for a ${period?.period_status ?? "unknown"} period` };
  }

  const rawData = {
    payroll_period_id: formData.get("payroll_period_id") as string,
    employee_id: formData.get("employee_id") as string,
    days_worked: formData.get("days_worked") as string,
    regular_hours_worked: formData.get("regular_hours_worked") as string || null,
    absence_days: formData.get("absence_days") as string || "0",
    late_minutes: formData.get("late_minutes") as string || "0",
    undertime_minutes: formData.get("undertime_minutes") as string || "0",
    overtime_hours: formData.get("overtime_hours") as string || "0",
    rest_day_overtime_hours: formData.get("rest_day_overtime_hours") as string || null,
    holiday_overtime_hours: formData.get("holiday_overtime_hours") as string || null,
    remarks: (formData.get("remarks") as string) || null,
  };

  const parsed = attendanceInputSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const inputData = {
    ...parsed.data,
    source_type: "MANUAL",
    input_status: "DRAFT",
    encoded_by_user_id: user.user_id,
  };

  const { data, error } = await supabase
    .from("attendance_payroll_inputs")
    .upsert(inputData, { onConflict: "payroll_period_id,employee_id" })
    .select()
    .single();

  if (error) return { error: error.message };

  await writeAuditLog({
    companyId: user.company_id, userId: user.user_id,
    actionCode: "ATTENDANCE_ENCODED", entityType: "attendance_payroll_inputs",
    entityId: data.attendance_input_id,
    newValues: inputData as unknown as Record<string, unknown>,
  });

  return { data };
}

export async function getManualAdjustments(periodId: string, employeeId: string) {
  await requirePermission("ATTENDANCE_VIEW");
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("manual_payroll_adjustments")
    .select("*, manual_adjustment_types(adjustment_code, adjustment_name, adjustment_class)")
    .eq("payroll_period_id", periodId)
    .eq("employee_id", employeeId);
  return data ?? [];
}

export async function addManualAdjustment(formData: FormData) {
  const user = await requirePermission("ATTENDANCE_ENCODE");
  const supabase = await createServerSupabaseClient();

  const adjData = {
    payroll_period_id: formData.get("payroll_period_id") as string,
    employee_id: formData.get("employee_id") as string,
    adjustment_type_id: formData.get("adjustment_type_id") as string,
    amount: parseFloat(formData.get("amount") as string),
    remarks: (formData.get("remarks") as string) || null,
    created_by_user_id: user.user_id,
  };

  const { data, error } = await supabase.from("manual_payroll_adjustments").insert(adjData).select().single();
  if (error) return { error: error.message };

  await writeAuditLog({
    companyId: user.company_id, userId: user.user_id,
    actionCode: "MANUAL_ADJUSTMENT_ADDED", entityType: "manual_payroll_adjustments",
    entityId: data.manual_adjustment_id,
    newValues: adjData as unknown as Record<string, unknown>,
  });

  return { data };
}
