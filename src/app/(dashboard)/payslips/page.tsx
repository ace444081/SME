import { PageHeader, Card, StatusBadge, getStatusVariant, EmptyState } from "@/components/ui/shared";

const demoPayslips = [
  { payslip_id: "1", payslip_no: "PS-2026-04-B-EMP-001", employee: "Juan Cruz", period: "April 2nd Cut-off 2026", gross: 18000, net: 15250, status: "GENERATED", generated_at: "2026-04-30T15:00:00Z" },
  { payslip_id: "2", payslip_no: "PS-2026-04-B-EMP-002", employee: "Maria Garcia", period: "April 2nd Cut-off 2026", gross: 15600, net: 13380, status: "GENERATED", generated_at: "2026-04-30T15:00:00Z" },
  { payslip_id: "3", payslip_no: "PS-2026-04-B-EMP-003", employee: "Pedro Reyes", period: "April 2nd Cut-off 2026", gross: 13600, net: 11830, status: "GENERATED", generated_at: "2026-04-30T15:00:00Z" },
  { payslip_id: "4", payslip_no: "PS-2026-04-B-EMP-004", employee: "Ana Mendoza", period: "April 2nd Cut-off 2026", gross: 27125, net: 22887.5, status: "RELEASED", generated_at: "2026-04-30T15:00:00Z" },
];

export default function PayslipsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Payslips" description="Generate and manage employee payslips" />
      <Card padding={false}>
        {demoPayslips.length === 0 ? (
          <EmptyState icon="📄" title="No payslips" description="Generate payslips from a finalized payroll run" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-neutral-200)" }}>
                  {["Payslip No", "Employee", "Period", "Gross Pay", "Net Pay", "Status", "Generated"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-neutral-500)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {demoPayslips.map((p) => (
                  <tr key={p.payslip_id} className="hover:bg-[var(--color-neutral-50)] transition-colors" style={{ borderBottom: "1px solid var(--color-neutral-100)" }}>
                    <td className="px-5 py-3.5 text-sm font-mono font-medium" style={{ color: "var(--color-primary-600)" }}>{p.payslip_no}</td>
                    <td className="px-5 py-3.5 text-sm font-medium" style={{ color: "var(--color-neutral-900)" }}>{p.employee}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-neutral-600)" }}>{p.period}</td>
                    <td className="px-5 py-3.5 text-sm font-mono text-right" style={{ color: "var(--color-neutral-800)" }}>₱{p.gross.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-3.5 text-sm font-mono font-bold text-right" style={{ color: "var(--color-success-700)" }}>₱{p.net.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={p.status} variant={getStatusVariant(p.status)} /></td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-neutral-600)" }}>{new Date(p.generated_at).toLocaleDateString()}</td>
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
