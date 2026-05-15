import { z } from "zod";

export const attendanceInputSchema = z.object({
  payroll_period_id: z.string().uuid("Period is required"),
  employee_id: z.string().uuid("Employee is required"),
  days_worked: z.coerce.number().min(0, "Days worked cannot be negative"),
  regular_hours_worked: z.coerce.number().min(0).nullable().optional(),
  absence_days: z.coerce.number().min(0, "Absence days cannot be negative").default(0),
  late_minutes: z.coerce.number().min(0, "Late minutes cannot be negative").default(0),
  undertime_minutes: z.coerce.number().min(0, "Undertime minutes cannot be negative").default(0),
  overtime_hours: z.coerce.number().min(0, "Overtime hours cannot be negative").default(0),
  rest_day_overtime_hours: z.coerce.number().min(0).nullable().optional(),
  holiday_overtime_hours: z.coerce.number().min(0).nullable().optional(),
  remarks: z.string().nullable().optional(),
});
