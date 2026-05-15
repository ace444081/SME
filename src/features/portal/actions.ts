"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

/**
 * Ensures the logged in user has an associated employee record,
 * which is required for all portal actions.
 */
async function requireEmployeeRecord() {
  // EMPLOYEE_PORTAL is a permission we'd need to add, or just let basic auth handle it.
  // For now, any logged in user who has a record in `employees` mapped by email or user_id can access.
  // Actually, users table doesn't have an explicit link to employees in our schema.
  // We can look up the employee by matching the user's email to employee email.
  const supabase = await createServerSupabaseClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const { data: emp, error } = await supabase
    .from("employees")
    .select("employee_id, company_id")
    .eq("email", userData.user.email)
    .single();

  if (error || !emp) {
    throw new Error("No employee record associated with your account.");
  }

  return emp;
}

export async function getPortalDashboard() {
  const emp = await requireEmployeeRecord();
  const supabase = await createServerSupabaseClient();

  const { data: profile } = await supabase
    .from("employees")
    .select(`
      employee_no, first_name, last_name, 
      job_positions(position_title),
      departments(department_name)
    `)
    .eq("employee_id", emp.employee_id)
    .single();

  const { data: recentPayslips } = await supabase
    .from("payslips")
    .select("*, payroll_employee_results(payroll_runs(payroll_periods(period_name)))")
    .eq("payroll_employee_result_id", emp.employee_id) // this is not quite right structurally
    // wait, payslip links to payroll_employee_results. per links to employee_id.
    // Let's fix the query.
    .limit(3);

  // Corrected payslip query
  const { data: payslips } = await supabase
    .from("payroll_employee_results")
    .select(`
      payroll_employee_result_id,
      net_pay,
      payroll_runs!inner(payroll_periods(period_name, pay_date))
    `)
    .eq("employee_id", emp.employee_id)
    .order("payroll_runs(payroll_periods(pay_date))", { ascending: false })
    .limit(3);

  return { profile, payslips: payslips ?? [] };
}

export async function submitPayslipConcern(formData: FormData) {
  const emp = await requireEmployeeRecord();
  const supabase = await createServerSupabaseClient();

  const periodId = formData.get("payroll_period_id") as string;
  const concernText = formData.get("concern_text") as string;

  if (!periodId || !concernText) return { error: "Missing fields" };

  const { error } = await supabase.from("employee_payslip_concerns").insert({
    employee_id: emp.employee_id,
    payroll_period_id: periodId,
    concern_text: concernText,
  });

  if (error) return { error: error.message };
  revalidatePath("/portal/requests");
  return { success: true };
}

export async function submitProfileChangeRequest(formData: FormData) {
  const emp = await requireEmployeeRecord();
  const supabase = await createServerSupabaseClient();

  const changeType = formData.get("change_type") as string;
  const changes = formData.get("requested_changes") as string;

  if (!changeType || !changes) return { error: "Missing fields" };

  const { error } = await supabase.from("employee_profile_change_requests").insert({
    employee_id: emp.employee_id,
    change_type: changeType,
    requested_changes: JSON.parse(changes),
  });

  if (error) return { error: error.message };
  revalidatePath("/portal/requests");
  return { success: true };
}
