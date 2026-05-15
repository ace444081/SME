import { getCurrentUser } from "@/lib/rbac";
import { Sidebar } from "@/components/layout/sidebar";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In development without Supabase, allow access with mock user
  let user = await getCurrentUser();

  if (!user) {
    // Check if Supabase is configured
    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      redirect("/login");
    }
    // Dev mode: use mock user
    user = {
      user_id: "dev-user",
      company_id: "dev-company",
      username: "dev_admin",
      email: "dev@sme-pay.local",
      account_status: "ACTIVE",
      roles: ["PAYROLL_ADMIN", "OWNER_MANAGER", "SYSTEM_ADMIN"],
      permissions: [
        "AUTH_LOGIN", "AUTH_CHANGE_PASSWORD",
        "COMPANY_VIEW", "COMPANY_UPDATE", "COMPANY_UPDATE_LIMITED",
        "EMPLOYEES_VIEW", "EMPLOYEES_CREATE", "EMPLOYEES_UPDATE", "EMPLOYEES_DEACTIVATE",
        "EMPLOYEES_MANAGE_RATES", "EMPLOYEES_MANAGE_GOVIDS",
        "PERIODS_VIEW", "PERIODS_CREATE", "PERIODS_UPDATE",
        "ATTENDANCE_VIEW", "ATTENDANCE_ENCODE", "ATTENDANCE_UPDATE",
        "DEDUCTIONS_VIEW", "DEDUCTIONS_MANAGE",
        "PAYROLL_COMPUTE", "PAYROLL_REVIEW", "PAYROLL_SUBMIT",
        "PAYROLL_RETURN", "PAYROLL_FINALIZE", "PAYROLL_REOPEN",
        "PAYSLIPS_GENERATE", "PAYSLIPS_VIEW", "PAYSLIPS_DOWNLOAD",
        "REPORTS_VIEW", "REPORTS_GENERATE", "REPORTS_EXPORT",
        "HISTORY_VIEW",
        "AUDIT_VIEW", "AUDIT_EXPORT",
        "BACKUP_CREATE", "BACKUP_RESTORE",
        "SETTINGS_VIEW", "SETTINGS_UPDATE",
        "USERS_VIEW", "USERS_CREATE", "USERS_UPDATE", "USERS_MANAGE_ROLES", "USERS_DISABLE", "USERS_RESET_PASSWORD",
      ],
    };
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-neutral-50)" }}>
      <Sidebar username={user.username} roles={user.roles} permissions={user.permissions} />
      <main style={{ marginLeft: "var(--sidebar-width)" }}>
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
