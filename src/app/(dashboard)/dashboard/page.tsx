import { PageHeader, Card } from "@/components/ui/shared";
import Link from "next/link";
import { getDashboardStats } from "@/features/dashboard/actions";
import { formatDistanceToNow } from "date-fns";

const quickActions = [
  { label: "New Payroll Period", href: "/payroll-periods/new", icon: "📅", color: "var(--color-primary-500)" },
  { label: "Encode Attendance", href: "/attendance-inputs", icon: "📝", color: "var(--color-accent-500)" },
  { label: "Compute Payroll", href: "/payroll-runs", icon: "⚙️", color: "var(--color-success-500)" },
  { label: "View Reports", href: "/reports", icon: "📈", color: "var(--color-warning-500)" },
];

export default async function DashboardPage() {
  let statsData = null;
  try {
    statsData = await getDashboardStats();
  } catch (error) {
    // If running without Supabase env vars, we might get an error.
    console.error("Failed to load dashboard stats:", error);
  }

  const s = statsData?.stats;
  const recentLogs = statsData?.recentActivity ?? [];

  const displayStats = [
    { label: "Total Employees", value: s?.totalEmployees?.toString() || "0", icon: "👥", trend: "Active", color: "var(--color-primary-500)" },
    { label: "Active Period", value: s?.activePeriod?.period_name || "None", icon: "📅", trend: s?.activePeriod ? s.activePeriod.period_code : "No open period", color: "var(--color-accent-500)" },
    { label: "Last Net Payroll", value: `₱${(s?.lastNetPayroll || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, icon: "💰", trend: s?.lastFinalizedPeriod?.period_name || "No finalized payrolls", color: "var(--color-success-500)" },
    { label: "Pending Actions", value: s?.pendingReviews?.toString() || "0", icon: "⚡", trend: "Awaiting review", color: "var(--color-warning-500)" },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Dashboard" description="Welcome back — here's your payroll overview" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {displayStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: "var(--color-surface)",
              boxShadow: "var(--shadow-sm)",
              border: "1px solid var(--color-neutral-200)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: stat.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--color-neutral-900)" }}>{stat.value}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: "var(--color-neutral-500)" }}>{stat.label}</p>
            <p className="text-xs mt-2 px-2 py-0.5 rounded-full inline-block" style={{ background: "var(--color-neutral-100)", color: "var(--color-neutral-600)" }}>
              {stat.trend}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-neutral-900)" }}>Recent Activity</h2>
            <div className="space-y-1">
              {recentLogs.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: "var(--color-neutral-500)" }}>No recent activity.</p>
              ) : (
                recentLogs.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-3 py-3 rounded-lg transition-colors hover:bg-[var(--color-neutral-50)]"
                  >
                    <span className="text-lg mt-0.5">ℹ️</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "var(--color-neutral-900)" }}>{item.action_code}</p>
                      <p className="text-xs truncate" style={{ color: "var(--color-neutral-500)" }}>
                        {item.entity_type} {item.new_values ? `· ${JSON.stringify(item.new_values)}` : ''}
                      </p>
                    </div>
                    <span className="text-xs whitespace-nowrap" style={{ color: "var(--color-neutral-400)" }}>
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-neutral-900)" }}>Quick Actions</h2>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                  style={{ background: "var(--color-neutral-50)", border: "1px solid var(--color-neutral-200)" }}
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-sm font-medium" style={{ color: "var(--color-neutral-900)" }}>{action.label}</span>
                  <span className="ml-auto text-xs" style={{ color: "var(--color-neutral-400)" }}>→</span>
                </Link>
              ))}
            </div>
          </Card>

          {/* Payroll Status */}
          <div className="mt-6">
            <Card>
              <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--color-neutral-900)" }}>Payroll Workflow</h2>
              <div className="space-y-2">
                {[
                  { step: "Create Period", status: s?.activePeriod ? "done" : "current" },
                  { step: "Encode Attendance", status: s?.activePeriod ? "current" : "pending" },
                  { step: "Compute Payroll", status: "pending" },
                  { step: "Review & Approve", status: s?.pendingReviews && s.pendingReviews > 0 ? "current" : "pending" },
                  { step: "Finalize", status: "pending" },
                  { step: "Generate Payslips", status: "pending" },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: step.status === "done" ? "var(--color-success-500)" : step.status === "current" ? "var(--color-primary-500)" : "var(--color-neutral-200)",
                        color: step.status === "pending" ? "var(--color-neutral-500)" : "white",
                      }}
                    >
                      {step.status === "done" ? "✓" : i + 1}
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{ color: step.status === "pending" ? "var(--color-neutral-400)" : "var(--color-neutral-800)" }}
                    >
                      {step.step}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
