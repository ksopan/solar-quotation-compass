
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

/**
 * Processes OAuth questionnaire ID from localStorage if present
 * @param user The authenticated user
 * @returns Promise resolving when OAuth flow is handled
 */
export const handleOAuthQuestionnaire = async (user: User | null): Promise<void> => {
  if (!user) return;
  
  // Check if there's a questionnaire ID in localStorage (from OAuth flow)
  const oauthQuestionnaireId = localStorage.getItem("questionnaire_id");
  if (!oauthQuestionnaireId) return;
  
  console.log("Found OAuth questionnaire ID:", oauthQuestionnaireId);
  
  try {
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
  } catch (error) {
    console.error("Error in OAuth questionnaire handling:", error);
  }
};
