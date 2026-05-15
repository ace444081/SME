import { PageHeader, Card, EmptyState } from "@/components/ui/shared";

const demoLogs = [
  { audit_log_id: "1", action_code: "PAYROLL_FINALIZED", entity_type: "payroll_runs", username: "owner_manager", created_at: "2026-04-30T14:30:00Z" },
  { audit_log_id: "2", action_code: "PAYSLIPS_GENERATED", entity_type: "payslips", username: "payroll_admin", created_at: "2026-04-30T15:00:00Z" },
  { audit_log_id: "3", action_code: "PAYROLL_COMPUTED", entity_type: "payroll_runs", username: "payroll_admin", created_at: "2026-04-28T14:00:00Z" },
  { audit_log_id: "4", action_code: "EMPLOYEE_UPDATED", entity_type: "employees", username: "payroll_admin", created_at: "2026-04-25T09:00:00Z" },
  { audit_log_id: "5", action_code: "PERIOD_CREATED", entity_type: "payroll_periods", username: "payroll_admin", created_at: "2026-04-20T08:00:00Z" },
];

export default function AuditLogsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="Audit Logs" description="View all system activity and changes" />
      <Card padding={false}>
        {demoLogs.length === 0 ? (
          <EmptyState icon="🔍" title="No audit logs" description="Activity will appear here" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-neutral-200)" }}>
                  {["Action", "Entity", "User", "Timestamp"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-neutral-500)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {demoLogs.map((log) => (
                  <tr key={log.audit_log_id} className="hover:bg-[var(--color-neutral-50)] transition-colors" style={{ borderBottom: "1px solid var(--color-neutral-100)" }}>
                    <td className="px-5 py-3.5 text-sm font-mono font-medium" style={{ color: "var(--color-primary-600)" }}>{log.action_code}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-neutral-600)" }}>{log.entity_type}</td>
                    <td className="px-5 py-3.5 text-sm font-medium" style={{ color: "var(--color-neutral-900)" }}>{log.username}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-neutral-600)" }}>{new Date(log.created_at).toLocaleString()}</td>
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
