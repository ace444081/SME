import { z } from "zod";

export const userCreateSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
  email: z.string().email("Invalid email address"),
  role_id: z.string().min(1, "Role selection is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
