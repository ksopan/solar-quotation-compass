
import { useCallback } from "react";
import { QuestionnaireData } from "../types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for handling questionnaire creation operations
 */
export const useQuestionnaireCreate = (
  user: any | null,
  setSaving: (isSaving: boolean) => void
) => {
  const createQuestionnaire = useCallback(async (data: Partial<QuestionnaireData>) => {
    if (!user) return null;
    
    setSaving(true);
    try {
      console.log("Creating new questionnaire with data:", data);
      
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
      
      toast.success("Your profile has been created");
      return newQuestionnaire;
    } catch (error) {
      console.error("Error in createQuestionnaire:", error);
      toast.error("An error occurred while creating your profile");
      return null;
    } finally {
      setSaving(false);
    }
  }, [user, setSaving]);
  
  return {
    createQuestionnaire
  };
};
