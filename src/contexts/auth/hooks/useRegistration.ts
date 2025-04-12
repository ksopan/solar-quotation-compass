
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
      
      // Step 1: Check profile tables for this email
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

      // Step 2: Directly check if this email can sign in 
      // This is a more reliable way to see if it exists in the auth system
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: registrationData.email!,
        password: "ThisIsADeliberatelyIncorrectPassword123!@#"  // Use a complex password that won't match
      });
      
      // If there's no "Invalid login credentials" error, the email exists
      if (signInError) {
        if (!signInError.message.includes("Invalid login credentials")) {
          // This is likely a "User already registered" scenario
          toast.error("Email already in use", {
            description: "This email is already registered. Please log in or use a different email address."
          });
          setLoading(false);
          return;
        }
      } else if (signInData.user) {
        // Somehow managed to log in - this is also an indication the account already exists
        toast.error("Email already in use", {
          description: "This email is already registered. Please log in or use a different email address."
        });
        // Sign out since we might have managed to sign in
        await supabase.auth.signOut();
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
        // Step 5: If we have questionnaire data, save it now with the user's ID
        if (questionnaireData && registrationData.role === "customer") {
          console.log("Saving questionnaire data for new user:", data.user.id);
          
          try {
            const { error: insertError } = await supabase
              .from("property_questionnaires")
              .insert({
                property_type: questionnaireData.property_type,
                ownership_status: questionnaireData.ownership_status,
                monthly_electric_bill: questionnaireData.monthly_electric_bill,
                interested_in_batteries: questionnaireData.interested_in_batteries,
                battery_reason: questionnaireData.battery_reason,
                purchase_timeline: questionnaireData.purchase_timeline,
                willing_to_remove_trees: questionnaireData.willing_to_remove_trees,
                roof_age_status: questionnaireData.roof_age_status,
                first_name: questionnaireData.first_name,
                last_name: questionnaireData.last_name,
                email: questionnaireData.email,
                customer_id: data.user.id,
                is_completed: true // Mark as completed since it's linked to a user
              });
              
            if (insertError) {
              console.error("Error saving questionnaire data:", insertError);
            } else {
              console.log("Successfully saved questionnaire with user ID");
            }
          } catch (saveError) {
            console.error("Error in questionnaire save operation:", saveError);
          }
        }
        
        // Email/password signup (always requires email confirmation)
        toast.success("Registration successful!", {
          description: "Please check your email to confirm your account before logging in."
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
