
import { useCallback } from "react";
import { QuestionnaireData } from "../types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for handling questionnaire update operations
 */
export const useQuestionnaireUpdate = (
  questionnaire: QuestionnaireData | null,
  setSaving: (isSaving: boolean) => void
) => {
  const updateQuestionnaire = useCallback(async (data: Partial<QuestionnaireData>) => {
    if (!questionnaire) return false;
    
    setSaving(true);
    try {
      console.log("Updating questionnaire with:", data);
      
      const { error } = await supabase
        .from("property_questionnaires")
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq("id", questionnaire.id);
        
      if (error) {
        console.error("Error updating questionnaire:", error);
        toast.error("Failed to save your changes");
        return false;
      }
      
      toast.success("Profile saved successfully");
      return true;
    } catch (error) {
      console.error("Error in updateQuestionnaire:", error);
      toast.error("An error occurred while saving your changes");
      return false;
    } finally {
      setSaving(false);
    }
  }, [questionnaire, setSaving]);
  
  const handleSubmitProfile = useCallback(async () => {
    if (!questionnaire) return;
    
    try {
      const { error } = await supabase
        .from("property_questionnaires")
        .update({ is_completed: true })
        .eq("id", questionnaire.id);
        
      if (error) {
        console.error("Error submitting profile:", error);
        toast.error("Failed to submit your profile");
        return;
      }
      
      toast.success("Your profile has been submitted successfully!");
    } catch (error) {
      console.error("Error in handleSubmitProfile:", error);
      toast.error("An error occurred while submitting your profile");
    }
  }, [questionnaire]);
  
  return {
    updateQuestionnaire,
    handleSubmitProfile
  };
};
