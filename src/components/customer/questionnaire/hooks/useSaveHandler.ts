
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QuestionnaireData } from '../types';

/**
 * Hook for handling save operations in the questionnaire
 */
export const useSaveHandler = (
  user: any,
  questionnaire: QuestionnaireData | null,
  formData: Partial<QuestionnaireData> | null,
  dispatch: React.Dispatch<any>
) => {
  // Handle saving changes
  const handleSave = useCallback(async () => {
    if (!formData) return;
    
    try {
      dispatch({ type: 'SET_IS_SAVING', payload: true });
      
      if (questionnaire) {
        // Update existing questionnaire
        console.log("Updating questionnaire with:", formData);
        
        const { error } = await supabase
          .from("property_questionnaires")
          .update({
            ...formData,
            email: formData.email || questionnaire.email || "",
            first_name: formData.first_name || questionnaire.first_name || "",
            last_name: formData.last_name || questionnaire.last_name || "",
            interested_in_batteries: formData.interested_in_batteries !== undefined 
              ? formData.interested_in_batteries 
              : questionnaire.interested_in_batteries,
            willing_to_remove_trees: formData.willing_to_remove_trees !== undefined
              ? formData.willing_to_remove_trees
              : questionnaire.willing_to_remove_trees,
            updated_at: new Date().toISOString()
          })
          .eq("id", questionnaire.id);
          
        if (error) {
          console.error("Error updating questionnaire:", error);
          toast.error("Failed to save your changes");
          return;
        }
        
        // Update the questionnaire with the form data
        dispatch({ type: 'SET_QUESTIONNAIRE', payload: {
          ...questionnaire,
          ...formData
        } as QuestionnaireData });
      } else if (user) {
        // Create new questionnaire
        console.log("Creating new questionnaire for user:", user.id);
        
        // Ensure all required fields are present
        const questionnaireData = {
          property_type: formData.property_type || "home",
          ownership_status: formData.ownership_status || "own",
          monthly_electric_bill: formData.monthly_electric_bill || 0,
          interested_in_batteries: formData.interested_in_batteries !== undefined ? formData.interested_in_batteries : false,
          battery_reason: formData.battery_reason || null,
          purchase_timeline: formData.purchase_timeline || "within_year",
          willing_to_remove_trees: formData.willing_to_remove_trees !== undefined ? formData.willing_to_remove_trees : false,
          roof_age_status: formData.roof_age_status || "no",
          first_name: formData.first_name || "",
          last_name: formData.last_name || "",
          email: formData.email || "",
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
          return;
        }
        
        console.log("Created new questionnaire:", newQuestionnaire);
        
        // Set the new questionnaire
        dispatch({ type: 'SET_QUESTIONNAIRE', payload: newQuestionnaire as QuestionnaireData });
        toast.success("Your profile has been created");
      }
      
      // Exit edit mode
      dispatch({ type: 'SET_IS_EDITING', payload: false });
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast.error("An error occurred while saving your changes");
    } finally {
      dispatch({ type: 'SET_IS_SAVING', payload: false });
    }
  }, [formData, questionnaire, user, dispatch]);

  return {
    handleSave
  };
};
