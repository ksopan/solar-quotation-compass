
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
