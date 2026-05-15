import React from "react";
import { PageHeader, Card, StatusBadge, getStatusVariant, EmptyState } from "@/components/ui/shared";
import Link from "next/link";
import { getPayrollPeriods } from "@/features/payroll-periods/actions";

export const metadata = {
  title: "Payroll Periods | SME-Pay",
  description: "Manage payroll periods, cut-off dates, and computation cycles",
};

export default async function PayrollPeriodsPage() {
  const periods = await getPayrollPeriods().catch(() => []);

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <PageHeader
        title="Payroll Periods"
        description="Manage payroll periods, cut-off coverage dates, and workflow cycle statuses"
        actions={
          <Link href="/payroll-periods/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-white text-sm" style={{ background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))" }}>
            + New Period
          </Link>
        }
      />
      <Card padding={false}>
        {periods.length === 0 ? (
          <EmptyState icon="📅" title="No payroll periods found" description="Create your first payroll period to begin computation" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-neutral-200)", background: "var(--color-neutral-50)" }}>
                  {["Code", "Period Name", "Coverage", "Pay Date", "Frequency", "Status", ""].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-neutral-100)]">
                {periods.map((p) => (
                  <tr key={p.payroll_period_id} className="hover:bg-[var(--color-neutral-50)] transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-bold text-[var(--color-primary-600)]">{p.period_code}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[var(--color-neutral-900)]">{p.period_name}</td>
                    <td className="px-6 py-4 text-sm text-[var(--color-neutral-600)]">{p.period_start_date} → {p.period_end_date}</td>
                    <td className="px-6 py-4 text-sm text-[var(--color-neutral-600)]">{p.pay_date}</td>
                    <td className="px-6 py-4 text-sm text-[var(--color-neutral-600)]">{p.payroll_frequencies?.frequency_name}</td>
                    <td className="px-6 py-4"><StatusBadge status={p.period_status} variant={getStatusVariant(p.period_status)} /></td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/attendance-inputs?period=${p.payroll_period_id}`} className="text-xs font-bold text-[var(--color-primary-600)] hover:underline">Manage Inputs →</Link>
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
