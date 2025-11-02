
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "../types";
import { handleAuthError, transformUserData } from "../authUtils";

export const useRegistration = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const navigate = useNavigate();

  const register = async (userData: Partial<User> & { 
    password: string; 
    role: UserRole;
    questionnaireData?: any;
    fromQuestionnaireFlow?: boolean;
  }) => {
    console.log("[useRegistration] Starting registration process");
    setLoading(true);
    try {
      // Extract questionnaire data if provided
      const { questionnaireData, fromQuestionnaireFlow, ...registrationData } = userData;
      
      console.log("[useRegistration] Checking existing profiles for email:", registrationData.email);
      // Step 1: Check profile tables for this email - this is more reliable than auth.users
      const [customerResponse, vendorResponse, adminResponse] = await Promise.all([
        supabase.from("customer_profiles").select("email").eq("email", registrationData.email!).maybeSingle(),
        supabase.from("vendor_profiles").select("email").eq("email", registrationData.email!).maybeSingle(),
        supabase.from("admin_profiles").select("email").eq("email", registrationData.email!).maybeSingle()
      ]);
      
      console.log("[useRegistration] Profile check results:", {
        customer: !!customerResponse.data,
        vendor: !!vendorResponse.data,
        admin: !!adminResponse.data
      });
      
      // If email exists in any profile table, don't allow registration
      if (customerResponse.data || vendorResponse.data || adminResponse.data) {
        console.log("[useRegistration] Email already exists in profiles");
        toast.error("Email already in use", {
          description: "This email is already registered. Please log in or use a different email address."
        });
        setLoading(false);
        return;
      }

      // Step 3: Prepare metadata based on role
      const userMetadata: Record<string, any> = {
        role: registrationData.role
      };

      // Add appropriate fields based on role
      if (registrationData.role === "customer" || registrationData.role === "vendor") {
        userMetadata.firstName = registrationData.firstName || "";
        userMetadata.lastName = registrationData.lastName || "";
        userMetadata.address = registrationData.address || "";
        userMetadata.phone = registrationData.phone || "";
      }
      
      // Add company name for vendors
      if (registrationData.role === "vendor") {
        userMetadata.companyName = registrationData.companyName || "";
      }

      // Admin fields
      if (registrationData.role === "admin") {
        userMetadata.fullName = registrationData.fullName || "";
      }

      console.log("[useRegistration] Attempting to sign up user");
      // Step 4: Attempt to sign up
      const { data, error } = await supabase.auth.signUp({
        email: registrationData.email!,
        password: registrationData.password,
        options: {
          data: userMetadata,
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      console.log("[useRegistration] SignUp response:", { 
        hasUser: !!data?.user, 
        hasError: !!error,
        errorMessage: error?.message 
      });

      if (error) {
        console.log("[useRegistration] SignUp error:", error);
        // Handle any signup errors, especially duplicate emails
        if (error.message.toLowerCase().includes("already") || 
            error.message.toLowerCase().includes("exist") || 
            error.message.toLowerCase().includes("registered")) {
          toast.error("Email already in use", {
            description: "This email is already registered. Please log in or use a different email address."
          });
          setLoading(false);
          return;
        }
        throw new Error(error.message);
      }

      // Important: Check if user already exists but confirmation is needed
      if (data.user?.identities?.length === 0) {
        console.log("[useRegistration] User exists but no identities");
        toast.error("Email already in use", {
          description: "This email is already registered. Please log in or use a different email address."
        });
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log("[useRegistration] User created successfully, showing success message");
        // All users must verify their email
        toast.success("Registration successful!", {
          description: "Please check your email to verify your account before logging in."
        });
        
        console.log("[useRegistration] Signing out user");
        // Sign out immediately for email/password registration
        await supabase.auth.signOut();
        setUser(null);
        
        console.log("[useRegistration] Navigating to login");
        navigate("/login");
        console.log("[useRegistration] Navigation called");
      }
    } catch (err) {
      console.error("[useRegistration] Caught error:", err);
      handleAuthError(err, "Registration failed");
      throw err;
    } finally {
      console.log("[useRegistration] Finally block - setting loading to false");
      setLoading(false);
    }
  };

  return { register };
};
