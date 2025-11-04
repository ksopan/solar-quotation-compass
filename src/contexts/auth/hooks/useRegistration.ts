
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
      
      // Step 1: Check if email was already verified via questionnaire
      let emailAlreadyVerified = false;
      let questionnaireId: string | null = null;
      
      if (fromQuestionnaireFlow) {
        const { data: verifiedQuestionnaire } = await supabase
          .from("property_questionnaires")
          .select("id, verified_at, email")
          .eq("email", registrationData.email!)
          .not("verified_at", "is", null)
          .maybeSingle();
        
        emailAlreadyVerified = !!verifiedQuestionnaire;
        questionnaireId = verifiedQuestionnaire?.id || null;
        console.log("[useRegistration] Email already verified via questionnaire:", emailAlreadyVerified);
      }
      
      // Step 2: Check profile tables for this email - this is more reliable than auth.users
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
      
      // Step 4: Sign up user (auto-confirmed since we handle verification manually)
      const { data, error } = await supabase.auth.signUp({
        email: registrationData.email!,
        password: registrationData.password,
        options: {
          data: {
            ...userMetadata,
            email_verified: emailAlreadyVerified,
          }
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
        console.log("[useRegistration] User created successfully");
        
        // Sign out immediately to prevent auto-login
        await supabase.auth.signOut();
        setUser(null);
        
        if (emailAlreadyVerified) {
          // Email already verified via questionnaire - link questionnaire and allow login
          if (questionnaireId) {
            try {
              await supabase
                .from("property_questionnaires")
                .update({ customer_id: data.user.id })
                .eq("id", questionnaireId);
              
              console.log("[useRegistration] Linked questionnaire to user");
              
              // Clear stored questionnaire data
              localStorage.removeItem("questionnaire_id");
              localStorage.removeItem("questionnaire_email");
              sessionStorage.removeItem("questionnaire_id");
              sessionStorage.removeItem("questionnaire_data");
            } catch (err) {
              console.error("[useRegistration] Failed to link questionnaire:", err);
            }
          }
          
          toast.success("Account created successfully!", {
            description: "You can now log in with your credentials."
          });
        } else {
          // Send custom verification email via Resend
          try {
            const { error: emailError } = await supabase.functions.invoke("send-registration-verification", {
              body: {
                userId: data.user.id,
                email: registrationData.email,
                firstName: registrationData.firstName,
                lastName: registrationData.lastName,
                role: registrationData.role,
              },
            });
            
            if (emailError) {
              console.error("[useRegistration] Failed to send verification email:", emailError);
              toast.error("Account created but failed to send verification email", {
                description: "Please contact support for assistance."
              });
            } else {
              toast.success("Registration successful!", {
                description: "Please check your email to verify your account before logging in."
              });
            }
          } catch (emailErr) {
            console.error("[useRegistration] Error sending verification email:", emailErr);
            toast.error("Account created but failed to send verification email", {
              description: "Please contact support for assistance."
            });
          }
        }
        
        console.log("[useRegistration] Navigating to login");
        navigate("/login");
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
