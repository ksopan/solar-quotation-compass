
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { QuestionnaireData } from '../types';

export const useQuestionnaireAttachmentsData = (
  questionnaire: QuestionnaireData | null,
  dispatch: React.Dispatch<any>
) => {
  // Fetch attachments 
  useEffect(() => {
    const fetchAttachments = async () => {
      if (!questionnaire) return;
      
      try {
        dispatch({ type: 'SET_IS_LOADING_FILES', payload: true });
        const { data, error } = await supabase.storage
          .from('questionnaire_attachments')
          .list(questionnaire.id);
          
        if (error) {
          console.error("Error listing files:", error);
          dispatch({ type: 'SET_ATTACHMENTS', payload: [] });
        } else {
          dispatch({ type: 'SET_ATTACHMENTS', payload: data || [] });
        }
      } catch (error) {
        console.error("Error fetching attachments:", error);
        dispatch({ type: 'SET_ATTACHMENTS', payload: [] });
      } finally {
        dispatch({ type: 'SET_IS_LOADING_FILES', payload: false });
      }
    };
    
    fetchAttachments();
  }, [questionnaire, dispatch]);
};
