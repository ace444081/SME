"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/rbac";

export async function getDashboardStats() {
  const user = await requirePermission("EMPLOYEE_VIEW"); // Any basic role
  const supabase = await createServerSupabaseClient();

  // Total employees
  const { count: employeeCount } = await supabase
    .from("employees")
    .select("*", { count: "exact", head: true })
    .eq("company_id", user.company_id);

  // Active period
  const { data: activePeriod } = await supabase
    .from("payroll_periods")
    .select("period_code, period_name, period_status")
    .eq("company_id", user.company_id)
    .in("period_status", ["OPEN", "RETURNED", "REOPENED"])
    .order("period_start_date", { ascending: false })
    .limit(1)
    .single();

  // Last finalized payroll run
  const { data: lastFinalizedPeriod } = await supabase
    .from("payroll_periods")
    .select("payroll_period_id, period_name")
    .eq("company_id", user.company_id)
    .eq("period_status", "FINALIZED")
    .order("period_end_date", { ascending: false })
    .limit(1)
    .single();

  let lastNetPayroll = 0;
  if (lastFinalizedPeriod) {
    const { data: run } = await supabase
      .from("payroll_runs")
      .select("payroll_run_id")
      .eq("payroll_period_id", lastFinalizedPeriod.payroll_period_id)
      .eq("run_status", "FINALIZED")
      .single();
    
    if (run) {
      const { data: totals } = await supabase
        .from("v_payroll_period_summary")
        .select("total_net_pay")
        .eq("payroll_run_id", run.payroll_run_id)
        .single();
      
      lastNetPayroll = totals?.total_net_pay || 0;
    }
  }

  // Pending actions: count of runs submitted for review
  const { count: pendingReviews } = await supabase
    .from("payroll_runs")
    .select("*, payroll_periods!inner(company_id)", { count: "exact", head: true })
    .eq("run_status", "SUBMITTED")
    .eq("payroll_periods.company_id", user.company_id);

  // Recent activity
  const { data: recentLogs } = await supabase
    .from("audit_logs")
    .select("action_code, entity_type, new_values, created_at, users(username)")
    .eq("company_id", user.company_id)
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    stats: {
      totalEmployees: employeeCount ?? 0,
      activePeriod,
      lastFinalizedPeriod,
      lastNetPayroll,
      pendingReviews: pendingReviews ?? 0,
    },
    recentActivity: recentLogs ?? [],
  };
}
