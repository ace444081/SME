import { PageHeader, Card, StatusBadge, getStatusVariant, EmptyState } from "@/components/ui/shared";

const demoDeductions = [
  { deduction_type_id: "1", deduction_code: "SSS", deduction_name: "SSS Contribution", deduction_category: "STATUTORY", calculation_method: "BRACKET", has_employer_share: true, is_active: true },
  { deduction_type_id: "2", deduction_code: "PHILHEALTH", deduction_name: "PhilHealth Contribution", deduction_category: "STATUTORY", calculation_method: "PERCENTAGE", has_employer_share: true, is_active: true },
  { deduction_type_id: "3", deduction_code: "PAGIBIG", deduction_name: "Pag-IBIG Contribution", deduction_category: "STATUTORY", calculation_method: "PERCENTAGE", has_employer_share: true, is_active: true },
  { deduction_type_id: "4", deduction_code: "WITHHOLDING_TAX", deduction_name: "Withholding Tax on Compensation", deduction_category: "TAX", calculation_method: "BRACKET", has_employer_share: false, is_active: true },
  { deduction_type_id: "5", deduction_code: "CASH_ADVANCE", deduction_name: "Cash Advance", deduction_category: "LOAN", calculation_method: "MANUAL", has_employer_share: false, is_active: true },
];

export default function DeductionSettingsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Deduction Settings" description="Manage statutory references and contribution brackets" />
      <Card padding={false}>
        {demoDeductions.length === 0 ? (
          <EmptyState icon="💳" title="No deduction types" description="Seed data will populate this" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-neutral-200)" }}>
                  {["Code", "Name", "Category", "Method", "Employer Share", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-neutral-500)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {demoDeductions.map((d) => (
                  <tr key={d.deduction_type_id} className="hover:bg-[var(--color-neutral-50)] transition-colors" style={{ borderBottom: "1px solid var(--color-neutral-100)" }}>
                    <td className="px-5 py-3.5 text-sm font-mono font-medium" style={{ color: "var(--color-primary-600)" }}>{d.deduction_code}</td>
                    <td className="px-5 py-3.5 text-sm font-medium" style={{ color: "var(--color-neutral-900)" }}>{d.deduction_name}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={d.deduction_category} variant="info" /></td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-neutral-600)" }}>{d.calculation_method}</td>
                    <td className="px-5 py-3.5 text-sm">{d.has_employer_share ? "✅ Yes" : "—"}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={d.is_active ? "Active" : "Inactive"} variant={getStatusVariant(d.is_active ? "ACTIVE" : "DISABLED")} /></td>
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
