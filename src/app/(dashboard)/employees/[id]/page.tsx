import { PageHeader, Card, StatusBadge, getStatusVariant } from "@/components/ui/shared";
import Link from "next/link";

const demoEmployee = {
  employee_id: "1",
  employee_no: "EMP-001",
  first_name: "Juan",
  middle_name: "Dela",
  last_name: "Cruz",
  suffix: null,
  birth_date: "1990-05-15",
  sex: "MALE",
  civil_status: "MARRIED",
  contact_number: "0917-123-4567",
  email: "juan@visualoptions.ph",
  address_line: "123 Rizal Street, Quezon City",
  hire_date: "2023-01-15",
  department: "Administration",
  position: "Office Staff",
  status: { code: "ACTIVE", name: "Active" },
};

const demoRates = [
  { rate_history_id: "r1", pay_basis: "MONTHLY", rate_amount: 18000, effective_from: "2023-01-15", effective_to: null, change_reason: "Initial hire" },
];

const demoGovIds = [
  { type_code: "SSS", type_name: "SSS Number", id_number: "33-1234567-8" },
  { type_code: "PHILHEALTH", type_name: "PhilHealth ID", id_number: "01-234567890-1" },
  { type_code: "PAGIBIG", type_name: "Pag-IBIG MID", id_number: "1234-5678-9012" },
  { type_code: "TIN", type_name: "TIN", id_number: "123-456-789-000" },
];

export default function EmployeeDetailPage() {
  const emp = demoEmployee;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={`${emp.first_name} ${emp.last_name}`}
        description={`${emp.employee_no} · ${emp.position} · ${emp.department}`}
        actions={
          <div className="flex items-center gap-3">
            <StatusBadge status={emp.status.name} variant={getStatusVariant(emp.status.code)} />
            <Link href={`/employees/${emp.employee_id}/edit`} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--color-neutral-100)", color: "var(--color-neutral-700)", border: "1px solid var(--color-neutral-300)" }}>
              Edit
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Info */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-neutral-900)" }}>Personal Information</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              {[
                { label: "Full Name", value: `${emp.first_name} ${emp.middle_name ?? ""} ${emp.last_name} ${emp.suffix ?? ""}`.trim() },
                { label: "Employee No.", value: emp.employee_no },
                { label: "Birth Date", value: emp.birth_date },
                { label: "Sex", value: emp.sex },
                { label: "Civil Status", value: emp.civil_status },
                { label: "Contact", value: emp.contact_number },
                { label: "Email", value: emp.email },
                { label: "Address", value: emp.address_line },
                { label: "Hire Date", value: emp.hire_date },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs font-medium mb-0.5" style={{ color: "var(--color-neutral-500)" }}>{item.label}</p>
                  <p className="text-sm font-medium" style={{ color: "var(--color-neutral-900)" }}>{item.value || "—"}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Government IDs */}
        <div>
          <Card>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-neutral-900)" }}>Government IDs</h2>
            <div className="space-y-3">
              {demoGovIds.map((gov) => (
                <div key={gov.type_code} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--color-neutral-100)" }}>
                  <div>
                    <p className="text-xs font-medium" style={{ color: "var(--color-neutral-500)" }}>{gov.type_name}</p>
                    <p className="text-sm font-mono font-medium" style={{ color: "var(--color-neutral-900)" }}>{gov.id_number}</p>
                  </div>
                  <span className="text-xs" style={{ color: "var(--color-success-600)" }}>✓</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Rate History */}
      <div className="mt-6">
        <Card padding={false}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--color-neutral-200)" }}>
            <h2 className="text-sm font-semibold" style={{ color: "var(--color-neutral-900)" }}>Salary Rate History</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-neutral-200)" }}>
                {["Pay Basis", "Rate", "Effective From", "Effective To", "Reason"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-neutral-500)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {demoRates.map((r) => (
                <tr key={r.rate_history_id} style={{ borderBottom: "1px solid var(--color-neutral-100)" }}>
                  <td className="px-5 py-3 text-sm"><StatusBadge status={r.pay_basis} variant="info" /></td>
                  <td className="px-5 py-3 text-sm font-mono font-bold" style={{ color: "var(--color-success-700)" }}>
                    ₱{r.rate_amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ color: "var(--color-neutral-600)" }}>{r.effective_from}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: "var(--color-neutral-600)" }}>{r.effective_to ?? "Current"}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: "var(--color-neutral-600)" }}>{r.change_reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
