
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
      console.log("Attempting login for:", email, "as role:", expectedRole);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Login error:", error);
        throw new Error(error.message);
      }
      if (!data.user) throw new Error("No user returned.");

      console.log("Login successful, user data:", data.user.id, data.user.email);

      // Check if email is confirmed
      const isEmailConfirmed = data.user.email_confirmed_at || data.user.user_metadata?.email_verified;
      if (!isEmailConfirmed && data.user.app_metadata.provider === 'email') {
        await supabase.auth.signOut();
        throw new Error("Please confirm your email before logging in.");
      }

      // Check if user role matches expected role
      const userRole = data.user.user_metadata?.role;
      console.log("User role from metadata:", userRole, "Expected:", expectedRole);
      
      if (userRole !== expectedRole) {
        await supabase.auth.signOut();
        throw new Error(`Invalid role. Please log in as a ${expectedRole}.`);
      }

      toast.success("Logged in successfully!");
      
      // Check for pending questionnaire from registration flow
      const questionnaireId = localStorage.getItem("questionnaire_id") || sessionStorage.getItem("questionnaire_id");
      const wasLinked = localStorage.getItem("questionnaire_linked");

      if (questionnaireId && expectedRole === "customer") {
        try {
          console.log("🔗 [useLogin] Found pending questionnaire:", questionnaireId);
          console.log("🔗 [useLogin] Was linked during registration?", wasLinked);
          
          // Check if questionnaire exists and its current state
          const { data: existingQuestionnaire, error: fetchError } = await supabase
            .from("property_questionnaires")
            .select("customer_id, status")
            .eq('id', questionnaireId)
            .single();
          
          if (fetchError) {
            console.error("❌ [useLogin] Error fetching questionnaire:", fetchError);
          } else if (existingQuestionnaire) {
            console.log("📋 [useLogin] Found questionnaire with customer_id:", existingQuestionnaire.customer_id);
            
            // Only link if not already linked to another user
            if (!existingQuestionnaire.customer_id || existingQuestionnaire.customer_id === data.user.id) {
              const { error: updateError } = await supabase
                .from("property_questionnaires")
                .update({
                  customer_id: data.user.id,
                  status: 'draft', // Set to draft for editing
                  is_completed: false
                })
                .eq('id', questionnaireId);
                
              if (updateError) {
                console.error("❌ [useLogin] Error linking questionnaire:", updateError);
              } else {
                console.log("✅ [useLogin] Successfully linked questionnaire to user");
                toast.success("Your solar questionnaire has been linked to your account!");
                
                // Mark as linked so fetch hook knows
                localStorage.setItem("questionnaire_linked", "true");
                // Keep the ID so fetch hook can retrieve it
                // Don't clear yet - let useFetchQuestionnaire handle cleanup after fetch
              }
            } else {
              console.log("ℹ️ [useLogin] Questionnaire already linked to different user");
              // Clear the storage since it's not valid
              localStorage.removeItem("questionnaire_id");
              localStorage.removeItem("questionnaire_email");
            }
          }
        } catch (err) {
          console.error("❌ [useLogin] Error processing questionnaire link:", err);
        }
      }
      
      // Transform data
      const userData = await transformUserData(data.user);
      setUser(userData);
      
      // Redirect based on completion and role
      if (!isProfileComplete(userData)) {
        navigate("/complete-profile");
      } else {
        navigate("/");
      }
    } catch (err) {
      handleAuthError(err, "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithOAuth = async (provider: "google" | "twitter") => {
    try {
      // Only allow customers to use OAuth
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

      if (error) throw error;
      
      // The redirect happens automatically, this runs after return
    } catch (error) {
      handleAuthError(error, "Social login failed. Please try again.");
    }
  };

  return { login, loginWithOAuth };
};
