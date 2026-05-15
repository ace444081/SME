"use client";

import React, { useState, useTransition } from "react";
import { Card, Button, StatusBadge, getStatusVariant } from "@/components/ui/shared";
import { updateCompanyProfile, updatePayrollConfig } from "@/features/settings/actions";
import { createUser, updateUserStatus, updateUserRole } from "@/features/users/actions";
import { createSystemBackup, restoreSystemBackup } from "@/features/backup/actions";

interface SettingsHubProps {
  company: Record<string, unknown> | null;
  payrollConfig: Record<string, unknown> | null;
  frequencies: Array<Record<string, unknown>>;
  users: Array<Record<string, unknown>>;
  roles: Array<Record<string, unknown>>;
  backups: Array<Record<string, unknown>>;
}

export function SettingsHub({
  company,
  payrollConfig,
  frequencies,
  users,
  roles,
  backups,
}: SettingsHubProps) {
  const [activeTab, setActiveTab] = useState<"company" | "payroll" | "users" | "backup">("company");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New User Modal State
  const [showNewUserModal, setShowNewUserModal] = useState(false);

  // Restore Modal State
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState<Record<string, unknown> | null>(null);
  const [restorePayload, setRestorePayload] = useState("");

  const handleCompanySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateCompanyProfile(formData);
      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({ type: "success", text: "Company profile successfully updated." });
      }
    });
  };

  const handlePayrollConfigSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updatePayrollConfig(formData);
      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({ type: "success", text: "Payroll configuration successfully updated." });
      }
    });
  };

  const handleCreateUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createUser(formData);
      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({ type: "success", text: "New staff member account successfully created and invited." });
        setShowNewUserModal(false);
      }
    });
  };

  const handleUserStatusToggle = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
    startTransition(async () => {
      const res = await updateUserStatus(userId, newStatus);
      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({ type: "success", text: `User account status changed to ${newStatus}.` });
      }
    });
  };

  const handleUserRoleChange = (userId: string, newRoleId: string) => {
    startTransition(async () => {
      const res = await updateUserRole(userId, newRoleId);
      if (res?.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({ type: "success", text: "User role successfully updated." });
      }
    });
  };

  const handleCreateBackup = () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const res = await createSystemBackup();
        if (res.success && res.jsonString) {
          // Trigger browser download
          const blob = new Blob([res.jsonString], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = res.fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setMessage({ type: "success", text: `Backup snapshot "${res.fileName}" successfully generated and downloaded.` });
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        setMessage({ type: "error", text: `Backup generation failed: ${errMsg}` });
      }
    });
  };

  const handleRestoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBackupForRestore || !restorePayload) return;
    startTransition(async () => {
      const res = await restoreSystemBackup(selectedBackupForRestore.backup_file_id as string, restorePayload);
      if (res.error) {
        setMessage({ type: "error", text: res.error });
      } else {
        setMessage({ type: "success", text: res.message || "System data successfully restored from snapshot." });
        setSelectedBackupForRestore(null);
        setRestorePayload("");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[var(--color-neutral-200)] pb-3 overflow-x-auto">
        {[
          { id: "company", label: "🏢 Company Profile", desc: "Manage legal entity & contact" },
          { id: "payroll", label: "⚙️ Payroll Configuration", desc: "Default frequency, working days & OT" },
          { id: "users", label: "👥 User Accounts & Roles", desc: "Staff access & RBAC permissions" },
          { id: "backup", label: "🛡️ System Backup & Restore", desc: "Data snapshots & auditing" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as "company" | "payroll" | "users" | "backup"); setMessage(null); }}
            className={`flex flex-col items-start px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-[var(--color-primary-50)] text-[var(--color-primary-700)] border border-[var(--color-primary-200)] shadow-sm"
                : "text-[var(--color-neutral-600)] hover:bg-[var(--color-neutral-100)]"
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-xs font-normal opacity-75">{tab.desc}</span>
          </button>
        ))}
      </div>

      {/* Message Banner */}
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between animate-fade-in ${
          message.type === "success" ? "bg-[var(--color-success-50)] text-[var(--color-success-700)] border border-[var(--color-success-200)]" : "bg-[var(--color-danger-50)] text-[var(--color-danger-700)] border border-[var(--color-danger-200)]"
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="opacity-70 hover:opacity-100 font-bold px-2">×</button>
        </div>
      )}

      {/* Tab Content 1: Company Profile */}
      {activeTab === "company" && (
        <Card className="animate-fade-in">
          <form onSubmit={handleCompanySubmit} className="space-y-6">
            <h2 className="text-lg font-bold text-[var(--color-neutral-900)] border-b border-[var(--color-neutral-100)] pb-3">Legal Entity & Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--color-neutral-500)] mb-1.5">Company Legal Name *</label>
                <input
                  type="text"
                  name="company_name"
                  defaultValue={(company?.company_name as string) || "Visual Options Engineering and Fabrication Services"}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-neutral-300)] text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--color-neutral-500)] mb-1.5">Business / Trade Name</label>
                <input
                  type="text"
                  name="business_name"
                  defaultValue={(company?.business_name as string) || "Visual Options"}
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-neutral-300)] text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--color-neutral-500)] mb-1.5">Tax Identification Number (TIN)</label>
                <input
                  type="text"
                  name="tin"
                  defaultValue={(company?.tin as string) || "000-000-000-000"}
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-neutral-300)] text-sm focus:outline-none focus:border-[var(--color-primary-500)] font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--color-neutral-500)] mb-1.5">Contact Number</label>
                <input
                  type="text"
                  name="contact_number"
                  defaultValue={(company?.contact_number as string) || "(02) 8123-4567"}
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-neutral-300)] text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase text-[var(--color-neutral-500)] mb-1.5">Corporate Address</label>
                <input
                  type="text"
                  name="address_line"
                  defaultValue={(company?.address_line as string) || "123 Industrial Avenue, Quezon City, Metro Manila"}
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-neutral-300)] text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase text-[var(--color-neutral-500)] mb-1.5">Corporate Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={(company?.email as string) || "info@visualoptions.ph"}
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-neutral-300)] text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-[var(--color-neutral-100)]">
              <Button type="submit" disabled={isPending}>{isPending ? "Saving changes..." : "Save Company Profile"}</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab Content 2: Payroll Configuration */}
      {activeTab === "payroll" && (
        <Card className="animate-fade-in">
          <form onSubmit={handlePayrollConfigSubmit} className="space-y-6">
            <h2 className="text-lg font-bold text-[var(--color-neutral-900)] border-b border-[var(--color-neutral-100)] pb-3">Company Payroll & Overtime Rules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--color-neutral-500)] mb-1.5">Default Frequency *</label>
                <select
                  name="default_frequency_id"
                  defaultValue={(payrollConfig?.default_frequency_id as string) || frequencies[0]?.frequency_id as string}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-neutral-300)] text-sm bg-white focus:outline-none focus:border-[var(--color-primary-500)]"
                >
                  {frequencies.map((freq) => (
                    <option key={freq.frequency_id as string} value={freq.frequency_id as string}>
                      {freq.frequency_name as string}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--color-neutral-500)] mb-1.5">Default Working Days per Month *</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="31"
                  name="default_working_days_per_month"
                  defaultValue={(payrollConfig?.default_working_days_per_month as number) || 26.0}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-neutral-300)] text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--color-neutral-500)] mb-1.5">Default Working Hours per Day *</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="24"
                  name="default_working_hours_per_day"
                  defaultValue={(payrollConfig?.default_working_hours_per_day as number) || 8.0}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-neutral-300)] text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--color-neutral-500)] mb-1.5">Default Overtime Multiplier *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1.0"
                  name="default_overtime_multiplier"
                  defaultValue={(payrollConfig?.default_overtime_multiplier as number) || 1.25}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-neutral-300)] text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)]">
                <div>
                  <h4 className="text-sm font-semibold text-[var(--color-neutral-900)]">Allow Manual Adjustments</h4>
                  <p className="text-xs text-[var(--color-neutral-500)]">Enables adding custom earnings and deductions during input</p>
                </div>
                <select
                  name="allow_manual_adjustments"
                  defaultValue={payrollConfig?.allow_manual_adjustments !== false ? "true" : "false"}
                  className="px-3 py-1.5 rounded-lg text-sm bg-white border border-[var(--color-neutral-300)] font-semibold"
                >
                  <option value="true">Yes, Allowed</option>
                  <option value="false">No, Blocked</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)]">
                <div>
                  <h4 className="text-sm font-semibold text-[var(--color-neutral-900)]">Require Manager Approval</h4>
                  <p className="text-xs text-[var(--color-neutral-500)]">Enforces two-step review before finalization lock</p>
                </div>
                <select
                  name="require_manager_approval"
                  defaultValue={payrollConfig?.require_manager_approval !== false ? "true" : "false"}
                  className="px-3 py-1.5 rounded-lg text-sm bg-white border border-[var(--color-neutral-300)] font-semibold"
                >
                  <option value="true">Yes, Required</option>
                  <option value="false">No, Direct Finalization</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-[var(--color-neutral-100)]">
              <Button type="submit" disabled={isPending}>{isPending ? "Saving rules..." : "Save Payroll Rules"}</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab Content 3: User Accounts & Roles */}
      {activeTab === "users" && (
        <Card className="animate-fade-in" padding={false}>
          <div className="p-6 flex items-center justify-between border-b border-[var(--color-neutral-100)]">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-neutral-900)]">Staff User Accounts & RBAC Matrix</h2>
              <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">Manage permissions, invite new staff, or disable active logins</p>
            </div>
            <Button onClick={() => setShowNewUserModal(true)}>+ Invite New Staff</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)]">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Username / Email</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">RBAC Assigned Role</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Account Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-neutral-500)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-neutral-100)]">
                {users.map((usr) => (
                  <tr key={usr.user_id as string} className="hover:bg-[var(--color-neutral-50)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-[var(--color-neutral-900)]">{usr.username as string}</div>
                      <div className="text-xs text-[var(--color-neutral-500)]">{usr.email as string}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        defaultValue={(usr.role as Record<string, unknown>)?.role_id as string}
                        onChange={(e) => handleUserRoleChange(usr.user_id as string, e.target.value)}
                        disabled={isPending || usr.username === "system_admin"}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[var(--color-neutral-300)] focus:outline-none focus:border-[var(--color-primary-500)]"
                      >
                        {roles.map((rl) => (
                          <option key={rl.role_id as string} value={rl.role_id as string}>
                            {rl.role_name as string}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={usr.account_status as string} variant={getStatusVariant(usr.account_status as string)} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {usr.username !== "system_admin" ? (
                        <button
                          onClick={() => handleUserStatusToggle(usr.user_id as string, usr.account_status as string)}
                          disabled={isPending}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                            usr.account_status === "ACTIVE"
                              ? "text-[var(--color-danger-700)] bg-[var(--color-danger-50)] hover:bg-[var(--color-danger-100)]"
                              : "text-[var(--color-success-700)] bg-[var(--color-success-50)] hover:bg-[var(--color-success-100)]"
                          }`}
                        >
                          {usr.account_status === "ACTIVE" ? "Disable" : "Enable"}
                        </button>
                      ) : (
                        <span className="text-xs text-[var(--color-neutral-400)] italic">Root Account</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab Content 4: System Backup & Restore */}
      {activeTab === "backup" && (
        <Card className="animate-fade-in" padding={false}>
          <div className="p-6 flex items-center justify-between border-b border-[var(--color-neutral-100)]">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-neutral-900)]">Database Snapshot & Restore Utility</h2>
              <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">Create immutable JSON snapshots of all employees, attendance inputs, and finalized runs</p>
            </div>
            <Button onClick={handleCreateBackup} disabled={isPending}>
              {isPending ? "Generating snapshot..." : "📥 Create System Backup"}
            </Button>
          </div>

          <div className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-neutral-500)] mb-4">Past Backup Snapshots</h3>
            {backups.length === 0 ? (
              <div className="text-center py-12 bg-[var(--color-neutral-50)] rounded-xl border border-dashed border-[var(--color-neutral-300)]">
                <span className="text-3xl">🛡️</span>
                <p className="text-sm font-semibold mt-2 text-[var(--color-neutral-900)]">No backups created yet</p>
                <p className="text-xs text-[var(--color-neutral-500)] mt-1">Click Create System Backup above to download your first snapshot.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {backups.map((bkp) => (
                  <div key={bkp.backup_file_id as string} className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-neutral-200)] bg-[var(--color-surface)] hover:bg-[var(--color-neutral-50)] transition-colors">
                    <div>
                      <div className="text-sm font-bold font-mono text-[var(--color-primary-600)]">{bkp.file_path as string}</div>
                      <div className="text-xs text-[var(--color-neutral-500)] mt-0.5">{bkp.remarks as string}</div>
                      <div className="text-[10px] text-[var(--color-neutral-400)] font-mono mt-1">SHA-256 Hash: {bkp.file_hash as string}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-[var(--color-neutral-500)]">By {(bkp.users as Record<string, unknown>)?.username as string}</span>
                      <button
                        onClick={() => setSelectedBackupForRestore(bkp)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--color-warning-700)] bg-[var(--color-warning-50)] hover:bg-[var(--color-warning-100)] border border-[var(--color-warning-200)] transition-colors"
                      >
                        Inspect / Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Modal: Invite New Staff */}
      {showNewUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-[var(--color-surface)] w-full max-w-md rounded-2xl shadow-xl border border-[var(--color-neutral-200)] overflow-hidden">
            <div className="p-6 border-b border-[var(--color-neutral-100)] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-neutral-900)]">Invite New Staff Member</h3>
                <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">Provision a new account in Supabase GoTrue Auth</p>
              </div>
              <button onClick={() => setShowNewUserModal(false)} className="text-xl font-bold opacity-50 hover:opacity-100">×</button>
            </div>
            <form onSubmit={handleCreateUserSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--color-neutral-500)] mb-1">Username *</label>
                <input
                  type="text"
                  name="username"
                  placeholder="e.g. payroll_officer_2"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-neutral-300)] text-sm focus:outline-none focus:border-[var(--color-primary-500)] font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--color-neutral-500)] mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="e.g. staff@visualoptions.ph"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-neutral-300)] text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--color-neutral-500)] mb-1">RBAC System Role *</label>
                <select
                  name="role_id"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-neutral-300)] text-sm bg-white focus:outline-none focus:border-[var(--color-primary-500)] font-semibold"
                >
                  {roles.map((rl) => (
                    <option key={rl.role_id as string} value={rl.role_id as string}>
                      {rl.role_name as string} ({rl.description as string})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--color-neutral-500)] mb-1">Temporary Login Password *</label>
                <input
                  type="password"
                  name="password"
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-neutral-300)] text-sm focus:outline-none focus:border-[var(--color-primary-500)]"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-neutral-100)]">
                <Button type="button" variant="ghost" onClick={() => setShowNewUserModal(false)}>Cancel</Button>
                <Button type="submit" disabled={isPending}>{isPending ? "Creating..." : "Invite User"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Restore/Inspect Backup */}
      {selectedBackupForRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="bg-[var(--color-surface)] w-full max-w-lg rounded-2xl shadow-xl border border-[var(--color-neutral-200)] overflow-hidden">
            <div className="p-6 border-b border-[var(--color-neutral-100)] flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-neutral-900)]">Inspect / Restore System Backup</h3>
                <p className="text-xs text-[var(--color-neutral-500)] mt-0.5">Validate snapshot JSON payload against live database schema</p>
              </div>
              <button onClick={() => setSelectedBackupForRestore(null)} className="text-xl font-bold opacity-50 hover:opacity-100">×</button>
            </div>
            <form onSubmit={handleRestoreSubmit} className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-[var(--color-info-50)] border border-[var(--color-info-200)] text-xs text-[var(--color-info-700)]">
                <span className="font-bold">Target Snapshot:</span> {selectedBackupForRestore.file_path as string}
                <br />
                <span className="font-bold mt-1 block">Remarks:</span> {selectedBackupForRestore.remarks as string}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--color-neutral-500)] mb-1">Paste Snapshot JSON Payload *</label>
                <textarea
                  rows={6}
                  placeholder='Paste the content of your downloaded .json backup file here...'
                  value={restorePayload}
                  onChange={(e) => setRestorePayload(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg border border-[var(--color-neutral-300)] text-xs font-mono focus:outline-none focus:border-[var(--color-primary-500)]"
                ></textarea>
                <p className="text-[10px] text-[var(--color-neutral-400)] mt-1">This will validate the cryptographic hash and record an immutable restore operation audit entry.</p>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--color-neutral-100)]">
                <Button type="button" variant="ghost" onClick={() => setSelectedBackupForRestore(null)}>Cancel</Button>
                <Button type="submit" disabled={isPending || !restorePayload}>
                  {isPending ? "Validating & Restoring..." : "Execute System Restore"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
