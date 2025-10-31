
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
  }) => {
    setLoading(true);
    try {
      // Extract questionnaire data if provided
      const { questionnaireData, ...registrationData } = userData;
      
      // Step 1: Check profile tables for this email - this is more reliable than auth.users
      const [customerResponse, vendorResponse, adminResponse] = await Promise.all([
        supabase.from("customer_profiles").select("email").eq("email", registrationData.email!).maybeSingle(),
        supabase.from("vendor_profiles").select("email").eq("email", registrationData.email!).maybeSingle(),
        supabase.from("admin_profiles").select("email").eq("email", registrationData.email!).maybeSingle()
      ]);
      
      // If email exists in any profile table, don't allow registration
      if (customerResponse.data || vendorResponse.data || adminResponse.data) {
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

      // Step 4: Attempt to sign up
      const { data, error } = await supabase.auth.signUp({
        email: registrationData.email!,
        password: registrationData.password,
        options: {
          data: userMetadata,
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) {
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
        toast.error("Email already in use", {
          description: "This email is already registered. Please log in or use a different email address."
        });
        setLoading(false);
        return;
      }

      if (data.user) {
        // Questionnaire data will be saved after email confirmation during login
        toast.success("Registration successful!", {
          description: "Please check your email from noreply@energiwise.ca to confirm your account before logging in."
        });
        
        // Sign out immediately for email/password registration
        await supabase.auth.signOut();
        setUser(null);
        
        navigate("/login");
      }
    } catch (err) {
      handleAuthError(err, "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { register };
};
