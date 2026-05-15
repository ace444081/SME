import { z } from "zod";

export const payrollPeriodSchema = z.object({
  frequency_id: z.string().uuid("Frequency is required"),
  period_code: z.string().min(1, "Period code is required"),
  period_name: z.string().min(1, "Period name is required"),
  period_start_date: z.string().min(1, "Period start date is required"),
  period_end_date: z.string().min(1, "Period end date is required"),
  cutoff_start_date: z.string().min(1, "Cut-off start date is required"),
  cutoff_end_date: z.string().min(1, "Cut-off end date is required"),
  pay_date: z.string().nullable().optional().or(z.literal("")),
}).refine(data => new Date(data.period_end_date) >= new Date(data.period_start_date), {
  message: "Period end date cannot be before start date",
  path: ["period_end_date"],
}).refine(data => new Date(data.cutoff_end_date) >= new Date(data.cutoff_start_date), {
  message: "Cut-off end date cannot be before start date",
  path: ["cutoff_end_date"],
});
