
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
        const { data, error } = await supabase
          .from("property_questionnaires")
          .select("*")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
          
        if (error) {
          if (error.code === "PGRST116") {
            // No questionnaire found - this is not an error
            console.log("No questionnaire found for user");
            dispatch({ type: 'SET_QUESTIONNAIRE', payload: null });
          } else {
            console.error("Error fetching questionnaire:", error);
            toast.error("Failed to load your questionnaire data");
          }
        } else if (data) {
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
