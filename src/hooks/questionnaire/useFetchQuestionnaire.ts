
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { QuestionnaireData } from "./useQuestionnaireBase";

export const useFetchQuestionnaire = () => {
  const { user } = useAuth();
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch questionnaire data on mount
  useEffect(() => {
    const fetchQuestionnaire = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Check both localStorage and sessionStorage for questionnaire ID
        const storedQuestionnaireId = localStorage.getItem("questionnaire_id") || 
                                      sessionStorage.getItem("questionnaire_id");
        const storedEmail = localStorage.getItem("questionnaire_email") || 
                           sessionStorage.getItem("questionnaire_email");
        
        if (storedQuestionnaireId) {
          console.log("Found stored questionnaire ID:", storedQuestionnaireId);
          
          // First, fetch the questionnaire to check its current state
          const { data: existingQuestionnaire, error: fetchError } = await supabase
            .from("property_questionnaires")
            .select("*")
            .eq("id", storedQuestionnaireId)
            .maybeSingle();
          
          if (!fetchError && existingQuestionnaire) {
            console.log("Found existing questionnaire:", existingQuestionnaire);
            
            // Only link if questionnaire is unlinked OR already linked to this user
            if (!existingQuestionnaire.customer_id || existingQuestionnaire.customer_id === user.id) {
              console.log("Linking questionnaire to user...");
              
              const { error: updateError } = await supabase
                .from("property_questionnaires")
                .update({ 
                  customer_id: user.id,
                  status: 'draft',  // Set to draft so user can edit and upload documents
                  is_completed: false
                })
                .eq("id", storedQuestionnaireId);
                
              if (updateError) {
                console.error("Error linking questionnaire:", updateError);
              } else {
                console.log("Successfully linked questionnaire to user");
              }
            } else {
              console.log("Questionnaire already linked to different user, skipping");
            }
          } else {
            console.log("Could not find questionnaire with ID:", storedQuestionnaireId);
          }
          
          // Clean up storage after processing
          localStorage.removeItem("questionnaire_id");
          localStorage.removeItem("questionnaire_email");
          localStorage.removeItem("questionnaire_data");
          sessionStorage.removeItem("questionnaire_id");
          sessionStorage.removeItem("questionnaire_email");
          sessionStorage.removeItem("questionnaire_data");
        }
        
        // Fetch the user's questionnaire
        const { data, error } = await supabase
          .from("property_questionnaires")
          .select("*")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching questionnaire:", error);
          toast.error("Failed to load your questionnaire data");
        } else if (data) {
          console.log("Fetched questionnaire:", data);
          setQuestionnaire(data as QuestionnaireData);
        } else {
          console.log("No questionnaire found for user");
          setQuestionnaire(null);
        }
      } catch (error) {
        console.error("Error in fetchQuestionnaire:", error);
        toast.error("An error occurred while loading your questionnaire data");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionnaire();
  }, [user]);

  return { 
    questionnaire, 
    setQuestionnaire, 
    loading, 
    isSaving, 
    setIsSaving 
  };
};
