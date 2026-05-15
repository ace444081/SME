import React from "react";
import { PageHeader, Card, StatusBadge, getStatusVariant, EmptyState } from "@/components/ui/shared";
import Link from "next/link";
import { getEmployees } from "@/features/employees/actions";

export const metadata = {
  title: "Employee Records | SME-Pay",
  description: "Manage employee information, rates, and government IDs",
};

export default async function EmployeesPage() {
  const employees = await getEmployees().catch(() => []);

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <PageHeader
        title="Employee Records"
        description="Manage employee master files, salary rates, and statutory identification numbers"
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
          <EmptyState icon="👥" title="No employees found" description="Add your first employee record to get started" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-neutral-200)", background: "var(--color-neutral-50)" }}>
                  {["Employee No", "Name", "Department", "Position", "Status", "Hire Date", ""].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-neutral-100)]">
                {employees.map((emp) => (
                  <tr key={emp.employee_id} className="hover:bg-[var(--color-neutral-50)] transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-bold text-[var(--color-primary-600)]">{emp.employee_no}</td>
                    <td className="px-6 py-4 text-sm font-bold text-[var(--color-neutral-900)]">
                      {emp.first_name} {emp.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-neutral-600)]">{emp.departments?.department_name ?? "—"}</td>
                    <td className="px-6 py-4 text-sm text-[var(--color-neutral-600)]">{emp.job_positions?.position_title ?? "—"}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={emp.employment_statuses?.status_name ?? "Active"} variant={getStatusVariant(emp.employment_statuses?.status_code ?? "ACTIVE")} />
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-neutral-600)]">{emp.hire_date}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/employees/${emp.employee_id}`} className="text-xs font-bold text-[var(--color-primary-600)] hover:underline">
                        View Profile →
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
