
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { QuestionnaireData } from "./useQuestionnaireBase";

export const useQuestionnaireUpdate = () => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  // Update questionnaire data
  const updateQuestionnaire = async (
    questionnaire: QuestionnaireData | null,
    updatedData: Partial<QuestionnaireData>
  ) => {
    if (!user || !questionnaire) return false;
    
    try {
      setIsSaving(true);
      console.log("Updating questionnaire with:", updatedData);
      
      // Ensure required fields are present
      const dataToUpdate = {
        ...updatedData,
        email: updatedData.email || questionnaire.email || "",
        first_name: updatedData.first_name || questionnaire.first_name || "",
        last_name: updatedData.last_name || questionnaire.last_name || "",
        interested_in_batteries: updatedData.interested_in_batteries !== undefined 
          ? updatedData.interested_in_batteries 
          : questionnaire.interested_in_batteries,
        willing_to_remove_trees: updatedData.willing_to_remove_trees !== undefined
          ? updatedData.willing_to_remove_trees
          : questionnaire.willing_to_remove_trees,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from("property_questionnaires")
        .update(dataToUpdate)
        .eq("id", questionnaire.id)
        .eq("customer_id", user.id);
      
      if (error) {
        console.error("Error updating questionnaire:", error);
        toast.error("Failed to save your changes");
        return false;
      }
      
      toast.success("Your information has been updated");
      return true;
    } catch (error) {
      console.error("Error in updateQuestionnaire:", error);
      toast.error("An error occurred while saving your changes");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { 
    updateQuestionnaire,
    isSaving
  };
};
