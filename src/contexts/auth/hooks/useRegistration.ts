
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
      // Step 1: Check profile tables for this email
      const [customerResponse, vendorResponse, adminResponse] = await Promise.all([
        supabase.from("customer_profiles").select("email").eq("email", userData.email!).maybeSingle(),
        supabase.from("vendor_profiles").select("email").eq("email", userData.email!).maybeSingle(),
        supabase.from("admin_profiles").select("email").eq("email", userData.email!).maybeSingle()
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
        email: userData.email!,
        password: "ThisIsADeliberatelyIncorrectPassword123!@#"  // Use a complex password that won't match
      });
      
      // If there's no "Invalid login credentials" error, the email exists
      // This checks if we got an error but it's NOT the expected "invalid login" error
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

      // Step 4: Attempt to sign up
      const { data, error } = await supabase.auth.signUp({
        email: userData.email!,
        password: userData.password,
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
