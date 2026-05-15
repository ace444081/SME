import { z } from "zod";

export const companySchema = z.object({
  company_name: z.string().min(1, "Company Name is required"),
  business_name: z.string().nullable().optional(),
  tin: z.string().nullable().optional(),
  address_line: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  province: z.string().nullable().optional(),
  postal_code: z.string().nullable().optional(),
  contact_number: z.string().nullable().optional(),
  email: z.string().email("Invalid email").nullable().optional(),
});

export const payrollConfigSchema = z.object({
  default_frequency_id: z.string().min(1, "Default Frequency is required"),
  default_working_days_per_month: z.number().min(1).max(31),
  default_working_hours_per_day: z.number().min(1).max(24),
  default_overtime_multiplier: z.number().min(1),
  allow_manual_adjustments: z.boolean(),
  require_manager_approval: z.boolean(),
});
