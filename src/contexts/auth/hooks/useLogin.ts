
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "../types";
import { transformUserData, handleAuthError, isProfileComplete } from "../authUtils";

export const useLogin = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const navigate = useNavigate();

  const login = async (email: string, password: string, expectedRole: UserRole) => {
    setLoading(true);
    try {
      console.log("🔵 [useLogin] Attempting login for:", email, "as role:", expectedRole);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("🔴 [useLogin] Login error:", error);
        
        // Check for email not confirmed error
        if (error.message.includes("Email not confirmed") || 
            error.message.includes("email_not_confirmed")) {
          toast.error("Email not verified", {
            description: "Please check your inbox and verify your email before logging in."
          });
          setLoading(false);
          return;
        }
        
        throw new Error(error.message);
      }
      if (!data.user) throw new Error("No user returned.");

      console.log("✅ [useLogin] Login successful, user:", data.user.id);

      // Check if custom email is verified (additional security layer)
      const isCustomEmailVerified = data.user.user_metadata?.custom_email_verified;
      
      if (!isCustomEmailVerified && data.user.app_metadata.provider === 'email') {
        console.log("⚠️ [useLogin] Custom email not verified, checking for verified questionnaires");
        
        // Check if user has any verified questionnaires (alternative verification method)
        const { data: verifiedQuestionnaires, error: qError } = await supabase
          .from("property_questionnaires")
          .select("id")
          .eq("customer_id", data.user.id)
          .not("verified_at", "is", null)
          .limit(1);
        
        if (!qError && verifiedQuestionnaires && verifiedQuestionnaires.length > 0) {
          console.log("✅ [useLogin] User has verified questionnaire, marking as verified");
          // User has a verified questionnaire, mark them as verified via edge function
          const { error: verifyError } = await supabase.functions.invoke(
            "confirm-questionnaire-user",
            { body: { userId: data.user.id } }
          );
          
          if (verifyError) {
            console.error("❌ [useLogin] Failed to verify user via questionnaire:", verifyError);
            await supabase.auth.signOut();
            toast.error("Verification error", {
              description: "Please contact support."
            });
            setLoading(false);
            return;
          }
          
          // Refresh the session to get updated user metadata
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError || !refreshData.session) {
            console.error("❌ [useLogin] Failed to refresh session:", refreshError);
            await supabase.auth.signOut();
            toast.error("Login failed", {
              description: "Please try again."
            });
            setLoading(false);
            return;
          }
          
          console.log("✅ [useLogin] User verified and session refreshed");
          // Continue with login using refreshed user data
          data.user = refreshData.user!;
        } else {
          console.log("⚠️ [useLogin] No verified questionnaires found, email verification required");
          await supabase.auth.signOut();
          toast.error("Email not verified", {
            description: "Please verify your email before logging in. Check your inbox."
          });
          setLoading(false);
          return;
        }
      }

      // Check if user role matches expected role
      const userRole = data.user.user_metadata?.role;
      console.log("🔍 [useLogin] User role:", userRole, "Expected:", expectedRole);
      
      if (userRole !== expectedRole) {
        await supabase.auth.signOut();
        throw new Error(`Invalid role. Please log in as a ${expectedRole}.`);
      }

      // Check for pending questionnaire (for "Get Free Quotes" flow)
      const questionnaireId = localStorage.getItem("questionnaire_id") || sessionStorage.getItem("questionnaire_id");
      let questionnaireWasLinked = false;
      
      if (questionnaireId && expectedRole === "customer") {
        try {
          console.log("🔗 [useLogin] Found pending questionnaire:", questionnaireId);
          
          const { data: existingQuestionnaire, error: fetchError } = await supabase
            .from("property_questionnaires")
            .select("customer_id, status")
            .eq('id', questionnaireId)
            .maybeSingle();
          
          if (fetchError) {
            console.error("❌ [useLogin] Error fetching questionnaire:", fetchError);
          } else if (existingQuestionnaire) {
            console.log("📋 [useLogin] Found questionnaire, current customer_id:", existingQuestionnaire.customer_id);
            
            // Only link if unlinked or already linked to this user
            if (!existingQuestionnaire.customer_id || existingQuestionnaire.customer_id === data.user.id) {
              const { error: updateError } = await supabase
                .from("property_questionnaires")
                .update({
                  customer_id: data.user.id,
                  status: 'draft', // Set as draft so user can edit and upload documents
                  is_completed: false
                })
                .eq('id', questionnaireId);
                
              if (updateError) {
                console.error("❌ [useLogin] Error linking questionnaire:", updateError);
                toast.error("Failed to link your questionnaire");
              } else {
                console.log("✅ [useLogin] Successfully linked questionnaire as draft");
                // Keep the ID so fetch hook can load it - don't clear yet
                localStorage.setItem("questionnaire_linked", "true");
                questionnaireWasLinked = true;
              }
            } else {
              console.log("ℹ️ [useLogin] Questionnaire already linked to different user");
              localStorage.removeItem("questionnaire_id");
              localStorage.removeItem("questionnaire_email");
            }
          }
        } catch (err) {
          console.error("❌ [useLogin] Error processing questionnaire:", err);
        }
      }
      
      // Transform data
      const userData = await transformUserData(data.user);
      setUser(userData);
      
      // Handle redirect and messaging
      if (questionnaireWasLinked) {
        toast.success("Welcome back!", {
          description: "Your solar quotation is ready to complete in My Profile."
        });
        setTimeout(() => navigate("/?tab=profile"), 500);
      } else {
        toast.success("Logged in successfully!");
        
        // Redirect based on completion and role
        if (!isProfileComplete(userData)) {
          navigate("/complete-profile");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error("❌ [useLogin] Login failed:", err);
      handleAuthError(err, "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithOAuth = async (provider: "google" | "twitter") => {
    try {
      console.log("🔵 [useLogin] Starting OAuth login with", provider);
      
      // Store questionnaire ID if present before OAuth redirect
      const questionnaireId = sessionStorage.getItem("questionnaire_id");
      if (questionnaireId) {
        localStorage.setItem("questionnaire_id", questionnaireId);
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error("❌ [useLogin] OAuth error:", error);
        throw error;
      }
      
      console.log("✅ [useLogin] OAuth redirect initiated");
    } catch (error) {
      console.error("❌ [useLogin] OAuth failed:", error);
      handleAuthError(error, "Social login failed. Please try again.");
    }
  };

  return { login, loginWithOAuth };
};
