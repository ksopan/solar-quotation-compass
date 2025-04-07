
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QuestionnaireData } from '../types';

export const useQuestionnaireData = (
  user: any,
  dispatch: React.Dispatch<any>
) => {
  // Fetch questionnaire data
  useEffect(() => {
    const fetchQuestionnaire = async () => {
      if (!user) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      try {
        // First, try to find questionnaires explicitly associated with this user
        let { data, error } = await supabase
          .from("property_questionnaires")
          .select("*")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
          
        if (error) {
          if (error.code === "PGRST116") {
            console.log("No questionnaire directly associated with user. Checking for unassociated questionnaires...");
            
            // Check session storage for a questionnaire ID
            const sessionQuestionnaireId = sessionStorage.getItem("questionnaire_id");
            
            if (sessionQuestionnaireId) {
              // Try to get that questionnaire
              const { data: unassociatedData, error: unassociatedError } = await supabase
                .from("property_questionnaires")
                .select("*")
                .eq("id", sessionQuestionnaireId)
                .single();
                
              if (!unassociatedError && unassociatedData) {
                console.log("Found unassociated questionnaire, associating with user:", user.id);
                
                // Associate it with this user
                const { error: updateError } = await supabase
                  .from("property_questionnaires")
                  .update({ customer_id: user.id })
                  .eq("id", sessionQuestionnaireId);
                  
                if (updateError) {
                  console.error("Error associating questionnaire with user:", updateError);
                } else {
                  console.log("Successfully associated questionnaire with user");
                  data = { ...unassociatedData, customer_id: user.id };
                  sessionStorage.removeItem("questionnaire_id");
                }
              }
            }
            
            if (!data) {
              // No questionnaire found, let the user create one
              dispatch({ type: 'SET_QUESTIONNAIRE', payload: null });
            }
          } else {
            console.error("Error fetching questionnaire:", error);
            toast.error("Failed to load your questionnaire data");
          }
        }
        
        if (data) {
          console.log("Fetched questionnaire:", data);
          dispatch({ type: 'SET_QUESTIONNAIRE', payload: data as QuestionnaireData });
          dispatch({ type: 'SET_FORM_DATA', payload: {...data} });
          
          // Set submit button visibility
          if (data.is_completed === false) {
            dispatch({ type: 'SET_SHOW_SUBMIT_BUTTON', payload: true });
          }
        }
      } catch (error) {
        console.error("Error in fetchQuestionnaire:", error);
        toast.error("An error occurred while loading your questionnaire data");
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchQuestionnaire();
  }, [user, dispatch]);
};
