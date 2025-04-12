
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { User as AuthUser } from "@/contexts/auth/types";
import { toast } from "sonner";
import { QuestionnaireData } from "../useQuestionnaireBase";

/**
 * Fetches questionnaire data for a specific user
 * @param user The authenticated user
 * @returns Promise with the questionnaire data or null
 */
export const fetchQuestionnaireData = async (user: AuthUser | SupabaseUser | null): Promise<QuestionnaireData | null> => {
  if (!user) return null;
  
  try {
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
        return null;
      } else {
        console.error("Error fetching questionnaire:", error);
        toast.error("Failed to load your questionnaire data");
        return null;
      }
    }
    
    console.log("Fetched questionnaire:", data);
    return data as QuestionnaireData;
  } catch (error) {
    console.error("Error in fetchQuestionnaireData:", error);
    toast.error("An error occurred while loading your questionnaire data");
    return null;
  }
};
