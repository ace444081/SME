"use client";

import { PageHeader, Card } from "@/components/ui/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";

const frequencies = [
  { frequency_id: "f1", frequency_name: "Daily" },
  { frequency_id: "f2", frequency_name: "Weekly" },
  { frequency_id: "f3", frequency_name: "Semi-monthly" },
  { frequency_id: "f4", frequency_name: "Monthly" },
];

export default function NewPayrollPeriodPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSaving(false);
    router.push("/payroll-periods");
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <PageHeader title="Create Payroll Period" description="Set up a new payroll period with cut-off dates" />

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="period_code" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-neutral-700)" }}>
                  Period Code <span style={{ color: "var(--color-danger-500)" }}>*</span>
                </label>
                <input id="period_code" name="period_code" required placeholder="2026-05-A"
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: "1px solid var(--color-neutral-300)", background: "var(--color-neutral-50)", color: "var(--color-neutral-900)" }}
                />
              </div>
              <div>
                <label htmlFor="frequency_id" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-neutral-700)" }}>
                  Frequency <span style={{ color: "var(--color-danger-500)" }}>*</span>
                </label>
                <select id="frequency_id" name="frequency_id" required className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: "1px solid var(--color-neutral-300)", background: "var(--color-neutral-50)", color: "var(--color-neutral-900)" }}
                >
                  <option value="">Select...</option>
                  {frequencies.map((f) => (
                    <option key={f.frequency_id} value={f.frequency_id}>{f.frequency_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="period_name" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-neutral-700)" }}>
                Period Name <span style={{ color: "var(--color-danger-500)" }}>*</span>
              </label>
              <input id="period_name" name="period_name" required placeholder="May 1st Cut-off 2026"
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ border: "1px solid var(--color-neutral-300)", background: "var(--color-neutral-50)", color: "var(--color-neutral-900)" }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="period_start_date" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-neutral-700)" }}>
                  Period Start <span style={{ color: "var(--color-danger-500)" }}>*</span>
                </label>
                <input id="period_start_date" name="period_start_date" type="date" required
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: "1px solid var(--color-neutral-300)", background: "var(--color-neutral-50)", color: "var(--color-neutral-900)" }}
                />
              </div>
              <div>
                <label htmlFor="period_end_date" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-neutral-700)" }}>
                  Period End <span style={{ color: "var(--color-danger-500)" }}>*</span>
                </label>
                <input id="period_end_date" name="period_end_date" type="date" required
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: "1px solid var(--color-neutral-300)", background: "var(--color-neutral-50)", color: "var(--color-neutral-900)" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cutoff_start_date" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-neutral-700)" }}>
                  Cut-off Start <span style={{ color: "var(--color-danger-500)" }}>*</span>
                </label>
                <input id="cutoff_start_date" name="cutoff_start_date" type="date" required
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: "1px solid var(--color-neutral-300)", background: "var(--color-neutral-50)", color: "var(--color-neutral-900)" }}
                />
              </div>
              <div>
                <label htmlFor="cutoff_end_date" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-neutral-700)" }}>
                  Cut-off End <span style={{ color: "var(--color-danger-500)" }}>*</span>
                </label>
                <input id="cutoff_end_date" name="cutoff_end_date" type="date" required
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: "1px solid var(--color-neutral-300)", background: "var(--color-neutral-50)", color: "var(--color-neutral-900)" }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="pay_date" className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-neutral-700)" }}>
                Pay Date
              </label>
              <input id="pay_date" name="pay_date" type="date"
                className="w-full px-3 py-2 rounded-lg text-sm"
                style={{ border: "1px solid var(--color-neutral-300)", background: "var(--color-neutral-50)", color: "var(--color-neutral-900)" }}
              />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: "var(--color-neutral-100)", color: "var(--color-neutral-700)", border: "1px solid var(--color-neutral-300)" }}
          >
            Cancel
          </button>
          <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))" }}
          >
            {saving ? "Creating..." : "Create Period"}
          </button>
        </div>
      </form>
    </div>
  );
}
