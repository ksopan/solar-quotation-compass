
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw new Error(error.message);
      if (!data.user) throw new Error("No user returned.");

      // Check if email is confirmed for password auth
      if (!data.user.email_confirmed_at && data.user.app_metadata.provider === 'email') {
        await supabase.auth.signOut();
        throw new Error("Please confirm your email before logging in.");
      }

      // Check if user role matches expected role
      const userRole = data.user.user_metadata?.role;
      if (userRole !== expectedRole) {
        await supabase.auth.signOut();
        throw new Error(`Invalid role. Please log in as a ${expectedRole}.`);
      }

      toast.success("Logged in successfully!");
      
      // Check for pending questionnaire from registration flow (check both localStorage and sessionStorage)
      const questionnaireId = localStorage.getItem("questionnaire_id") || sessionStorage.getItem("questionnaire_id");
      if (questionnaireId && expectedRole === "customer") {
        try {
          console.log("Attempting to link questionnaire:", questionnaireId);
          
          // First check if questionnaire exists and its current state
          const { data: existingQuestionnaire, error: fetchError } = await supabase
            .from("property_questionnaires")
            .select("customer_id, status")
            .eq('id', questionnaireId)
            .single();
          
          if (fetchError) {
            console.error("Error fetching questionnaire:", fetchError);
          } else if (existingQuestionnaire) {
            console.log("Found questionnaire with customer_id:", existingQuestionnaire.customer_id);
            
            // Only link if not already linked to another user
            if (!existingQuestionnaire.customer_id || existingQuestionnaire.customer_id === data.user.id) {
              const { error: updateError } = await supabase
                .from("property_questionnaires")
                .update({
                  customer_id: data.user.id,
                  status: 'submitted',
                  submitted_at: new Date().toISOString()
                })
                .eq('id', questionnaireId);
                
              if (updateError) {
                console.error("Error linking questionnaire to user:", updateError);
                toast.error("Failed to link your questionnaire");
              } else {
                console.log("Successfully linked questionnaire to user:", questionnaireId);
                toast.success("Your solar quotation request has been linked to your account!");
                sessionStorage.removeItem("questionnaire_data");
                sessionStorage.removeItem("questionnaire_id");
                localStorage.removeItem("questionnaire_id");
                localStorage.removeItem("questionnaire_email");
              }
            } else {
              console.log("Questionnaire already linked to different user");
              // Clear the storage since it's not valid
              localStorage.removeItem("questionnaire_id");
              localStorage.removeItem("questionnaire_email");
            }
          }
        } catch (err) {
          console.error("Error processing questionnaire link:", err);
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
