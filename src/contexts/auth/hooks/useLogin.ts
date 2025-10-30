
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
      
      // Check for questionnaire data in sessionStorage (from registration flow)
      const questionnaireData = sessionStorage.getItem("questionnaire_data");
      if (questionnaireData && expectedRole === "customer") {
        try {
          const parsedData = JSON.parse(questionnaireData);
          
          // Save questionnaire data with user ID
          const { error: insertError } = await supabase
            .from("property_questionnaires")
            .insert({
              property_type: parsedData.property_type,
              ownership_status: parsedData.ownership_status,
              monthly_electric_bill: parsedData.monthly_electric_bill,
              interested_in_batteries: parsedData.interested_in_batteries,
              battery_reason: parsedData.battery_reason,
              purchase_timeline: parsedData.purchase_timeline,
              willing_to_remove_trees: parsedData.willing_to_remove_trees,
              roof_age_status: parsedData.roof_age_status,
              first_name: parsedData.first_name,
              last_name: parsedData.last_name,
              email: parsedData.email,
              customer_id: data.user.id,
              is_completed: true
            });
            
          if (insertError) {
            console.error("Error saving questionnaire data after login:", insertError);
            toast.error("Failed to save your questionnaire data");
          } else {
            console.log("Successfully saved questionnaire after login");
            toast.success("Your questionnaire has been saved!");
            sessionStorage.removeItem("questionnaire_data");
          }
        } catch (err) {
          console.error("Error processing questionnaire data after login:", err);
        }
      }
      
      // Transform data
      const userData = transformUserData(data.user);
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
