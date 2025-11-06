import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "../types";
import { handleAuthError } from "../authUtils";

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
    console.log("🔵 [useRegistration] Starting registration");
    setLoading(true);
    
    try {
      const { questionnaireData, fromQuestionnaireFlow, ...registrationData } = userData;
      
      console.log("🔵 [useRegistration] Checking if email exists in profiles");
      
      // Check if email already exists in any profile table
      const [customerResponse, vendorResponse, adminResponse] = await Promise.all([
        supabase.from("customer_profiles").select("email").eq("email", registrationData.email!).maybeSingle(),
        supabase.from("vendor_profiles").select("email").eq("email", registrationData.email!).maybeSingle(),
        supabase.from("admin_profiles").select("email").eq("email", registrationData.email!).maybeSingle()
      ]);
      
      if (customerResponse.data || vendorResponse.data || adminResponse.data) {
        console.log("🔴 [useRegistration] Email already exists in profiles");
        toast.error("Email already in use", {
          description: "This email is already registered. Please log in or use a different email."
        });
        setLoading(false);
        return;
      }

      // Check if this email was already verified via questionnaire
      let emailAlreadyVerified = false;
      let questionnaireId: string | null = null;
      
      if (fromQuestionnaireFlow) {
        const storedQuestionnaireId = localStorage.getItem("questionnaire_id") || sessionStorage.getItem("questionnaire_id");
        
        if (storedQuestionnaireId) {
          try {
            console.log("🔵 [useRegistration] Checking questionnaire verification");
            const { data: verificationData, error: verificationError } = await supabase.functions.invoke(
              "check-questionnaire-verified",
              { body: { questionnaireId: storedQuestionnaireId } }
            );
            
            if (!verificationError && verificationData?.verified) {
              emailAlreadyVerified = true;
              questionnaireId = verificationData.questionnaireId;
              console.log("✅ [useRegistration] Email already verified via questionnaire");
            }
          } catch (err) {
            console.error("❌ [useRegistration] Error checking questionnaire:", err);
          }
        }
      }
      // Prepare user metadata
      const userMetadata: Record<string, any> = {
        role: registrationData.role,
        // CRITICAL: Always set custom_email_verified based on our verification flow
        // Don't rely on Supabase's email_verified
        custom_email_verified: emailAlreadyVerified,
      };

      if (registrationData.role === "customer" || registrationData.role === "vendor") {
        userMetadata.firstName = registrationData.firstName || "";
        userMetadata.lastName = registrationData.lastName || "";
        userMetadata.address = registrationData.address || "";
        userMetadata.phone = registrationData.phone || "";
      }
      
      if (registrationData.role === "vendor") {
        userMetadata.companyName = registrationData.companyName || "";
      }

      if (registrationData.role === "admin") {
        userMetadata.fullName = registrationData.fullName || "";
      }

      console.log("🔵 [useRegistration] Signing up user");
      
      // Sign up user with auto-confirm (we handle verification manually)
      // This prevents Supabase from sending default confirmation emails
      const { data, error } = await supabase.auth.signUp({
        email: registrationData.email!,
        password: registrationData.password,
        options: {
          data: userMetadata,
          emailRedirectTo: undefined, // Disable default email confirmation
        }
      });

      if (error) {
        console.error("🔴 [useRegistration] Signup error:", error);
        if (error.message.toLowerCase().includes("already") || 
            error.message.toLowerCase().includes("exist") || 
            error.message.toLowerCase().includes("registered")) {
          toast.error("Email already in use", {
            description: "This email is already registered. Please log in."
          });
          setLoading(false);
          return;
        }
        throw new Error(error.message);
      }

      // Check if user already exists
      if (data.user?.identities?.length === 0) {
        console.log("🔴 [useRegistration] User exists but no identities");
        toast.error("Email already in use", {
          description: "This email is already registered. Please log in."
        });
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log("✅ [useRegistration] User created successfully");
        const userId = data.user.id;
        
        // CRITICAL: For Get Free Quotes flow, link questionnaire BEFORE signing out
        // This ensures the operation completes with proper auth context
        if (emailAlreadyVerified && questionnaireId) {
          try {
            console.log("🔗 [useRegistration] Linking questionnaire via edge function");
            const { error: linkError } = await supabase.functions.invoke("confirm-questionnaire-user", {
              body: {
                userId: userId,
                questionnaireId: questionnaireId,
              },
            });
            
            if (linkError) {
              console.error("❌ [useRegistration] Failed to link questionnaire:", linkError);
            } else {
              console.log("✅ [useRegistration] Questionnaire linked successfully");
            }
          } catch (err) {
            console.error("❌ [useRegistration] Error linking questionnaire:", err);
          }
        }
        
        // CRITICAL: Now sign out completely to prevent auto-login
        console.log("🔵 [useRegistration] Signing out to prevent auto-login");
        
        // Step 1: Sign out from auth
        await supabase.auth.signOut({ scope: 'global' });
        
        // Step 2: Clear user state
        setUser(null);
        
        // Step 3: Aggressively clear ALL storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Step 4: Wait and verify session is completely cleared
        await new Promise(resolve => setTimeout(resolve, 200));
        const { data: sessionCheck } = await supabase.auth.getSession();
        if (sessionCheck.session) {
          console.log("⚠️ [useRegistration] Session still exists, forcing complete cleanup");
          await supabase.auth.signOut({ scope: 'global' });
          localStorage.clear();
          sessionStorage.clear();
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        console.log("✅ [useRegistration] Session cleared successfully");
        
        // Restore questionnaire data only if it was from that flow
        if (emailAlreadyVerified && questionnaireId) {
          localStorage.setItem("questionnaire_completed", "true");
          
          toast.success("Account created successfully!", {
            description: "Please log in to access your solar quotation request."
          });
        } else {
          // Send verification email via Resend for regular registration
          try {
            console.log("📧 [useRegistration] Sending verification email via Resend");
            const { error: emailError } = await supabase.functions.invoke("send-registration-verification", {
              body: {
                userId: userId,
                email: registrationData.email,
                firstName: registrationData.firstName,
                lastName: registrationData.lastName,
                role: registrationData.role,
              },
            });
            
            if (emailError) {
              console.error("❌ [useRegistration] Failed to send verification email:", emailError);
              toast.error("Account created but failed to send verification email", {
                description: "Please contact support."
              });
            } else {
              console.log("✅ [useRegistration] Verification email sent");
              toast.success("Registration successful!", {
                description: "Please check your email to verify your account before logging in."
              });
            }
          } catch (emailErr) {
            console.error("❌ [useRegistration] Error sending verification email:", emailErr);
            toast.error("Account created but failed to send verification email", {
              description: "Please contact support."
            });
          }
        }
        
        // Step 5: Navigate to login AFTER everything is cleaned up
        console.log("🔵 [useRegistration] Navigating to login page");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 100);
      }
    } catch (err) {
      console.error("🔴 [useRegistration] Caught error:", err);
      handleAuthError(err, "Registration failed");
      throw err;
    } finally {
      console.log("🔵 [useRegistration] Setting loading to false");
      setLoading(false);
    }
  };

  return { register };
};
