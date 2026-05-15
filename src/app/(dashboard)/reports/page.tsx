import { PageHeader, Card } from "@/components/ui/shared";

export default function ReportsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Reports" description="Generate payroll summary and statutory reports" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "Payroll Summary", desc: "Overview of payroll by period with gross, deductions, and net pay", icon: "📊", format: "PDF / CSV" },
          { title: "Employee Payroll Register", desc: "Detailed breakdown per employee for a selected period", icon: "📋", format: "PDF / CSV" },
          { title: "SSS Contribution Report", desc: "SSS employee and employer contributions for filing", icon: "🏛️", format: "CSV" },
          { title: "PhilHealth Report", desc: "PhilHealth premium contributions summary", icon: "🏥", format: "CSV" },
          { title: "Pag-IBIG Report", desc: "Pag-IBIG fund contributions for remittance", icon: "🏠", format: "CSV" },
          { title: "Withholding Tax Report", desc: "BIR withholding tax on compensation summary", icon: "📝", format: "CSV" },
        ].map((report) => (
          <Card key={report.title}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{report.icon}</span>
              <div className="flex-1">
                <h3 className="text-sm font-semibold" style={{ color: "var(--color-neutral-900)" }}>{report.title}</h3>
                <p className="text-xs mt-1 mb-3" style={{ color: "var(--color-neutral-500)" }}>{report.desc}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--color-neutral-100)", color: "var(--color-neutral-600)" }}>
                    {report.format}
                  </span>
                  <button
                    className="text-xs font-medium px-3 py-1.5 rounded-lg"
                    style={{ background: "var(--color-primary-50)", color: "var(--color-primary-600)" }}
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
