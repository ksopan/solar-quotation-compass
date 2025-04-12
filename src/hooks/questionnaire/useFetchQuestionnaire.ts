
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
        
        // Check if there's a questionnaire ID in localStorage (from OAuth flow)
        const oauthQuestionnaireId = localStorage.getItem("questionnaire_id");
        if (oauthQuestionnaireId) {
          console.log("Found OAuth questionnaire ID:", oauthQuestionnaireId);
          
          // Associate this questionnaire with the user
          const { error: updateError } = await supabase
            .from("property_questionnaires")
            .update({ customer_id: user.id })
            .eq("id", oauthQuestionnaireId);
            
          if (updateError) {
            console.error("Error associating questionnaire with user:", updateError);
          } else {
            console.log("Successfully associated questionnaire with user");
            // Remove the ID from localStorage
            localStorage.removeItem("questionnaire_id");
          }
        }
        
        // Fetch the user's questionnaire
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
            setQuestionnaire(null);
          } else {
            console.error("Error fetching questionnaire:", error);
            toast.error("Failed to load your questionnaire data");
          }
        } else if (data) {
          console.log("Fetched questionnaire:", data);
          setQuestionnaire(data as QuestionnaireData);
        }
      } catch (error) {
        console.error("Error in fetchQuestionnaire:", error);
        toast.error("An error occurred while loading your questionnaire data");
      } finally {
        // Always set loading to false when the fetch completes
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
