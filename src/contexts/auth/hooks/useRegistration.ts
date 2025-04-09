
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
      // First check if the email already exists
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
        toast.error("Registration failed", {
          description: "This email is already registered. Please use a different email or try to log in."
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
        throw new Error(error.message);
      }

      if (data.user) {
        // Check if there's a questionnaire data in session storage and process it
        const questionnaireDataStr = sessionStorage.getItem("questionnaire_data");
        const questionnaireId = sessionStorage.getItem("questionnaire_id");
        
        if (questionnaireDataStr && userData.role === "customer") {
          try {
            const questionnaireData = JSON.parse(questionnaireDataStr);
            console.log("Creating quotation request from questionnaire data:", questionnaireData);
            
            // Create a quotation request from the questionnaire data
            const { error: quotationError } = await supabase
              .from("quotation_requests")
              .insert({
                customer_id: data.user.id,
                location: questionnaireData.address || userData.address || "Not specified",
                roof_type: "unknown", // Default value, could be improved with more questionnaire data
                roof_area: 0, // Default value, could be improved with more questionnaire data
                energy_usage: questionnaireData.monthly_electric_bill || 0,
                additional_notes: `Property type: ${questionnaireData.property_type}
Ownership status: ${questionnaireData.ownership_status}
Interested in batteries: ${questionnaireData.interested_in_batteries ? 'Yes' : 'No'}
${questionnaireData.battery_reason ? 'Battery reason: ' + questionnaireData.battery_reason : ''}
Purchase timeline: ${questionnaireData.purchase_timeline}
Willing to remove trees: ${questionnaireData.willing_to_remove_trees ? 'Yes' : 'No'}
Roof age status: ${questionnaireData.roof_age_status}`
              });
              
            if (quotationError) {
              console.error("Error creating quotation request:", quotationError);
            } else {
              console.log("Successfully created quotation request from questionnaire");
            }
            
            // Clear the questionnaire data from session storage
            sessionStorage.removeItem("questionnaire_data");
          } catch (parseError) {
            console.error("Error parsing questionnaire data:", parseError);
          }
        }
        
        // Update the questionnaire with the user ID if there's a questionnaire ID
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
