import { z } from "zod";
import { commonValidations } from "./validation";

// Registration schema with comprehensive validation
export const registrationSchema = z.object({
  email: commonValidations.email,
  password: commonValidations.password,
  name: z.string().trim().min(2).max(50).optional().or(z.literal("")),
  lastname: z.string().trim().min(2).max(50).optional().or(z.literal("")),
  phone: z.string().trim().min(7).max(20).optional().or(z.literal("")),
});

// Login schema (for future use)
export const loginSchema = z.object({
  email: commonValidations.email,
  password: z.string().min(1, "Password is required"),
});

// Generic validation schema (keeping existing for backward compatibility)
const schema = z.object({
  name: z.string().min(3),
  email: z.string().email()
});

export default schema;