
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QuestionnaireData } from '../types';

/**
 * Hook for handling profile submission
 */
export const useSubmitHandler = (
  questionnaire: QuestionnaireData | null,
  dispatch: React.Dispatch<any>
) => {
  // Handle submitting profile
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
      
      // Update local state
      dispatch({ 
        type: 'SET_QUESTIONNAIRE', 
        payload: { ...questionnaire, is_completed: true } 
      });
      dispatch({ type: 'SET_SHOW_SUBMIT_BUTTON', payload: false });
      
      toast.success("Your profile has been submitted successfully!");
    } catch (error) {
      console.error("Error in handleSubmitProfile:", error);
      toast.error("An error occurred while submitting your profile");
    }
  }, [questionnaire, dispatch]);

  return {
    handleSubmitProfile
  };
};
