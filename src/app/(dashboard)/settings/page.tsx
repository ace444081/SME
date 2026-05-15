import React from "react";
import { PageHeader } from "@/components/ui/shared";
import { SettingsHub } from "@/components/ui/settings/SettingsHub";
import { getCompanyProfile, getPayrollConfig } from "@/features/settings/actions";
import { getPayrollFrequencies } from "@/features/payroll-periods/actions";
import { getUsers, getRoles } from "@/features/users/actions";
import { getBackupHistory } from "@/features/backup/actions";

export const metadata = {
  title: "System Settings & Administration | SME-Pay",
  description: "Manage system configuration, company profile, user accounts, and database backups",
};

export default async function SettingsPage() {
  // Fetch all necessary admin data in parallel
  const [company, payrollConfig, frequencies, users, roles, backups] = await Promise.all([
    getCompanyProfile().catch(() => null),
    getPayrollConfig().catch(() => null),
    getPayrollFrequencies().catch(() => []),
    getUsers().catch(() => []),
    getRoles().catch(() => []),
    getBackupHistory().catch(() => []),
  ]);

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <PageHeader
        title="System Settings & Administration"
        description="Configure corporate profile, payroll rules, RBAC user permissions, and database backup snapshots"
      />

      <SettingsHub
        company={company as Record<string, unknown> | null}
        payrollConfig={payrollConfig as Record<string, unknown> | null}
        frequencies={frequencies as Array<Record<string, unknown>>}
        users={users as Array<Record<string, unknown>>}
        roles={roles as Array<Record<string, unknown>>}
        backups={backups as Array<Record<string, unknown>>}
      />
    </div>
  );
}
