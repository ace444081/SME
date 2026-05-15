import { z } from "zod";

export const employeeSchema = z.object({
  employee_no: z.string().min(1, "Employee number is required"),
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().nullable().optional(),
  last_name: z.string().min(1, "Last name is required"),
  suffix: z.string().nullable().optional(),
  birth_date: z.string().nullable().optional(),
  sex: z.enum(["MALE", "FEMALE"]).nullable().optional(),
  civil_status: z.enum(["SINGLE", "MARRIED", "WIDOWED", "DIVORCED"]).nullable().optional(),
  contact_number: z.string().nullable().optional(),
  email: z.string().email("Invalid email").nullable().optional().or(z.literal("")),
  address_line: z.string().nullable().optional(),
  department_id: z.string().uuid().nullable().optional(),
  position_id: z.string().uuid().nullable().optional(),
  employment_status_id: z.string().uuid("Employment status is required"),
  hire_date: z.string().min(1, "Hire date is required"),
});

export const employeeRateSchema = z.object({
  employee_id: z.string().uuid(),
  pay_basis: z.enum(["MONTHLY", "DAILY", "HOURLY"]),
  rate_amount: z.coerce.number().positive("Rate must be a positive number"),
  effective_from: z.string().min(1, "Effective from date is required"),
  change_reason: z.string().nullable().optional(),
});
