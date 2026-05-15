import { PageHeader, Card } from "@/components/ui/shared";

export default function SettingsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="System Settings" description="Manage system configuration and user accounts" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-neutral-900)" }}>Company Information</h2>
          <div className="space-y-3">
            {[
              { label: "Company Name", value: "Visual Options Engineering and Fabrication Services" },
              { label: "Business Name", value: "Visual Options" },
              { label: "TIN", value: "000-000-000-000" },
              { label: "Address", value: "123 Industrial Avenue, Quezon City, Metro Manila" },
              { label: "Contact", value: "(02) 8123-4567" },
              { label: "Email", value: "info@visualoptions.ph" },
            ].map((item) => (
              <div key={item.label} className="flex items-start justify-between py-2" style={{ borderBottom: "1px solid var(--color-neutral-100)" }}>
                <span className="text-xs font-medium" style={{ color: "var(--color-neutral-500)" }}>{item.label}</span>
                <span className="text-sm font-medium text-right" style={{ color: "var(--color-neutral-900)" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-neutral-900)" }}>Payroll Configuration</h2>
          <div className="space-y-3">
            {[
              { label: "Default Frequency", value: "Semi-monthly" },
              { label: "Working Days/Month", value: "26" },
              { label: "Working Hours/Day", value: "8" },
              { label: "OT Multiplier", value: "1.25×" },
              { label: "Manager Approval", value: "Required" },
              { label: "Manual Adjustments", value: "Allowed" },
            ].map((item) => (
              <div key={item.label} className="flex items-start justify-between py-2" style={{ borderBottom: "1px solid var(--color-neutral-100)" }}>
                <span className="text-xs font-medium" style={{ color: "var(--color-neutral-500)" }}>{item.label}</span>
                <span className="text-sm font-medium text-right" style={{ color: "var(--color-neutral-900)" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
