import { PageHeader, Card } from "@/components/ui/shared";
import Link from "next/link";
import { getPortalDashboard } from "@/features/portal/actions";

export default async function PortalDashboardPage() {
  let data = null;
  try {
    data = await getPortalDashboard();
  } catch (error) {
    console.error("Portal error:", error);
  }

  const { profile, payslips } = data || {};

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Welcome, ${profile?.first_name || "Employee"}`} 
        description="Employee Self-Service Portal" 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <Card>
            <h2 className="text-sm font-semibold mb-4 text-[var(--color-neutral-900)]">Your Profile</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-[var(--color-neutral-500)]">Employee No.</p>
                <p className="text-sm font-medium">{profile?.employee_no || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-neutral-500)]">Department</p>
                <p className="text-sm font-medium">{(profile?.departments as any)?.department_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-neutral-500)]">Position</p>
                <p className="text-sm font-medium">{(profile?.job_positions as any)?.position_title || "N/A"}</p>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--color-neutral-200)]">
              <Link href="/portal/requests" className="text-xs font-medium text-[var(--color-primary-600)] hover:underline">
                Request Profile Change →
              </Link>
            </div>
          </Card>
        </div>

        {/* Recent Payslips */}
        <div className="md:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--color-neutral-900)]">Recent Payslips</h2>
              <Link href="/portal/payslips" className="text-xs font-medium text-[var(--color-primary-600)] hover:underline">
                View All
              </Link>
            </div>
            
            {payslips && payslips.length > 0 ? (
              <div className="space-y-3">
                {payslips.map((ps: any) => (
                  <div key={ps.payroll_employee_result_id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-neutral-900)]">
                        {ps.payroll_runs?.payroll_periods?.period_name}
                      </p>
                      <p className="text-xs text-[var(--color-neutral-500)]">
                        Pay Date: {ps.payroll_runs?.payroll_periods?.pay_date || "TBA"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[var(--color-success-700)]">
                        ₱{ps.net_pay.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </p>
                      <button className="text-xs font-medium text-[var(--color-primary-600)] mt-1 hover:underline">
                        Download PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-neutral-500)] py-4 text-center">No payslips available yet.</p>
            )}
          </Card>

          <div className="mt-6">
            <Card>
              <h2 className="text-sm font-semibold mb-2 text-[var(--color-neutral-900)]">Need Help?</h2>
              <p className="text-xs text-[var(--color-neutral-600)] mb-4">If you notice discrepancies in your recent payslip, you can file a concern with HR.</p>
              <Link 
                href="/portal/requests" 
                className="inline-block px-4 py-2 bg-[var(--color-neutral-100)] border border-[var(--color-neutral-300)] text-[var(--color-neutral-700)] rounded-lg text-xs font-medium hover:bg-[var(--color-neutral-200)] transition-colors"
              >
                File a Payslip Concern
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
