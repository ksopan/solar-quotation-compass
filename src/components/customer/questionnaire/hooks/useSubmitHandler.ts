
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
        .update({ 
          is_completed: true,
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq("id", questionnaire.id);
        
      if (error) {
        console.error("Error submitting profile:", error);
        toast.error("Failed to submit your profile");
        return;
      }
      
      // Send notification to vendors
      try {
        await supabase.functions.invoke('notify-vendor-questionnaire', {
          body: {
            questionnaireId: questionnaire.id,
            customerName: `${questionnaire.first_name} ${questionnaire.last_name}`,
            customerEmail: questionnaire.email,
            propertyType: questionnaire.property_type,
            monthlyBill: questionnaire.monthly_electric_bill
          }
        });
        console.log("Vendor notification sent");
      } catch (notifError) {
        console.error("Error sending vendor notification:", notifError);
        // Don't fail the submission if notification fails
      }
      
      // Update local state
      dispatch({ 
        type: 'SET_QUESTIONNAIRE', 
        payload: { ...questionnaire, is_completed: true, status: 'submitted', submitted_at: new Date().toISOString() } 
      });
      dispatch({ type: 'SET_SHOW_SUBMIT_BUTTON', payload: false });
      
      toast.success("Your profile has been submitted successfully! Vendors will be notified.");
    } catch (error) {
      console.error("Error in handleSubmitProfile:", error);
      toast.error("An error occurred while submitting your profile");
    }
  }, [questionnaire, dispatch]);

  return {
    handleSubmitProfile
  };
};
