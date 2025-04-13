
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { QuestionnaireData } from '../types';
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export const useQuestionnaireAttachmentsData = (
  questionnaire: QuestionnaireData | null,
  dispatch: React.Dispatch<any>
) => {
  const { user } = useAuth();
  
  // Fetch attachments 
  useEffect(() => {
    const fetchAttachments = async () => {
      if (!user) return;
      
      try {
        dispatch({ type: 'SET_IS_LOADING_FILES', payload: true });
        
        const { data, error } = await supabase.storage
          .from('quotation_document_files')
          .list(user.id);
          
        if (error) {
          console.error("Error listing files:", error);
          dispatch({ type: 'SET_ATTACHMENTS', payload: [] });
        } else if (data) {
          // Transform FileObject into the expected format with the required size property
          const formattedData = data.map(file => ({
            name: file.name,
            size: file.metadata?.size || 0,
            id: file.id
          }));
          
          dispatch({ type: 'SET_ATTACHMENTS', payload: formattedData });
        } else {
          dispatch({ type: 'SET_ATTACHMENTS', payload: [] });
        }
      } catch (error) {
        console.error("Error fetching attachments:", error);
        dispatch({ type: 'SET_ATTACHMENTS', payload: [] });
      } finally {
        dispatch({ type: 'SET_IS_LOADING_FILES', payload: false });
      }
    };
    
    fetchAttachments();
  }, [user, dispatch]);
};
