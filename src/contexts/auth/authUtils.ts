
import { User } from "./types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Fetch user role from database (server-side validation)
const fetchUserRole = async (userId: string): Promise<"customer" | "vendor" | "admin"> => {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    console.error("Failed to fetch user role:", error);
    return "customer"; // Safe default
  }

  return data.role as "customer" | "vendor" | "admin";
};

// Transform Supabase user data to our User interface
export const transformUserData = async (supabaseUser: any): Promise<User> => {
  const metadata = supabaseUser.user_metadata || {};
  
  // Fetch role from database instead of trusting JWT metadata
  const role = await fetchUserRole(supabaseUser.id);
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    role,
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
