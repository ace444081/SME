"use client";

import { PageHeader, Card } from "@/components/ui/shared";
import { useRouter } from "next/navigation";
import { useState } from "react";

const departments = [
  { department_id: "d1", department_name: "Fabrication" },
  { department_id: "d2", department_name: "Engineering" },
  { department_id: "d3", department_name: "Administration" },
];

const positions = [
  { position_id: "p1", position_title: "Welder" },
  { position_id: "p2", position_title: "Driver" },
  { position_id: "p3", position_title: "Office Staff" },
  { position_id: "p4", position_title: "Project Engineer" },
  { position_id: "p5", position_title: "Laborer" },
];

const statuses = [
  { employment_status_id: "s1", status_name: "Active" },
  { employment_status_id: "s2", status_name: "On Leave" },
  { employment_status_id: "s3", status_name: "Resigned" },
];

interface FieldProps {
  label: string;
  id: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

function FormField({ label, id, type = "text", required = false, placeholder, options }: FieldProps) {
  const baseStyle = {
    border: "1px solid var(--color-neutral-300)",
    background: "var(--color-neutral-50)",
    color: "var(--color-neutral-900)",
  };

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-neutral-700)" }}>
        {label} {required && <span style={{ color: "var(--color-danger-500)" }}>*</span>}
      </label>
      {options ? (
        <select id={id} name={id} required={required} className="w-full px-3 py-2 rounded-lg text-sm" style={baseStyle}>
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          id={id} name={id} type={type} required={required} placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg text-sm" style={baseStyle}
        />
      )}
    </div>
  );
}

export default function NewEmployeePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    // In production this calls createEmployee server action
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSaving(false);
    router.push("/employees");
  };

  return (
    <div className="animate-fade-in max-w-3xl">
      <PageHeader title="Add New Employee" description="Create a new employee record" />

      <form onSubmit={handleSubmit}>
        <Card>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-neutral-900)" }}>Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <FormField label="Employee No." id="employee_no" required placeholder="EMP-006" />
            <FormField label="Hire Date" id="hire_date" type="date" required />
            <FormField label="First Name" id="first_name" required placeholder="Juan" />
            <FormField label="Middle Name" id="middle_name" placeholder="Dela" />
            <FormField label="Last Name" id="last_name" required placeholder="Cruz" />
            <FormField label="Suffix" id="suffix" placeholder="Jr., Sr., III" />
            <FormField label="Birth Date" id="birth_date" type="date" />
            <FormField label="Sex" id="sex" options={[{ value: "MALE", label: "Male" }, { value: "FEMALE", label: "Female" }]} />
            <FormField label="Civil Status" id="civil_status" options={[{ value: "SINGLE", label: "Single" }, { value: "MARRIED", label: "Married" }, { value: "WIDOWED", label: "Widowed" }]} />
            <FormField label="Contact Number" id="contact_number" placeholder="09XX-XXX-XXXX" />
            <FormField label="Email" id="email" type="email" placeholder="juan@example.com" />
            <FormField label="Address" id="address_line" placeholder="123 Street, City" />
          </div>

          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-neutral-900)", borderTop: "1px solid var(--color-neutral-200)", paddingTop: "1.5rem" }}>
            Employment Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <FormField label="Department" id="department_id" options={departments.map(d => ({ value: d.department_id, label: d.department_name }))} />
            <FormField label="Position" id="position_id" options={positions.map(p => ({ value: p.position_id, label: p.position_title }))} />
            <FormField label="Employment Status" id="employment_status_id" required options={statuses.map(s => ({ value: s.employment_status_id, label: s.status_name }))} />
          </div>

          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--color-neutral-900)", borderTop: "1px solid var(--color-neutral-200)", paddingTop: "1.5rem" }}>
            Initial Salary Rate
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <FormField label="Pay Basis" id="pay_basis" required options={[{ value: "MONTHLY", label: "Monthly" }, { value: "DAILY", label: "Daily" }, { value: "HOURLY", label: "Hourly" }]} />
            <FormField label="Rate Amount (₱)" id="rate_amount" type="number" required placeholder="18000.00" />
            <FormField label="Effective From" id="rate_effective_from" type="date" required />
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button" onClick={() => router.back()}
            className="px-5 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: "var(--color-neutral-100)", color: "var(--color-neutral-700)", border: "1px solid var(--color-neutral-300)" }}
          >
            Cancel
          </button>
          <button
            type="submit" disabled={saving}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))" }}
          >
            {saving ? "Saving..." : "Create Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}
