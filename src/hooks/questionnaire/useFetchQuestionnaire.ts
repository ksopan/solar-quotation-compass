
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
        
        const wasLinked = localStorage.getItem("questionnaire_linked");
        const storedQuestionnaireId = localStorage.getItem("questionnaire_id") || 
                                      sessionStorage.getItem("questionnaire_id");
        
        console.log("📊 [useFetchQuestionnaire] Fetching for user:", user.id);
        console.log("📊 [useFetchQuestionnaire] Was linked?", wasLinked, "Stored ID:", storedQuestionnaireId);
        
        // Always fetch the user's primary questionnaire first
        const { data, error } = await supabase
          .from("property_questionnaires")
          .select("*")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (error) {
          console.error("❌ [useFetchQuestionnaire] Error:", error);
          toast.error("Failed to load your questionnaire data");
        } else if (data) {
          console.log("✅ [useFetchQuestionnaire] Found questionnaire:", {
            id: data.id,
            status: data.status,
            is_completed: data.is_completed
          });
          setQuestionnaire(data as QuestionnaireData);
          
          // Clean up after successful fetch if it was linked
          if (wasLinked || storedQuestionnaireId) {
            console.log("🧹 [useFetchQuestionnaire] Cleaning up storage");
            localStorage.removeItem("questionnaire_id");
            localStorage.removeItem("questionnaire_email");
            localStorage.removeItem("questionnaire_data");
            localStorage.removeItem("questionnaire_linked");
            sessionStorage.removeItem("questionnaire_id");
            sessionStorage.removeItem("questionnaire_email");
            sessionStorage.removeItem("questionnaire_data");
          }
        } else if (storedQuestionnaireId && !wasLinked) {
          // Fallback: If no questionnaire found but we have stored ID, try to link it
          console.log("🔗 [useFetchQuestionnaire] Fallback linking:", storedQuestionnaireId);
          
          const { data: existingQuestionnaire, error: fetchError } = await supabase
            .from("property_questionnaires")
            .select("*")
            .eq("id", storedQuestionnaireId)
            .maybeSingle();
          
          if (!fetchError && existingQuestionnaire) {
            if (!existingQuestionnaire.customer_id || existingQuestionnaire.customer_id === user.id) {
              const { data: updatedQuestionnaire, error: updateError } = await supabase
                .from("property_questionnaires")
                .update({ 
                  customer_id: user.id,
                  status: 'draft',
                  is_completed: false
                })
                .eq("id", storedQuestionnaireId)
                .select()
                .single();
                
              if (!updateError) {
                console.log("✅ [useFetchQuestionnaire] Fallback link successful");
                setQuestionnaire(updatedQuestionnaire as QuestionnaireData);
                toast.success("Your solar questionnaire has been loaded!");
              } else {
                console.error("❌ [useFetchQuestionnaire] Fallback link failed:", updateError);
              }
            }
          }
          
          // Clean up storage
          localStorage.removeItem("questionnaire_id");
          localStorage.removeItem("questionnaire_email");
          localStorage.removeItem("questionnaire_data");
          sessionStorage.removeItem("questionnaire_id");
          sessionStorage.removeItem("questionnaire_email");
          sessionStorage.removeItem("questionnaire_data");
        } else {
          console.log("ℹ️ [useFetchQuestionnaire] No questionnaire found for user");
          setQuestionnaire(null);
        }
      } catch (error) {
        console.error("❌ [useFetchQuestionnaire] Error:", error);
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
