
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { QuestionnaireData } from "./useQuestionnaireBase";

export const useQuestionnaireCreate = () => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Create a new questionnaire for the user if they don't have one
  const createQuestionnaire = async (data: Partial<QuestionnaireData>) => {
    if (!user) return null;
    
    try {
      setIsSaving(true);
      console.log("Creating new questionnaire for user:", user.id);
      
      // Ensure all required fields are present
      const questionnaireData = {
        property_type: data.property_type || "home",
        ownership_status: data.ownership_status || "own",
        monthly_electric_bill: data.monthly_electric_bill || 0,
        interested_in_batteries: data.interested_in_batteries !== undefined ? data.interested_in_batteries : false,
        battery_reason: data.battery_reason || null,
        purchase_timeline: data.purchase_timeline || "within_year",
        willing_to_remove_trees: data.willing_to_remove_trees !== undefined ? data.willing_to_remove_trees : false,
        roof_age_status: data.roof_age_status || "no",
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        customer_id: user.id,
        is_completed: false
      };
      
      console.log("Submitting questionnaire data:", questionnaireData);
      
      const { data: newQuestionnaire, error } = await supabase
        .from("property_questionnaires")
        .insert(questionnaireData)
        .select()
        .single();
      
      if (error) {
        console.error("Error creating questionnaire:", error);
        toast.error("Failed to create your profile");
        return null;
      }
      
      console.log("Created new questionnaire:", newQuestionnaire);
      toast.success("Your profile has been created");
      return newQuestionnaire;
    } catch (error) {
      console.error("Error in createQuestionnaire:", error);
      toast.error("An error occurred while creating your profile");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return { 
    createQuestionnaire,
    isSaving
  };
};
