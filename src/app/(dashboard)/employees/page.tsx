import { PageHeader, Card, StatusBadge, getStatusVariant, EmptyState } from "@/components/ui/shared";
import Link from "next/link";

// Demo data for development without Supabase
const demoEmployees = [
  { employee_id: "1", employee_no: "EMP-001", first_name: "Juan", last_name: "Cruz", departments: { department_name: "Administration" }, job_positions: { position_title: "Office Staff" }, employment_statuses: { status_code: "ACTIVE", status_name: "Active" }, hire_date: "2023-01-15" },
  { employee_id: "2", employee_no: "EMP-002", first_name: "Maria", last_name: "Garcia", departments: { department_name: "Fabrication" }, job_positions: { position_title: "Welder" }, employment_statuses: { status_code: "ACTIVE", status_name: "Active" }, hire_date: "2023-03-01" },
  { employee_id: "3", employee_no: "EMP-003", first_name: "Pedro", last_name: "Reyes", departments: { department_name: "Fabrication" }, job_positions: { position_title: "Laborer" }, employment_statuses: { status_code: "ACTIVE", status_name: "Active" }, hire_date: "2024-01-10" },
  { employee_id: "4", employee_no: "EMP-004", first_name: "Ana", last_name: "Mendoza", departments: { department_name: "Engineering" }, job_positions: { position_title: "Project Engineer" }, employment_statuses: { status_code: "ACTIVE", status_name: "Active" }, hire_date: "2022-06-15" },
  { employee_id: "5", employee_no: "EMP-005", first_name: "Carlos", last_name: "Tan", departments: { department_name: "Fabrication" }, job_positions: { position_title: "Driver" }, employment_statuses: { status_code: "ACTIVE", status_name: "Active" }, hire_date: "2025-01-02" },
];

export default function EmployeesPage() {
  const employees = demoEmployees;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Employee Records"
        description="Manage employee information, rates, and government IDs"
        actions={
          <Link
            href="/employees/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-white text-sm"
            style={{ background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))" }}
          >
            + Add Employee
          </Link>
        }
      />

      <Card padding={false}>
        {employees.length === 0 ? (
          <EmptyState icon="👥" title="No employees yet" description="Add your first employee to get started" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-neutral-200)" }}>
                  {["Employee No", "Name", "Department", "Position", "Status", "Hire Date", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-neutral-500)" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.employee_id} className="hover:bg-[var(--color-neutral-50)] transition-colors" style={{ borderBottom: "1px solid var(--color-neutral-100)" }}>
                    <td className="px-5 py-3.5 text-sm font-mono font-medium" style={{ color: "var(--color-primary-600)" }}>{emp.employee_no}</td>
                    <td className="px-5 py-3.5 text-sm font-medium" style={{ color: "var(--color-neutral-900)" }}>
                      {emp.first_name} {emp.last_name}
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-neutral-600)" }}>{emp.departments?.department_name ?? "—"}</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-neutral-600)" }}>{emp.job_positions?.position_title ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={emp.employment_statuses?.status_name ?? "Unknown"} variant={getStatusVariant(emp.employment_statuses?.status_code ?? "")} />
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-neutral-600)" }}>{emp.hire_date}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Link href={`/employees/${emp.employee_id}`} className="text-xs font-medium" style={{ color: "var(--color-primary-600)" }}>
                        View →
                      </Link>
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
