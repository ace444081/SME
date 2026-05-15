"use client";

import { PageHeader, Card } from "@/components/ui/shared";
import { submitPayslipConcern, submitProfileChangeRequest } from "@/features/portal/actions";
import { useState } from "react";

export default function PortalRequestsPage() {
  const [concernStatus, setConcernStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [profileStatus, setProfileStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleConcernSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setConcernStatus("submitting");
    const res = await submitPayslipConcern(new FormData(e.currentTarget));
    if (res.error) setConcernStatus("error");
    else setConcernStatus("success");
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileStatus("submitting");
    const res = await submitProfileChangeRequest(new FormData(e.currentTarget));
    if (res.error) setProfileStatus("error");
    else setProfileStatus("success");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader title="Requests & Concerns" description="Submit requests to HR or Payroll" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payslip Concern Form */}
        <Card>
          <h2 className="text-sm font-semibold mb-4 text-[var(--color-neutral-900)]">File a Payslip Concern</h2>
          <form onSubmit={handleConcernSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-[var(--color-neutral-700)]">Payroll Period ID</label>
              <input 
                name="payroll_period_id" required placeholder="Paste Period ID here"
                className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--color-neutral-300)] bg-[var(--color-neutral-50)] text-[var(--color-neutral-900)]"
              />
              <p className="text-[10px] text-[var(--color-neutral-500)] mt-1">You can find this on your downloaded payslip.</p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-[var(--color-neutral-700)]">Concern Details</label>
              <textarea 
                name="concern_text" required rows={4} placeholder="E.g. Missing overtime hours for May 2nd..."
                className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--color-neutral-300)] bg-[var(--color-neutral-50)] text-[var(--color-neutral-900)]"
              />
            </div>
            <button 
              type="submit" disabled={concernStatus === "submitting" || concernStatus === "success"}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-[var(--color-primary-600)] hover:bg-[var(--color-primary-700)] disabled:opacity-50 transition-colors"
            >
              {concernStatus === "submitting" ? "Submitting..." : concernStatus === "success" ? "Submitted Successfully" : "Submit Concern"}
            </button>
            {concernStatus === "error" && <p className="text-xs text-[var(--color-danger-600)]">Failed to submit. Please try again.</p>}
          </form>
        </Card>

        {/* Profile Change Form */}
        <Card>
          <h2 className="text-sm font-semibold mb-4 text-[var(--color-neutral-900)]">Request Profile Update</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-[var(--color-neutral-700)]">Change Type</label>
              <select 
                name="change_type" required
                className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--color-neutral-300)] bg-[var(--color-neutral-50)] text-[var(--color-neutral-900)]"
              >
                <option value="ADDRESS">Address</option>
                <option value="CONTACT">Contact Number</option>
                <option value="CIVIL_STATUS">Civil Status</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-[var(--color-neutral-700)]">New Details (JSON format for now)</label>
              <textarea 
                name="requested_changes" required rows={4} placeholder='{"new_address": "123 New St"}'
                className="w-full px-3 py-2 rounded-lg text-sm border border-[var(--color-neutral-300)] bg-[var(--color-neutral-50)] text-[var(--color-neutral-900)] font-mono"
              />
            </div>
            <button 
              type="submit" disabled={profileStatus === "submitting" || profileStatus === "success"}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-[var(--color-neutral-700)] bg-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-300)] border border-[var(--color-neutral-300)] disabled:opacity-50 transition-colors"
            >
              {profileStatus === "submitting" ? "Submitting..." : profileStatus === "success" ? "Submitted Successfully" : "Submit Request"}
            </button>
            {profileStatus === "error" && <p className="text-xs text-[var(--color-danger-600)]">Failed to submit. Please try again.</p>}
          </form>
        </Card>
      </div>
    </div>
  );
}
