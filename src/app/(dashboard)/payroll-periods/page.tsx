import { PageHeader, Card, StatusBadge, getStatusVariant, EmptyState } from "@/components/ui/shared";
import Link from "next/link";

const demoPeriods = [
  { payroll_period_id: "1", period_code: "2026-05-A", period_name: "May 1st Cut-off 2026", period_start_date: "2026-05-01", period_end_date: "2026-05-15", cutoff_start_date: "2026-05-01", cutoff_end_date: "2026-05-13", pay_date: "2026-05-15", period_status: "OPEN", payroll_frequencies: { frequency_name: "Semi-monthly" } },
  { payroll_period_id: "2", period_code: "2026-04-B", period_name: "April 2nd Cut-off 2026", period_start_date: "2026-04-16", period_end_date: "2026-04-30", cutoff_start_date: "2026-04-16", cutoff_end_date: "2026-04-28", pay_date: "2026-04-30", period_status: "FINALIZED", payroll_frequencies: { frequency_name: "Semi-monthly" } },
];

export default function PayrollPeriodsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Payroll Periods"
        description="Manage payroll periods and cut-off dates"
        actions={
          <Link href="/payroll-periods/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-white text-sm" style={{ background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))" }}>
            + New Period
          </Link>
        }
      />
      <Card padding={false}>
        {demoPeriods.length === 0 ? (
          <EmptyState icon="📅" title="No payroll periods" description="Create your first payroll period" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-neutral-200)" }}>
                  {["Code", "Period Name", "Coverage", "Pay Date", "Frequency", "Status", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-neutral-500)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {demoPeriods.map((p) => (
                  <tr key={p.payroll_period_id} className="hover:bg-[var(--color-neutral-50)] transition-colors" style={{ borderBottom: "1px solid var(--color-neutral-100)" }}>
                    <td className="px-5 py-3.5 text-sm font-mono font-medium" style={{ color: "var(--color-primary-600)" }}>{p.period_code}</td>
                    <td className="px-5 py-3.5 text-sm font-medium" style={{ color: "var(--color-neutral-900)" }}>{p.period_name}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-neutral-600)" }}>{p.period_start_date} → {p.period_end_date}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-neutral-600)" }}>{p.pay_date}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-neutral-600)" }}>{p.payroll_frequencies?.frequency_name}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={p.period_status} variant={getStatusVariant(p.period_status)} /></td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/attendance-inputs?period=${p.payroll_period_id}`} className="text-xs font-medium" style={{ color: "var(--color-primary-600)" }}>Manage →</Link>
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
