import { PageHeader, Card, StatusBadge, getStatusVariant } from "@/components/ui/shared";

const demoReview = {
  run: { payroll_run_id: "1", run_number: 1, run_status: "COMPUTED", payroll_periods: { period_code: "2026-05-A", period_name: "May 1st Cut-off 2026" } },
  employees: [
    { employee_no: "EMP-001", name: "Juan Cruz", gross: 18000.00, sss: 900.00, philhealth: 450.00, pagibig: 200.00, tax: 1200.00, net: 15250.00, status: "OK" },
    { employee_no: "EMP-002", name: "Maria Garcia", gross: 15600.00, sss: 780.00, philhealth: 390.00, pagibig: 200.00, tax: 850.00, net: 13380.00, status: "OK" },
    { employee_no: "EMP-003", name: "Pedro Reyes", gross: 13600.00, sss: 680.00, philhealth: 340.00, pagibig: 200.00, tax: 550.00, net: 11830.00, status: "OK" },
    { employee_no: "EMP-004", name: "Ana Mendoza", gross: 27125.00, sss: 1125.00, philhealth: 562.50, pagibig: 200.00, tax: 2350.00, net: 22887.50, status: "WARNING" },
  ],
};

export default function PayrollReviewPage() {
  const { run, employees } = demoReview;
  const totals = {
    gross: employees.reduce((s, e) => s + e.gross, 0),
    net: employees.reduce((s, e) => s + e.net, 0),
    deductions: employees.reduce((s, e) => s + e.sss + e.philhealth + e.pagibig + e.tax, 0),
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Payroll Review"
        description={`${run.payroll_periods.period_name} — Run #${run.run_number}`}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge status={run.run_status} variant={getStatusVariant(run.run_status)} />
            {run.run_status === "COMPUTED" && (
              <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--color-primary-600)" }}>
                Submit for Review
              </button>
            )}
            {run.run_status === "SUBMITTED" && (
              <>
                <button className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: "var(--color-warning-50)", color: "var(--color-warning-700)" }}>
                  Return for Correction
                </button>
                <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--color-success-500)" }}>
                  Finalize Payroll
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Employees", value: employees.length.toString(), icon: "👥", color: "var(--color-primary-500)" },
          { label: "Total Gross", value: `₱${totals.gross.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, icon: "💵", color: "var(--color-success-500)" },
          { label: "Total Deductions", value: `₱${totals.deductions.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, icon: "📉", color: "var(--color-warning-500)" },
          { label: "Total Net Pay", value: `₱${totals.net.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, icon: "💰", color: "var(--color-accent-500)" },
        ].map((c) => (
          <Card key={c.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{c.icon}</span>
              <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
            </div>
            <p className="text-xs font-medium" style={{ color: "var(--color-neutral-500)" }}>{c.label}</p>
            <p className="text-lg font-bold mt-0.5" style={{ color: "var(--color-neutral-900)" }}>{c.value}</p>
          </Card>
        ))}
      </div>

      {/* Employee breakdown */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-neutral-200)" }}>
                {["Emp #", "Name", "Gross Pay", "SSS", "PhilHealth", "Pag-IBIG", "Tax", "Net Pay", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-neutral-500)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.employee_no} className="hover:bg-[var(--color-neutral-50)] transition-colors" style={{ borderBottom: "1px solid var(--color-neutral-100)" }}>
                  <td className="px-4 py-3 text-sm font-mono" style={{ color: "var(--color-primary-600)" }}>{e.employee_no}</td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: "var(--color-neutral-900)" }}>{e.name}</td>
                  <td className="px-4 py-3 text-sm font-mono text-right" style={{ color: "var(--color-neutral-800)" }}>₱{e.gross.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-sm font-mono text-right" style={{ color: "var(--color-neutral-600)" }}>₱{e.sss.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-sm font-mono text-right" style={{ color: "var(--color-neutral-600)" }}>₱{e.philhealth.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-sm font-mono text-right" style={{ color: "var(--color-neutral-600)" }}>₱{e.pagibig.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-sm font-mono text-right" style={{ color: "var(--color-danger-700)" }}>₱{e.tax.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-sm font-mono font-bold text-right" style={{ color: "var(--color-success-700)" }}>₱{e.net.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} variant={getStatusVariant(e.status)} /></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: "2px solid var(--color-neutral-300)" }}>
                <td colSpan={2} className="px-4 py-3 text-sm font-bold" style={{ color: "var(--color-neutral-900)" }}>TOTALS</td>
                <td className="px-4 py-3 text-sm font-mono font-bold text-right" style={{ color: "var(--color-neutral-900)" }}>₱{totals.gross.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                <td colSpan={4} className="px-4 py-3 text-sm font-mono font-bold text-right" style={{ color: "var(--color-neutral-600)" }}>₱{totals.deductions.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-sm font-mono font-bold text-right" style={{ color: "var(--color-success-700)" }}>₱{totals.net.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
