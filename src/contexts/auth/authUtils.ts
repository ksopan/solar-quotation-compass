
import { User } from "./types";
import { toast } from "sonner";

// Transform Supabase user data to our User interface
export const transformUserData = (supabaseUser: any): User => {
  const metadata = supabaseUser.user_metadata || {};
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    role: metadata.role || "customer",
    fullName: metadata.fullName,
    firstName: metadata.firstName,
    lastName: metadata.lastName,
    companyName: metadata.companyName,
    address: metadata.address,
    phone: metadata.phone
  };
};

// Check if user profile is complete based on their role
export const isProfileComplete = (user: User | null): boolean => {
  if (!user) return false;

  const { role, fullName, firstName, lastName, address, phone, companyName } = user;

  if (role === "customer") {
    return !!(firstName && lastName && address && phone);
  } else if (role === "vendor") {
    return !!(firstName && lastName && companyName && address && phone);
  } else if (role === "admin") {
    return !!(fullName || (firstName && lastName));
  }

  return false;
};

// Get display name based on user role and available fields
export const getDisplayName = (user: User | null): string => {
  if (!user) return "";
  
  if (user.role === "vendor") {
    return user.companyName || `${user.firstName || ""} ${user.lastName || ""}`.trim();
  } else if (user.role === "admin") {
    return user.fullName || "Admin";
  } else {
    // Customer
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;
  }
};

// Create error handler for auth operations
export const handleAuthError = (err: unknown, defaultMessage: string): void => {
  toast.error(err instanceof Error ? err.message : defaultMessage);
  console.error("Auth error:", err);
};
