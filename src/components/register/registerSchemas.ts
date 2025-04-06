
import { z } from "zod";
import { UserRole } from "@/contexts/auth/types";

// Base schema with common fields
const baseSchema = {
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
};

// Customer specific schema
export const customerSchema = z.object({
  ...baseSchema,
  role: z.literal("customer"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Vendor specific schema
export const vendorSchema = z.object({
  ...baseSchema,
  role: z.literal("vendor"),
  companyName: z.string().min(1, "Company name is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Company address is required"),
  phone: z.string().min(1, "Contact phone is required")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Admin specific schema
export const adminSchema = z.object({
  ...baseSchema,
  role: z.literal("admin"),
  fullName: z.string().min(1, "Full name is required")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Define types for the schemas
export type CustomerSchema = z.infer<typeof customerSchema>;
export type VendorSchema = z.infer<typeof vendorSchema>;
export type AdminSchema = z.infer<typeof adminSchema>;

// Create a union type for all possible form values
export type RegisterFormValues = CustomerSchema | VendorSchema | AdminSchema;
