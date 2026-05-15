import { PageHeader, Card, StatusBadge, getStatusVariant, EmptyState } from "@/components/ui/shared";
import Link from "next/link";

const demoRuns = [
  { payroll_run_id: "1", run_number: 1, run_status: "COMPUTED", computed_at: "2026-05-13T10:00:00Z", payroll_periods: { period_code: "2026-05-A", period_name: "May 1st Cut-off 2026" } },
  { payroll_run_id: "2", run_number: 1, run_status: "FINALIZED", computed_at: "2026-04-28T14:30:00Z", payroll_periods: { period_code: "2026-04-B", period_name: "April 2nd Cut-off 2026" } },
];

export default function PayrollRunsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Payroll Runs" description="Compute and manage payroll runs" />
      <Card padding={false}>
        {demoRuns.length === 0 ? (
          <EmptyState icon="⚙️" title="No payroll runs" description="Compute payroll from an open period to create a run" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-neutral-200)" }}>
                  {["Period", "Run #", "Status", "Computed At", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-neutral-500)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {demoRuns.map((r) => (
                  <tr key={r.payroll_run_id} className="hover:bg-[var(--color-neutral-50)] transition-colors" style={{ borderBottom: "1px solid var(--color-neutral-100)" }}>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium" style={{ color: "var(--color-neutral-900)" }}>{r.payroll_periods.period_name}</p>
                      <p className="text-xs font-mono" style={{ color: "var(--color-neutral-500)" }}>{r.payroll_periods.period_code}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-mono" style={{ color: "var(--color-neutral-600)" }}>Run #{r.run_number}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={r.run_status} variant={getStatusVariant(r.run_status)} /></td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-neutral-600)" }}>{new Date(r.computed_at).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/payroll-review?run=${r.payroll_run_id}`} className="text-xs font-medium" style={{ color: "var(--color-primary-600)" }}>Review →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
