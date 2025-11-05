
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
        
        // Check if there's a questionnaire that was just linked during registration
        const wasLinked = localStorage.getItem("questionnaire_linked");
        const storedQuestionnaireId = localStorage.getItem("questionnaire_id") || 
                                      sessionStorage.getItem("questionnaire_id");
        
        console.log("📊 [useFetchQuestionnaire] Fetching questionnaire for user:", user.id);
        console.log("📊 [useFetchQuestionnaire] Was linked?", wasLinked, "Stored ID:", storedQuestionnaireId);
        
        // First, try to fetch the user's questionnaire from the database
        const { data, error } = await supabase
          .from("property_questionnaires")
          .select("*")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (error) {
          console.error("❌ [useFetchQuestionnaire] Error fetching questionnaire:", error);
          toast.error("Failed to load your questionnaire data");
        } else if (data) {
          console.log("✅ [useFetchQuestionnaire] Found questionnaire:", {
            id: data.id,
            status: data.status,
            is_completed: data.is_completed,
            has_data: !!data.property_type
          });
          setQuestionnaire(data as QuestionnaireData);
          
          // Clean up localStorage after successful fetch
          if (wasLinked) {
            console.log("🧹 [useFetchQuestionnaire] Cleaning up localStorage after successful fetch");
            localStorage.removeItem("questionnaire_id");
            localStorage.removeItem("questionnaire_email");
            localStorage.removeItem("questionnaire_data");
            localStorage.removeItem("questionnaire_linked");
            sessionStorage.removeItem("questionnaire_id");
            sessionStorage.removeItem("questionnaire_email");
            sessionStorage.removeItem("questionnaire_data");
          }
        } else if (storedQuestionnaireId && !wasLinked) {
          // If we have a stored ID but no data was found, try to link it
          // This handles the case where registration didn't link it properly
          console.log("🔗 [useFetchQuestionnaire] Attempting to link stored questionnaire:", storedQuestionnaireId);
          
          // First, fetch the questionnaire to check its current state
          const { data: existingQuestionnaire, error: fetchError } = await supabase
            .from("property_questionnaires")
            .select("*")
            .eq("id", storedQuestionnaireId)
            .maybeSingle();
          
          if (!fetchError && existingQuestionnaire) {
            console.log("📋 [useFetchQuestionnaire] Found existing questionnaire:", {
              id: existingQuestionnaire.id,
              customer_id: existingQuestionnaire.customer_id,
              status: existingQuestionnaire.status
            });
            
            // Only link if questionnaire is unlinked OR already linked to this user
            if (!existingQuestionnaire.customer_id || existingQuestionnaire.customer_id === user.id) {
              console.log("🔗 [useFetchQuestionnaire] Linking questionnaire to user...");
              
              const { data: updatedQuestionnaire, error: updateError } = await supabase
                .from("property_questionnaires")
                .update({ 
                  customer_id: user.id,
                  status: 'draft',  // Set to draft so user can edit
                  is_completed: false
                })
                .eq("id", storedQuestionnaireId)
                .select()
                .single();
                
              if (updateError) {
                console.error("❌ [useFetchQuestionnaire] Error linking questionnaire:", updateError);
                toast.error("Failed to link your questionnaire");
              } else {
                console.log("✅ [useFetchQuestionnaire] Successfully linked questionnaire");
                setQuestionnaire(updatedQuestionnaire as QuestionnaireData);
                toast.success("Your solar questionnaire has been loaded!");
                
                // Clean up storage after successful link
                localStorage.removeItem("questionnaire_id");
                localStorage.removeItem("questionnaire_email");
                localStorage.removeItem("questionnaire_data");
                sessionStorage.removeItem("questionnaire_id");
                sessionStorage.removeItem("questionnaire_email");
                sessionStorage.removeItem("questionnaire_data");
              }
            } else {
              console.log("ℹ️ [useFetchQuestionnaire] Questionnaire already linked to different user");
              // Clean up storage since it's not valid for this user
              localStorage.removeItem("questionnaire_id");
              localStorage.removeItem("questionnaire_email");
              sessionStorage.removeItem("questionnaire_id");
            }
          } else {
            console.log("ℹ️ [useFetchQuestionnaire] Could not find questionnaire with stored ID");
            // Clean up invalid storage
            localStorage.removeItem("questionnaire_id");
            localStorage.removeItem("questionnaire_email");
            sessionStorage.removeItem("questionnaire_id");
          }
        } else {
          console.log("ℹ️ [useFetchQuestionnaire] No questionnaire found for user");
          setQuestionnaire(null);
        }
      } catch (error) {
        console.error("❌ [useFetchQuestionnaire] Error in fetchQuestionnaire:", error);
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
