
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

  const register = async (userData: Partial<User> & { password: string; role: UserRole }) => {
    setLoading(true);
    try {
      // First check if the email already exists in profile tables
      const { data: existingUsers, error: searchError } = await supabase
        .from("customer_profiles")
        .select("email")
        .eq("email", userData.email!)
        .maybeSingle();
        
      if (searchError) {
        console.error("Error checking existing email:", searchError);
      }
      
      // Also check in vendor_profiles
      const { data: existingVendors, error: vendorSearchError } = await supabase
        .from("vendor_profiles")
        .select("email")
        .eq("email", userData.email!)
        .maybeSingle();
        
      if (vendorSearchError) {
        console.error("Error checking existing email in vendors:", vendorSearchError);
      }
      
      // Also check in admin_profiles
      const { data: existingAdmins, error: adminSearchError } = await supabase
        .from("admin_profiles")
        .select("email")
        .eq("email", userData.email!)
        .maybeSingle();
        
      if (adminSearchError) {
        console.error("Error checking existing email in admins:", adminSearchError);
      }
      
      // If email exists in any profile table, don't allow registration
      if (existingUsers || existingVendors || existingAdmins) {
        toast.error("Email already in use", {
          description: "This email is already registered. Please log in or use a different email address."
        });
        setLoading(false);
        return;
      }

      // Prepare metadata based on role
      const userMetadata: Record<string, any> = {
        role: userData.role
      };

      // Add appropriate fields based on role
      if (userData.role === "customer" || userData.role === "vendor") {
        userMetadata.firstName = userData.firstName || "";
        userMetadata.lastName = userData.lastName || "";
        userMetadata.address = userData.address || "";
        userMetadata.phone = userData.phone || "";
      }
      
      // Add company name for vendors
      if (userData.role === "vendor") {
        userMetadata.companyName = userData.companyName || "";
      }

      // Admin fields
      if (userData.role === "admin") {
        userMetadata.fullName = userData.fullName || "";
      }

      const { data, error } = await supabase.auth.signUp({
        email: userData.email!,
        password: userData.password,
        options: {
          data: userMetadata,
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) {
        // Handle duplicate email error from auth.signUp
        if (error.message.includes("already registered")) {
          toast.error("Email already in use", {
            description: "This email is already registered. Please log in or use a different email address."
          });
          setLoading(false);
          return;
        }
        throw new Error(error.message);
      }

      if (data.user) {
        // Check if there's a questionnaire ID in session storage and associate it with the user
        const questionnaireId = sessionStorage.getItem("questionnaire_id");
        if (questionnaireId && userData.role === "customer") {
          console.log("Associating questionnaire with new user:", data.user.id);
          
          // First check if questionnaire exists and is not already associated
          const { data: questionnaireData, error: fetchError } = await supabase
            .from("property_questionnaires")
            .select("customer_id")
            .eq("id", questionnaireId)
            .single();
            
          if (fetchError) {
            console.error("Error fetching questionnaire:", fetchError);
          } else if (!questionnaireData.customer_id) {
            // Only update if the customer_id is null
            const { error: updateError } = await supabase
              .from("property_questionnaires")
              .update({ 
                customer_id: data.user.id, 
                is_completed: true 
              })
              .eq("id", questionnaireId);
              
            if (updateError) {
              console.error("Error associating questionnaire with user:", updateError);
            } else {
              console.log("Successfully associated questionnaire with user");
              sessionStorage.removeItem("questionnaire_id");
            }
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
